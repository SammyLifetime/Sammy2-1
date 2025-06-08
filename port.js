const express = require('express')
const app = express()
const port = process.env.PORT || 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`𝑺𝑨𝑴𝑴𝒀 listening on port ${port}`)
})
