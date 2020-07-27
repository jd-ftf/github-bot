const githubClient = require('../lib/github-client')
const { createComment } = require('../common/github')

/** 需要被忽略的merge history **/
const ignoreMsg = [
  /^Merge branch (\S+) into .+/,
  /^Merge remote-tracking branch (\S+) into .+/,
  /^Merge pull request #(\d+) from .+/
]
/** commit message 格式 **/
const commitRE = /^.{1,20}(\(.+\))?: .{1,50}/
/** message映射表 **/
const message = {
  exceed: 'Please use rebase to squash the commits which have same message.\n',
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
 * @throws {String} 格式不正确时的错误原因
 */
function checkMsgs (msgs) {
  msgs = msgs.filter(msg => !ignoreMsg.some(re => re.test(msg)))
  msgs.reduce((prev, current) => {
    // 有两个相邻的 commit message 内容完全相同
    if (prev.trim() === current.trim()) {
      throw Error(message.exceed)
    }
    // 有不符合格式的 commit message
    if (!commitRE.test(current)) {
      throw Error(message.format)
    }
    return current
  }, '')
}

async function resolveEvent (data, owner, repo) {
  const { number: pull_number, user: { login: user }, base } = data.pull_request
  // 合并到的目标分支是默认分支才检测 commit
  if (base.ref !== base.repo.default_branch) {
    return
  }

  const commitMsgs = await listAllCommit(owner, repo, pull_number)
  try {
    checkMsgs(commitMsgs)
  } catch ({ message: errorReason }) {
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
