import express from 'express'
import fs, { symlinkSync, statSync } from 'fs'
import path from 'path'
import {promisify} from 'util'

const app = express()

const base = '/api/v1'
const readfile = promisify(fs.readFile)
const stat = promisify(fs.stat)
const copyFile = promisify(fs.copyFile)
const writeFile = promisify(fs.writeFile)


if(process.env['ENV'] == 'dev') {
  console.log("In development mode, allow cors")
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
}
async function prepareMarkdownFile() {
  const stats = await stat(path.join(__dirname, '../story-map.md')).catch(() => void 0)

  // File does not exist, so File is needed to copy.
  const needsCopy = typeof stats === "undefined"
  await copyFile(path.join(__dirname, '../story-map-template.md'), path.join(__dirname, '../story-map.md'))
}
async function saveMarkdown(markdown: string) {
  await writeFile(path.join(__dirname, '../story-map.md'), markdown, 'utf8')
  console.log("Markdown saved")
}

async function main() {
  await prepareMarkdownFile()
  app.use(express.json()) // for parsing application/json
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
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
  app.put(`${base}/story-map-as-markdown`, (req, res) => {
    const markdown = req.body['markdown']
    saveMarkdown(markdown)
      .then(() =>
        res
          .contentType('text/plain')
          .end()
      )
  })
  app.listen(8080)
}
main()
