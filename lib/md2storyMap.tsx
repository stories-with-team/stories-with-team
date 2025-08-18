import {StoryMap, Story, newStory, addDetail, newStoryMap} from '../interface/StoryMap'

type MdLine = {
  lineTextRaw: string
  lineText: string
  type: 'MdLine'
}

type MdHeadLine = {
  lineTextRaw: string
  lineText: string
  level: number
  type: 'MdHeadLine'
}

function toLine(lineTextRaw: string) {
  let result: RegExpExecArray | null
  if((result = /^(#+)(.*)$/.exec(lineTextRaw)) !== null) {
    const level = result[1].length
    const text = result[2]
    return { type: 'MdHeadLine', level, lineText: text.trim(), lineTextRaw} as const satisfies MdHeadLine
  }
  return { type: 'MdLine', lineText: lineTextRaw, lineTextRaw} as const satisfies MdLine
}

export function markdown2storyMap(markdown: string): StoryMap {
  const mdLineList: (MdLine | MdHeadLine)[] = markdown.split('\n').map(toLine)

  const patterns: {[key: string]: ((title: string, stories: Story[], mdLine: MdLine | MdHeadLine) => [string, Story[]])} = {
    MdLine(title: string, stories: Story[], mdLine: MdLine | MdHeadLine) {
      if (mdLine.type !== 'MdLine')
        throw new Error("mdLine should be MdLine"
      )

      // TODO: Ignoring
      return [title, stories]
    },
    MdHeadLine(title: string, stories: Story[], mdLine: MdLine | MdHeadLine) {
      if (mdLine.type !== 'MdHeadLine')
        throw new Error("mdLine should be MdHeadLine"
      )
      const mdHeadLine = mdLine
      const level = mdHeadLine.level
      if(level === 1) {
        return [mdHeadLine.lineText, stories]
      } else if(level === 2) {
        // New Story
        return [title, [...stories, newStory(mdHeadLine.lineText)]]
      } else if(level === 3) {
        if(stories.length === 0)
          throw new Error("Adding a detail for empty stories")
        const story = stories[stories.length - 1]
        return [title, [...stories.slice(0, -1), addDetail(story, mdHeadLine.lineText)]]
      } else {
        return [title, stories]
      }
    }
  }
  const [title, stories] =
    mdLineList.reduce(([title, stories], mdLine) =>
      patterns[mdLine.type](title, stories, mdLine)
    ,
    ['' , []] as [string, Story[]]);
  return newStoryMap(title, stories)
}
