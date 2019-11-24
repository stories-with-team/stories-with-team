import React from 'react';
import {StoryMap, Story, StoryDetail} from '../interface/StoryMap'

import './StoryBoard.css'

type DetailBagProps = {
  detail: StoryDetail
}
const DetailBag: React.SFC<DetailBagProps> = (props) => {
  const {detail} = props
  return (
    <React.Fragment>{detail.description}</React.Fragment>
  )
}
type StoryBagProps = {
  story: Story
}

const StoryBag: React.SFC<StoryBagProps> = (props) => {
  const {story} = props
  return (
    <div className="story-bag">
      <div className="story-box story-activity">
      {story.activity.description}
      </div>
      <div>
      {story.details.map(detail => 
        <div className="story-box story-detail">
          {<DetailBag detail={detail} />}
        </div>
      )}
      </div>
     
    </div>
  );
}

type StoryBoardProps = {
  storyMap: StoryMap
}

const StoryBoard: React.SFC<StoryBoardProps> = (props) => {
  const {storyMap}= props
  return (
    <div className="storyboard">
      {
        storyMap.storyList.map(story =>
          <StoryBag story={story} />
        )
      }
    </div>
  );
}

export default StoryBoard

