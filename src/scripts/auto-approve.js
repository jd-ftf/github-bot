const githubClient = require('../lib/github-client')

const whileList = ['dependabot-preview[bot]']

module.exports = function (app) {
  app.on('pull_request.review_requested', async (data, owner, repo) => {
    const { number: pull_number, user: { login } } = data.pull_request
    // 注意安全：白名单人员提的PR一律批注，控制好权限
    if (!whileList.includes(login)) return
    githubClient.pulls.createReview({
      owner,
      repo,
      pull_number,
      event: 'APPROVE'
    })
  })
}
