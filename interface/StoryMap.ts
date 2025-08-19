import { nanoid } from 'nanoid'
type WithId = {
  id: string
}

export type StoryActivity = WithId & {
  description: string
}
export type StoryDetail = WithId & {
  description: string
}

export type Story = WithId & {
  activity: StoryActivity
  details: StoryDetail[]
}

export type StoryMap = {
  title: string
  storyList: Story[]
}

export function newStoryMap(title: string, storyList: Story[]) {
  return {
    title,
    storyList
  } as StoryMap
}

export function newStory(description: string) {
  return {
    activity: {
      description,
      id: nanoid()
    },
    details: [],
    id: nanoid()
  } as Story
}

export function addDetail(story: Story, detailDescription: string) {
  const newDetail = {
    description: detailDescription,
    id: nanoid()
  }
  return {
    activity: {
      description: story.activity.description
    },
    details: [...story.details, newDetail],
    id: story.id
  } as Story
}
