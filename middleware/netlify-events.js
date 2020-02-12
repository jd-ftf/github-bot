const netlifySecret = require('../lib/netlify-secret')

module.exports = (app) => {
  function emitEvent (data) {
    const [owner, repo] = /\S+\/(\S+)\/(\S+)\/pull/.exec(data.review_url).slice(1, 3)

    const {
      commit_ref: commit,
      review_id: pull_number

    } = data
    app.emit(data.context, data, {
      owner, repo, commit, pull_number
    })
  }

  app.post('/hooks/netlify', (req, res) => {
    const event = req.headers['x-netlify-event']
    if (!event) {
      res.writeHead(400, 'Event Header Missing')
      return res.end()
    }
    if (!netlifySecret.isValid(req)) {
      res.writeHead(401, 'Invalid Signature')
      return res.end()
    }
    res.end()

    const data = req.body

    data.context = data.context ? `${event}.${data.context}` : event

    emitEvent(data)
  })
}
