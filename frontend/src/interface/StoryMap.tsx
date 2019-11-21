
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
