const githubClient = require('../lib/github-client')

module.exports = function (app) {
  app.on('pull_request_review.submitted', async (data, owner, repo) => {

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

    // 合并
    await githubClient.pulls.merge({
      owner,
      repo,
      pull_number
    })

    // 合并后机器人在对话框留言
    githubClient.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: 'auto merge ~!'
    })
  })
}
