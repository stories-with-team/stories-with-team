import nanoid from 'nanoid'
interface WithId {
  id: string
}

export interface StoryActivity extends WithId {
  description: string
}
export interface StoryDetail extends WithId {
  description: string
}

export interface Story extends WithId {
  activity: StoryActivity
  details: StoryDetail[]
}

export interface StoryMap{
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
