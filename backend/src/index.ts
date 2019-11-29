import express from 'express'
const app = express()

app.get('/', (req, res) => res.json({result: 'ok'}))
app.listen(8080)
