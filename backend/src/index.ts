import express from 'express'
import fs from 'fs'
import path from 'path'
import {promisify} from 'util'

const app = express()

const base = '/api/v1'
const readfile = promisify(fs.readFile)

if(process.env['ENV'] == 'dev') {
  console.log("In development mode, allow cors")
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
}
app.use(express.static('../frontend/build'));
app.get(`${base}/story-map-as-markdown`, (req, res) => {
  readfile(path.join(__dirname, '../story-map.md'))
    .then(data => {
      res
        .contentType('text/plain')
        .send(data)
        .end()
    })
})
app.listen(8080)
