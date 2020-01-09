require('dotenv').load({ silent: true, path: '../../.env' })
const proxyquire = require('proxyquire')
const supertest = require('supertest')
const readFixture = require('../read-fixture')
const app = proxyquire('../../app', {
    '../lib/github-secret': {
        isValid: () => true,
        // 启用全局覆盖
        '@global': true
    }
})

const webhookPayload = readFixture('pull_request_review.submitted.json')

supertest(app)
    .post('/hooks/github')
    .set('x-github-event', 'pull_request_review')
    .send(webhookPayload)
    .expect(200)
    .end(function (err, res) {
        if (err) throw err
    })

