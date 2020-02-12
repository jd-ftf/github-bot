const supertest = require('supertest')
const readFixture = require('../read-fixture')

const app = require('../app')

const webhookPayload = readFixture('label.created.json')

supertest(app)
  .post('/hooks/github')
  .set('x-github-event', 'label')
  .send(webhookPayload)
  .expect(200)
  .end(function (err, res) {
    if (err) throw err
  })
