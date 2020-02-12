const githubClient = require('../lib/github-client')

function createComment (owner, repo, pull_number, message) {
  githubClient.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,
    body: message
  })
}

module.exports = function (app) {
  app.on('deploy_created.deploy-preview', async (data, {
    owner, repo, commit, pull_number
  }) => {
    const message = `Deploy preview for *${data.name}* ready!\n\nBuilt with commit ${commit}\n\n${data.deploy_ssl_url || data.deploy_url}`

    createComment(owner, repo, pull_number, message)
  })
  app.on('deploy_failed.deploy-preview', async (data, {
    owner, repo, commit, pull_number
  }) => {
    const message = `Deploy preview for *${data.name}* failed.\n\nBuilt with commit ${commit}\n\n${data.admin_url}/deploys/${data.id}`
    createComment(owner, repo, pull_number, message)
  })
}
