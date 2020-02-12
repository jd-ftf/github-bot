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
    try {
      // 合并
      await githubClient.pulls.merge({
        owner,
        repo,
        pull_number,
        merge_method: 'rebase'
      })
      githubClient.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: 'auto rebased ~!'
      })
    } catch (e) {
      githubClient.issues.createComment({
        owner,
        repo,
        issue_number: pull_number,
        body: 'auto rebased fail ~!'
      })
    }
  })
}
