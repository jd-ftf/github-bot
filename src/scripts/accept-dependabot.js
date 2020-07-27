const githubClient = require('../lib/github-client')
const { createComment, merge } = require('../common/github')
const { listAllCommit } = require('./check-commit')

const whileList = ['dependabot-preview[bot]']

async function autoAccept(data, owner, repo) {
  const {number: pull_number, user: {login}} = data.pull_request
  // 注意安全：白名单人员提的PR一律自动合并，控制好权限
  if (!whileList.includes(login)) return
  // 先批准
  await githubClient.pulls.createReview({
    owner,
    repo,
    pull_number,
    event: 'APPROVE'
  })
  // 提取commit message
  const [message] = (await listAllCommit(owner, repo, pull_number))[0].split('\n')
  // merge PR
  const [error] = await merge({
    owner,
    repo,
    pull_number,
    merge_method: 'squash',
    commit_title: message,
    commit_message: ''
  })
  if (error) return
  createComment(owner, repo, pull_number, 'auto rebased ~!')
}

module.exports = function (app) {
  app.on('pull_request.assigned', autoAccept)
  app.on('pull_request.synchronize', autoAccept)
  app.on('pull_request.edited', autoAccept)
  app.on('issue_comment.created', autoAccept)
  app.on('check_suite.completed', autoAccept)
  app.on('check_run.completed', autoAccept)
}
