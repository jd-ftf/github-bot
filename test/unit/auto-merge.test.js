const supertest = require('supertest')
const readFixture = require('../read-fixture')

const app = require('../app')

const approved = readFixture('pull_request_review.submitted.json')
const check_suite = readFixture('check_suite.completed.json')

supertest(app)
  .post('/hooks/github')
  .set('x-github-event', 'pull_request_review')
  .send(approved)
  .expect(200)
  .end(function (err, res) {
    if (err) throw err
  })

supertest(app)
  .post('/hooks/github')
  .set('x-github-event', 'check_suite')
  .send(check_suite)
  .expect(200)
  .end(function (err, res) {
    if (err) throw err
  })
