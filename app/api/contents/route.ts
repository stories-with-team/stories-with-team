import fs from 'node:fs'

async function loadMarkdown() {
  try {
    return await fs.promises.readFile('data/storyboard.md', { encoding: 'utf8' })
  } catch(error: unknown) {
    return await fs.promises.readFile('data/initial-storyboard.md', { encoding: 'utf8' })  
  }
}

async function saveMarkdown(markdown: string) {
  await fs.promises.writeFile('data/storyboard.md', markdown)
}

export async function GET() {
  const markdown = await loadMarkdown()
  return Response.json({
    storyboard: markdown
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const markdown = body.storyboard
  if(typeof markdown !== 'string') {
    return Response.json({
      error: "markdown is not string"
    }, {
      status: 400
    })
  }
  await saveMarkdown(markdown)
  return Response.json(body)
}