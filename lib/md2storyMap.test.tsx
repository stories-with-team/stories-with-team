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
  expect(storyMap).toEqual({
    title: 'aaaa',
    storyList: [
      {
        activity: { description: 'abc' },
        details: [
          { description: 'foo', id: expect.any(String) },
          { description: 'bar', id: expect.any(String) },
        ],
        id: expect.any(String)
      },
      {
        activity: { description: 'xyz' },
        details: [
          { description: 'baz', id: expect.any(String) },
        ],
        id: expect.any(String)
      }
    ]
  })
})
