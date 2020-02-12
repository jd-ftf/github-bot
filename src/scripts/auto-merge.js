const githubClient = require('../lib/github-client')

const { createComment, merge } = require('../common/github')

async function resolveEvent (data, owner, repo) {
  const { number: pull_number } = data.pull_request

  // 获取PR信息
  const { data: pullRequest } = await githubClient.pulls.get({
    owner,
    repo,
    pull_number
  })

  // 判断是否可以合并
  const { merged, mergeable, mergeable_state } = pullRequest
  if (merged || !mergeable || mergeable_state !== 'clean') {
    return
  }
  const [error] = await merge(owner, repo, pull_number, 'rebase')
  // 合并成功之后留言，合并失败啥也不干。
  if (error) return
  createComment(owner, repo, pull_number, 'auto rebased ~!')
}

module.exports = function (app) {
  // 批准后立即尝试合并
  app.on('pull_request_review.submitted', resolveEvent)
  // 检查套件检查完之后立即尝试合并
  app.on('check_suite.completed', resolveEvent)
}
