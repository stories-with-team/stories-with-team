'use client'

import React from 'react';
import { tv } from 'tailwind-variants';

import {StoryMap, Story, StoryDetail, StoryActivity} from '@/interface/StoryMap'

type DetailBagProps = {
  detail: StoryDetail
}
function DetailBag(props: DetailBagProps) {
  const {detail} = props
  return (
    <StoryCard text={detail.description}/>
  )
}

export type SelectedElement = {
  type: 'activity'
  target: StoryActivity
} | {
  type: 'detail'
  target: StoryDetail
}

type StoryBagProps = {
  story: Story
  onSelect: (elem: SelectedElement) => void
}

const storyBox = tv({
  base: 'm-[5px] p-[5px] text-left text-sm h-[70px] overflow-y-auto drop-shadow-[3px_3px_2px_rgba(0,0,0,0.6)] cursor-pointer',
})

const storyActivity = tv({
  base: 'bg-[#f8ffb8]',
})

const storyDetail= tv({
  base: 'bg-[#ffb7ae]',
})

const storyBag = tv({
  base: 'w-[150px] min-w-[150px]',
})

function StoryBag(props: StoryBagProps) {
  const {story, onSelect} = props
  return (
    <div className={storyBag()}>
      <div
        className={`${storyBox()} ${storyActivity()}`}
        onClick={() => onSelect({type: 'activity', target: story.activity})}>
        <StoryCard text={story.activity.description} />
      </div>
      <div>
      {story.details.map(detail =>
        <div
          className={`${storyBox()} ${storyDetail()}`} key={detail.id}
          onClick={() => onSelect({type: 'detail', target: detail})}>
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

function StoryCard(props: StoryCardProps) {
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
  onSelect: (elem: SelectedElement) => void
}

const storyBoard = tv({
  base: 'flex overflow-x-auto'
})

function StoryBoard(props: StoryBoardProps) {
  const {storyMap, onSelect}= props
  return (
    <React.Fragment>
      <div className='w-full flex justify-center'>
        <h1 className='text-2xl font-bold'>{storyMap.title}</h1>
      </div>
      <div className='w-full flex justify-center'>
        <div className={storyBoard()}>
          {
            storyMap.storyList.map(story =>
              <StoryBag story={story} onSelect={onSelect} key={story.id}/>
            )
          }
        </div>
      </div>
    </React.Fragment>
  );
}

export default StoryBoard

