const fs = require('fs')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

// 解析req时，顺便把Request body的buffer挂到req上
const captureRaw = (req, res, buffer) => { req.raw = buffer }

// 支持接收json和urlencoded格式的 Request Body
app.use(bodyParser.json({ verify: captureRaw }))
app.use(bodyParser.urlencoded({ extended: true, verify: captureRaw }))

// 加载Events handle
fs.readdirSync(path.resolve(__dirname, 'scripts'))
  .filter(file => /\S*.js/.test(file))
  .forEach((file) => {
    require(`./scripts/${file}`)(app)
  })

// 加载Events middleware
fs.readdirSync(path.resolve(__dirname, 'middleware'))
  .filter(file => /\S*.js/.test(file))
  .forEach((file) => {
    require(`./middleware/${file}`)(app)
  })

module.exports = app
