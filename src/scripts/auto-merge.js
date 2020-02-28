const githubClient = require('../lib/github-client')

const { createComment, merge } = require('../common/github')

async function resolveEvent (data, owner, repo) {
  /**
   * @description 判断检查套件是否完成
   * @param {Number} pull_number PR 序号
   */
  const { number: pull_number } = data.pull_request || data.check_suite.pull_requests[0]
  const { data: pullRequest } = await githubClient.pulls.get({
    owner,
    repo,
    pull_number
  })
  /**
   * @description 判断检查套件是否完成
   * @param {Boolean} merged PR是否可以合并
   * @param {Number} mergeable PR是否已经合并
   * @param {String} mergeable_state 当值为clean时merge按钮才能点击
   * @param {String} sha PR的commit的头指针
   */
  const { merged, mergeable, mergeable_state, head: { sha } } = pullRequest
  if (merged || !mergeable || mergeable_state !== 'clean') {
    return
  }
  /**
   * @description 头指针被官方成员批准才能merge
   * @param {String} commit_id reviewer审阅的commit的sha
   * @param {String} state reviewer审阅的action,值为APPROVED时代表批准
   * @param {String} author_association reviewer的身份，值为member时代表为组织成员
   */
  const { data: reviews } = await githubClient.pulls.listReviews({
    owner,
    repo,
    pull_number
  })
  const approved = reviews.some(review => {
    const { commit_id, state, author_association } = review
    return (commit_id === sha && state === 'APPROVED' && author_association === 'MEMBER')
  })
  if (!approved) return
  /** merge PR **/
  const [error] = await merge(owner, repo, pull_number, 'rebase')
  if (error) return
  createComment(owner, repo, pull_number, 'auto rebased ~!')
}

module.exports = function (app) {
  // 批准后立即尝试合并
  app.on('pull_request_review.submitted', resolveEvent)
  // 检查套件检查完之后立即尝试合并
  app.on('check_suite.completed', resolveEvent)
}
