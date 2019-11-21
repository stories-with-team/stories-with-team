import React from 'react';
import {StoryMap, Story, StoryDetail} from '../interface/StoryMap'

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
    <React.Fragment>
      <div>
      {story.activity.description}
      </div>
      <div>
      {story.details.map(detail => 
        <div>{<DetailBag detail={detail} />}</div>
      )}
      </div>
     
    </React.Fragment>
  );
}

type StoryBoardProps = {
  storyMap: StoryMap
}

const StoryBoard: React.SFC<StoryBoardProps> = (props) => {
  const {storyMap}= props
  return (
    <React.Fragment>
      {
        storyMap.storyList.map(story =>
          <span>
            <StoryBag story={story} />
          </span>
        )
      }
    </React.Fragment>
  );
}

export default StoryBoard

