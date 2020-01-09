module.exports = (app) => {
  app.post('/hooks/netlify', (req, res) => {
    res.end()
  })
}
