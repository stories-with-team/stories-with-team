import { expect, it } from 'vitest'
import {markdown2storyMap} from './md2storyMap'

it('convert markdown to story map', () => {
  const md = `
# aaaa
## abc
123
### foo
345
### bar
789
## xyz
22ss
### baz
afasa
  `
  const storyMap = markdown2storyMap(md)
  expect(storyMap.title).toBe('aaaa')
  expect(storyMap.storyList).toHaveLength(2)
  expect(storyMap.storyList[0].activity.description).toBe('abc')
  expect(storyMap.storyList[0].details).toHaveLength(2)
  expect(storyMap.storyList[0].details[0].description).toBe('foo')
  expect(storyMap.storyList[0].details[1].description).toBe('bar')
  expect(storyMap.storyList[1].activity.description).toBe('xyz')
  expect(storyMap.storyList[1].details).toHaveLength(1)
  expect(storyMap.storyList[1].details[0].description).toBe('baz')
})
