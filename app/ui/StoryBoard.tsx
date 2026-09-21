'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

import { StoryMap, Story, StoryDetail, StoryActivity } from '@/interface/StoryMap'

type DetailBagProps = {
  detail: StoryDetail
  storyId: string
  onSelect: (elem: SelectedElement) => void
  onDragStart: (detailId: string, sourceStoryId: string) => void
  onDragEnd: () => void
  isDragging: boolean
}

function DetailBag(props: DetailBagProps) {
  const { detail, storyId, onSelect, onDragStart, onDragEnd, isDragging } = props

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer!.effectAllowed = 'move'
    e.dataTransfer!.setData('detailId', detail.id)
    e.dataTransfer!.setData('sourceStoryId', storyId)
    onDragStart(detail.id, storyId)
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect({ type: 'detail', target: detail })
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={cn(
        'm-1.5 cursor-grab rounded-lg border border-border bg-secondary/80 p-2.5 text-left text-sm text-foreground shadow-sm transition active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
    >
      <StoryCard text={detail.description} />
    </div>
  )
}

export type SelectedElement =
  | { type: 'activity'; target: StoryActivity }
  | { type: 'detail'; target: StoryDetail }

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
  onStoryDrop: (sourceStoryId: string, targetStoryId: string, position: 'before' | 'after') => void
}

function StoryBag(props: StoryBagProps) {
  const { story, onSelect, onDragDetailStart, onDragDetailEnd, draggingDetailId, onDetailDrop, onDragStoryStart, onDragStoryEnd, draggingStoryId, onStoryDrop } = props
  const [isDropTarget, setIsDropTarget] = useState(false)
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before')

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
      if (draggingStoryId) {
        const bounds = e.currentTarget.getBoundingClientRect()
        setDropPosition(e.clientX < bounds.left + bounds.width / 2 ? 'before' : 'after')
      }
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDropTarget(false)
    setDropPosition('before')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const storyId = e.dataTransfer!.getData('storyId')
    const detailId = e.dataTransfer!.getData('detailId')
    const sourceStoryId = e.dataTransfer!.getData('sourceStoryId')

    if (storyId && !detailId) {
      if (storyId !== story.id) {
        onStoryDrop(storyId, story.id, dropPosition)
      }
      onDragStoryEnd()
    } else if (detailId && sourceStoryId) {
      onDetailDrop(detailId, sourceStoryId, story.id)
    }

    setIsDropTarget(false)
    setDropPosition('before')
    onDragDetailEnd()
  }

  const handleActivityClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onSelect({ type: 'activity', target: story.activity })
  }

  return (
    <div
      className={cn(
        'w-[170px] min-w-[170px] transition-opacity duration-200',
        draggingStoryId === story.id && 'opacity-50',
        isDropTarget && dropPosition === 'before' && 'border-l-2 border-primary/60 pl-2',
        isDropTarget && dropPosition === 'after' && 'border-r-2 border-primary/60 pr-2',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Card
        draggable
        onDragStart={handleActivityDragStart}
        onDragEnd={onDragStoryEnd}
        onClick={handleActivityClick}
        className={cn(
          'mb-2 cursor-grab rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm active:cursor-grabbing',
        )}
      >
        <StoryCard text={story.activity.description} />
      </Card>

      <div>
        {story.details.map((detail) => (
          <DetailBag
            key={detail.id}
            detail={detail}
            storyId={story.id}
            onSelect={onSelect}
            onDragStart={onDragDetailStart}
            onDragEnd={onDragDetailEnd}
            isDragging={draggingDetailId === detail.id}
          />
        ))}
      </div>
    </div>
  )
}

type StoryCardProps = { text: string }

function StoryCard(props: StoryCardProps) {
  const { text } = props
  return (
    <div className="space-y-1 text-sm leading-5 text-slate-800">
      {text.split(/\n/).map((line, i) => (
        <div key={i}>{line || ' '}</div>
      ))}
    </div>
  )
}

type StoryBoardProps = {
  storyMap: StoryMap
  onSelect: (elem: SelectedElement) => void
  onDetailOrderChange?: (newStoryMap: StoryMap) => void
}

function StoryBoard(props: StoryBoardProps) {
  const { storyMap, onSelect, onDetailOrderChange } = props
  const [draggingDetailId, setDraggingDetailId] = useState<string | null>(null)
  const [draggingStoryId, setDraggingStoryId] = useState<string | null>(null)

  const handleDragDetailStart = (detailId: string, _sourceStoryId: string) => {
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

    const sourceStoryIndex = storyMap.storyList.findIndex((s) => s.id === sourceStoryId)
    const targetStoryIndex = storyMap.storyList.findIndex((s) => s.id === targetStoryId)

    if (sourceStoryIndex === -1 || targetStoryIndex === -1) return

    const sourceStory = storyMap.storyList[sourceStoryIndex]
    const targetStory = storyMap.storyList[targetStoryIndex]

    const detailIndex = sourceStory.details.findIndex((d) => d.id === detailId)
    if (detailIndex === -1) return

    const movedDetail = sourceStory.details[detailIndex]

    const newStoryList = [...storyMap.storyList]

    newStoryList[sourceStoryIndex] = {
      ...sourceStory,
      details: sourceStory.details.filter((d) => d.id !== detailId),
    }

    newStoryList[targetStoryIndex] = {
      ...targetStory,
      details: [...targetStory.details, movedDetail],
    }

    const newStoryMap: StoryMap = {
      ...storyMap,
      storyList: newStoryList,
    }

    onDetailOrderChange?.(newStoryMap)
  }

  const handleStoryDrop = (sourceStoryId: string, targetStoryId: string, position: 'before' | 'after') => {
    const sourceIndex = storyMap.storyList.findIndex((s) => s.id === sourceStoryId)
    const targetIndex = storyMap.storyList.findIndex((s) => s.id === targetStoryId)

    if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) return

    const newStoryList = [...storyMap.storyList]
    const [removed] = newStoryList.splice(sourceIndex, 1)
    const adjustedTargetIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
    const insertIndex = position === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex
    newStoryList.splice(insertIndex, 0, removed)

    const newStoryMap: StoryMap = {
      ...storyMap,
      storyList: newStoryList,
    }

    onDetailOrderChange?.(newStoryMap)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex justify-center pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">{storyMap.title}</h1>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex min-h-[420px] items-start gap-4">
          {storyMap.storyList.map((story) => (
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
          ))}
        </div>
      </div>
    </div>
  )
}

export default StoryBoard

