const githubSecret = require('../lib/github-secret')

module.exports = (app) => {

    app.emitEvent = (data) => {
        const owner = data.repository.owner.login || data.organization.login
        const repo = data.repository.name
        app.emit(data.action, data, owner, repo, data.sender.login)
    }

    app.post('/hooks/github', (req, res) => {
        const event = req.headers['x-github-event']
        if (!event) {
            res.writeHead(400, 'Event Header Missing')
            return res.end()
        }

        if (!githubSecret.isValid(req)) {
            res.writeHead(401, 'Invalid Signature')
            return res.end()
        }
        res.end()

        // content-type:application/json时，Request Body为 { action }
        // content-type:application/x-www-form-urlencoded时，req.body为 { payload: { action } }
        const data = req.body.hasOwnProperty('payload') ? JSON.parse(req.body.payload) : req.body

        data.action = data.action ? event + '.' + data.action : event
        app.emitEvent(data)
    })

}
