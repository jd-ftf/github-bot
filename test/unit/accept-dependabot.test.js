const supertest = require('supertest')
const readFixture = require('../read-fixture')

const app = require('../app')

const webhookPayload = readFixture('pull_request.assigned.json')

supertest(app)
  .post('/hooks/github')
  .set('x-github-event', 'pull_request')
  .send(webhookPayload)
  .expect(200)
  .end(function (err, res) {
    if (err) throw err
  })
