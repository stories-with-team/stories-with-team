
export interface StoryActivity {
  description: string
}
export interface StoryDetail {
  description: string
}

export interface Story {
  activity: StoryActivity
  details: StoryDetail[]
}

export interface StoryMap{
  storyList: Story[]
}

export function newStoryMap(storyList: Story[]) {
  return {
    storyList
  } as StoryMap
}

export function newStory(description: string) {
  return {
    activity: {
      description
    },
    details: []
  } as Story
}

export function addDetail(story: Story, detailDescription: string) {
  return {
    activity: {
      description: story.activity.description
    },
    details: [...story.details, {description: detailDescription}]
  } as Story
}
