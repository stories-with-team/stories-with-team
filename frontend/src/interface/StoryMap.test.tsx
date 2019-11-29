import {newStory, addDetail, newStoryMap} from './StoryMap'
const story = newStory('abc')

it('Create a new story', () => {
  expect(story.activity.description).toBe('abc')
  expect(story.details).toHaveLength(0)
})
it('Add detail', () => {
  const story2 = addDetail(story, 'xyz')
  expect(story).not.toEqual(story2)
  expect(story2.activity.description).toBe('abc')
  expect(story2.details).toHaveLength(1)
  expect(story2.details[0].description).toBe('xyz')
})
it('Create a new story map', () => {
  const story2 = newStory('foo')
  const storyMap = newStoryMap('aaa', [story, story2])
  expect(storyMap.title).toBe('aaa')
  expect(storyMap.storyList).toHaveLength(2)
  expect(storyMap.storyList[0]).toEqual(story)
  expect(storyMap.storyList[1]).toEqual(story2)
})
