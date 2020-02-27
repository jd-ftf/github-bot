const supertest = require('supertest')
const readFixture = require('../read-fixture')

const app = require('../app')

const success = readFixture('deploy_created.deploy-preview.json')
const fail = readFixture('deploy_failed.deploy-preview.json')

supertest(app)
  .post('/hooks/netlify')
  .set('x-netlify-event', 'deploy_created')
  .send(success)
  .expect(200)
  .end(function (err, res) {
    if (err) console.log(err)
  })

supertest(app)
  .post('/hooks/netlify')
  .set('x-netlify-event', 'deploy_failed')
  .send(fail)
  .expect(200)
  .end(function (err, res) {
    if (err) console.log(err)
  })
