export async function GET() {
  const json = {
    storyboard: `
    # Another Story Map Tool
    ## Create a story map
    ### You can write a story map by a story board
    ### You can write a story map as a markdown
    ## Show your stories
    ### You can see a story map by a story board
    ### You can see a story map as a markdown
    ## Share your stories
    ### You can share the stories by markdown.
    `.trim().split(/\n/).map(line => line.trim()).join('\n')
  }

  return Response.json(json)
}