const githubClient = require('../lib/github-client')

/**
 * @description 包装函数
 * @param {Promise} promise
 * @return {[Error,Promise<Octokit.Response>]}
 */
async function parse (promise) {
  try {
    const result = await promise
    return [undefined, result]
  } catch (error) {
    return [error, undefined]
  }
}

/**
 * @description 评论issue
 * @param {string} owner
 * @param {string} repo
 * @param {number} issue_number
 * @param {string} body
 */
exports.createComment = async (owner, repo, issue_number, body) => parse(githubClient.issues.createComment({
  owner,
  repo,
  issue_number,
  body
}))

/**
 * @description 合并PR
 * @param {string} owner
 * @param {string} repo
 * @param {number} pull_number
 * @param {string} merge_method
 */
exports.merge = async (owner, repo, pull_number, merge_method = 'merge') => parse(githubClient.pulls.merge({
  owner,
  repo,
  pull_number,
  merge_method
}))
