require('dotenv').load({ silent: true })

const app = require('./app')

const port = process.env.PORT || 3000

app.listen(port)
