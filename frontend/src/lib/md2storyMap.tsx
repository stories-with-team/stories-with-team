import {StoryMap, Story, newStory, addDetail, newStoryMap} from '../interface/StoryMap'

class MdLine {
  private _type: string
  constructor(private text: string) {
    this._type = this.constructor.name
  }
  lineText(): string {
    return this.text.trim()
  }
  type(): string {
    return this._type
  }
}

class MdHeadLine extends MdLine {
  constructor(text: string, private _level: number) {
    super(text)
  }
  level(): number {
    return this._level
  }
}

const toLine = (lineText: string) => {
  let result: RegExpExecArray | null
  if((result = /^(#+)(.*)$/.exec(lineText)) !== null) {
    const level = result[1].length
    const text = result[2]
    return new MdHeadLine(text, level)
  }
  return new MdLine(lineText)
}

export function markdown2storyMap(markdown: string): StoryMap {
  const mdLineList: MdLine[] = markdown.split('\n').map(toLine)


  const patterns: {[key: string]: ((title: string, stories: Story[], mdLine: MdLine) => [string, Story[]])} = {
    MdLine(title: string, stories: Story[], mdLine: MdLine) {
      // TODO: Ignoring
      return [title, stories]
    },
    MdHeadLine(title: string, stories: Story[], mdLine: MdLine) {
      const mdHeadLine = mdLine as MdHeadLine
      const level = mdHeadLine.level()
      if(level === 1) {
        return [mdHeadLine.lineText(), stories]
      } else if(level === 2) {
        // New Story
        return [title, [...stories, newStory(mdHeadLine.lineText())]]
      } else if(level === 3) {
        if(stories.length === 0)
          throw new Error("Adding a detail for empty stories")
        const story = stories[stories.length - 1]
        return [title, [...stories.slice(0, -1), addDetail(story, mdHeadLine.lineText())]]
      } else {
        return [title, stories]
      }
    }
  }
  const [title, stories] =
    mdLineList.reduce(([title, stories], mdLine) =>
      patterns[mdLine.type()](title, stories, mdLine)
    ,
    ['' , []] as [string, Story[]]);
  return newStoryMap(title, stories)
}
