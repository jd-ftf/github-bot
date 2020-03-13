const githubClient = require('../lib/github-client')
const { createComment } = require('../common/github')

/** commit message 格式 **/
const commitRE = /^.{1,20}(\(.+\))?: .{1,50}/
/** message映射表 **/
const message = {
  exceed: 'Please use rebase to squash the number of your commit to only one except merge history.\n',
  format: '   ERROR invalid commit message format.\n\n' +
    '  Proper commit message format is required for automated changelog generation. Examples:\n\n' +
    '    feat(compiler): add \'comments\' option\n' +
    '    fix(v-model): handle events on blur (close #28)\n\n' +
    '  See [.github/CONTRIBUTING.md](https://github.com/jd-ftf/wot-design-mini/blob/dev/.github/CONTRIBUTING.md) for more details.\n',
  suggest: 'After dealing with it you can reopen the PR or create a new PR.'
}

/**
 * @description 获取PR的所有commit message
 * @param {String} owner
 * @param {String} repo
 * @param {Number} pull_number
 * @return {Array<String>}
 */
async function listAllCommit (owner, repo, pull_number) {
  let pageNumber = 1
  let result = []
  while (true) {
    const { data: items } = await githubClient.pulls.listCommits({
      owner,
      repo,
      pull_number,
      per_page: 100,
      page: pageNumber++
    })
    if (items.length === 0) break
    const message = items.map(({ commit }) => commit.message)
    result = result.concat(message)
  }
  return Array.from(new Set(result))
}

/**
 * @description 检查 commit message是否遵循规范
 * @param {Array<String>} msgs
 * @return {String} 格式不正确时的错误原因
 */
function checkMsgs (msgs) {
  if (msgs.length !== 1) {
    return message.exceed
  }
  const [commit] = msgs
  if (commitRE.test(commit)) return ''
  // commit message格式无法通过校验
  return message.format
}

async function resolveEvent (data, owner, repo) {
  const { number: pull_number, user: { login: user } } = data.pull_request
  const commitMsgs = await listAllCommit(owner, repo, pull_number)
  const errorReason = checkMsgs(commitMsgs)
  // 当出现错误时，关闭PR并@作者给出错误原因和决绝方案
  if (!errorReason) return
  githubClient.pulls.update({
    owner,
    repo,
    pull_number,
    state: 'closed'
  })
  createComment(owner, repo, pull_number, `@${user}\n\n${errorReason}${message.suggest}`)
}

module.exports = function (app) {
  // 创建时
  app.on('pull_request.opened', resolveEvent)
  // 同步对方的push时
  app.on('pull_request.synchronize', resolveEvent)
  // 重开时
  app.on('pull_request.reopened', resolveEvent)
}
module.exports.listAllCommit = listAllCommit
