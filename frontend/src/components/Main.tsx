import React from 'react'
import StoryBoard from './StoryBoard'
import {markdown2storyMap} from '../lib/md2storyMap'
type Props = {
  markdown: string
}

const Main = (props: Props) => {
  const {markdown} = props
  const storyMap = markdown2storyMap(markdown)
  return (
    <React.Fragment>
      <StoryBoard storyMap={storyMap}/>
    </React.Fragment>
  )
}
export default Main
