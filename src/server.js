require('dotenv').config({ silent: true })

const app = require('./app')

const port = process.env.PORT || 3000

app.listen(port)
