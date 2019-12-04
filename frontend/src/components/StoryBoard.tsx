import React from 'react';
import {StoryMap, Story, StoryDetail} from '../interface/StoryMap'

import './StoryBoard.css'

type DetailBagProps = {
  detail: StoryDetail
}
const DetailBag: React.SFC<DetailBagProps> = (props) => {
  const {detail} = props
  return (
    <StoryCard text={detail.description}/>
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
        <StoryCard text={story.activity.description} />
      </div>
      <div>
      {story.details.map(detail =>
        <div className="story-box story-detail" key={detail.id}>
          {<DetailBag detail={detail} />}
        </div>
      )}
      </div>

    </div>
  );
}

type StoryCardProps = {
  text: string
}

const StoryCard: React.SFC<StoryCardProps> = (props) => {
  const {text} = props
  return (
    <React.Fragment>
      {text.split(/\n/).map((line, i) =>
        <div key={i}>{line}</div>
      )}
    </React.Fragment>
  )
}

type StoryBoardProps = {
  storyMap: StoryMap
}

const StoryBoard: React.SFC<StoryBoardProps> = (props) => {
  const {storyMap}= props
  return (
    <React.Fragment>
      <h1>{storyMap.title}</h1>
      <div className="storyboard">
        {
          storyMap.storyList.map(story =>
            <StoryBag story={story} key={story.id}/>
          )
        }
      </div>
    </React.Fragment>
  );
}

export default StoryBoard

