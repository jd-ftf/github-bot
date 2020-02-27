require('dotenv').config({ silent: true, path: '../../.env' })

const proxyquire = require('proxyquire')

module.exports = proxyquire('../src/app', {
  './lib/github-secret': {
    isValid: () => true,
    // 启用全局覆盖
    '@global': true
  },
  './lib/netlify-secret': {
    isValid: () => true,
    // 启用全局覆盖
    '@global': true
  }
})
