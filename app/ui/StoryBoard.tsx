'use client'

import React, { useState } from 'react';
import { tv } from 'tailwind-variants';

import {StoryMap, Story, StoryDetail, StoryActivity} from '@/interface/StoryMap'

type DetailBagProps = {
  detail: StoryDetail
  storyId: string
  onSelect: (elem: SelectedElement) => void
  onDragStart: (detailId: string, sourceStoryId: string) => void
  onDragEnd: () => void
  isDragging: boolean
}

function DetailBag(props: DetailBagProps) {
  const {detail, storyId, onSelect, onDragStart, onDragEnd, isDragging} = props

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('detailId', detail.id)
    e.dataTransfer!.setData('sourceStoryId', storyId)
    onDragStart(detail.id, storyId)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect({type: 'detail', target: detail})
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={`${storyBox()} ${storyDetail()} ${isDragging ? 'opacity-50' : ''} cursor-grab active:cursor-grabbing`}>
      <StoryCard text={detail.description} />
    </div>
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
  onDragDetailStart: (detailId: string, sourceStoryId: string) => void
  onDragDetailEnd: () => void
  draggingDetailId: string | null
  onDetailDrop: (detailId: string, sourceStoryId: string, targetStoryId: string) => void
  onDragStoryStart: (storyId: string) => void
  onDragStoryEnd: () => void
  draggingStoryId: string | null
  onStoryDrop: (sourceStoryId: string, targetStoryId: string) => void
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
  base: 'w-[150px] min-w-[150px] transition-opacity duration-200',
})

function StoryBag(props: StoryBagProps) {
  const {story, onSelect, onDragDetailStart, onDragDetailEnd, draggingDetailId, onDetailDrop, onDragStoryStart, onDragStoryEnd, draggingStoryId, onStoryDrop} = props
  const [isDropTarget, setIsDropTarget] = useState(false)

  const handleActivityDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('storyId', story.id)
    onDragStoryStart(story.id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move'
    if (draggingDetailId || draggingStoryId) {
      setIsDropTarget(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDropTarget(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    const storyId = e.dataTransfer!.getData('storyId')
    const detailId = e.dataTransfer!.getData('detailId')
    const sourceStoryId = e.dataTransfer!.getData('sourceStoryId')
    
    if (storyId && !detailId) {
      // Drop story
      if (storyId !== story.id) {
        onStoryDrop(storyId, story.id)
      }
      onDragStoryEnd()
    } else if (detailId && sourceStoryId) {
      // Drop detail
      onDetailDrop(detailId, sourceStoryId, story.id)
    }
    
    setIsDropTarget(false)
    onDragDetailEnd()
  }

  const handleActivityClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect({type: 'activity', target: story.activity})
  }

  return (
    <div 
      className={`${storyBag()} ${draggingStoryId === story.id ? 'opacity-50' : ''} ${isDropTarget ? 'border-2 border-blue-500 rounded' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        draggable
        onDragStart={handleActivityDragStart}
        onDragEnd={onDragStoryEnd}
        className={`${storyBox()} ${storyActivity()} cursor-grab active:cursor-grabbing`}
        onClick={handleActivityClick}>
        <StoryCard text={story.activity.description} />
      </div>
      <div>
      {story.details.map(detail =>
        <DetailBag 
          key={detail.id}
          detail={detail} 
          storyId={story.id}
          onSelect={onSelect}
          onDragStart={onDragDetailStart}
          onDragEnd={onDragDetailEnd}
          isDragging={draggingDetailId === detail.id}
        />
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
  onDetailOrderChange?: (newStoryMap: StoryMap) => void
}

const storyBoard = tv({
  base: 'flex overflow-x-auto'
})

function StoryBoard(props: StoryBoardProps) {
  const {storyMap, onSelect, onDetailOrderChange} = props
  const [draggingDetailId, setDraggingDetailId] = useState<string | null>(null)
  const [draggingStoryId, setDraggingStoryId] = useState<string | null>(null)

  const handleDragDetailStart = (detailId: string, sourceStoryId: string) => {
    setDraggingDetailId(detailId)
  }

  const handleDragDetailEnd = () => {
    setDraggingDetailId(null)
  }

  const handleDragStoryStart = (storyId: string) => {
    setDraggingStoryId(storyId)
  }

  const handleDragStoryEnd = () => {
    setDraggingStoryId(null)
  }

  const handleDetailDrop = (detailId: string, sourceStoryId: string, targetStoryId: string) => {
    if (sourceStoryId === targetStoryId) return

    const sourceStoryIndex = storyMap.storyList.findIndex(s => s.id === sourceStoryId)
    const targetStoryIndex = storyMap.storyList.findIndex(s => s.id === targetStoryId)
    
    if (sourceStoryIndex === -1 || targetStoryIndex === -1) return

    const sourceStory = storyMap.storyList[sourceStoryIndex]
    const targetStory = storyMap.storyList[targetStoryIndex]
    
    const detailIndex = sourceStory.details.findIndex(d => d.id === detailId)
    if (detailIndex === -1) return

    const movedDetail = sourceStory.details[detailIndex]
    
    const newStoryList = [...storyMap.storyList]
    
    // Remove detail from source story
    newStoryList[sourceStoryIndex] = {
      ...sourceStory,
      details: sourceStory.details.filter(d => d.id !== detailId)
    }
    
    // Add detail to target story
    newStoryList[targetStoryIndex] = {
      ...targetStory,
      details: [...targetStory.details, movedDetail]
    }

    const newStoryMap: StoryMap = {
      ...storyMap,
      storyList: newStoryList
    }
    
    onDetailOrderChange?.(newStoryMap)
  }

  const handleStoryDrop = (sourceStoryId: string, targetStoryId: string) => {
    const sourceIndex = storyMap.storyList.findIndex(s => s.id === sourceStoryId)
    const targetIndex = storyMap.storyList.findIndex(s => s.id === targetStoryId)
    
    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return

    const newStoryList = [...storyMap.storyList]
    const [removed] = newStoryList.splice(sourceIndex, 1)
    newStoryList.splice(targetIndex, 0, removed)
    
    const newStoryMap: StoryMap = {
      ...storyMap,
      storyList: newStoryList
    }
    
    onDetailOrderChange?.(newStoryMap)
  }

  return (
    <React.Fragment>
      <div className='w-full flex justify-center'>
        <h1 className='text-2xl font-bold'>{storyMap.title}</h1>
      </div>
      <div className='w-full flex justify-center'>
        <div className={storyBoard()}>
          {
            storyMap.storyList.map(story =>
              <StoryBag 
                story={story} 
                onSelect={onSelect} 
                key={story.id}
                onDragDetailStart={handleDragDetailStart}
                onDragDetailEnd={handleDragDetailEnd}
                draggingDetailId={draggingDetailId}
                onDetailDrop={handleDetailDrop}
                onDragStoryStart={handleDragStoryStart}
                onDragStoryEnd={handleDragStoryEnd}
                draggingStoryId={draggingStoryId}
                onStoryDrop={handleStoryDrop}
              />
            )
          }
        </div>
      </div>
    </React.Fragment>
  );
}

export default StoryBoard

