'use client'

import React, { useState } from 'react'
import StoryBoard, { SelectedElement } from './StoryBoard'
import MarkdownEditor from './MarkdownEditor'
import { markdown2storyMap, storyMap2markdown } from '@/lib/md2storyMap'
import { NotebookText, Keyboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StoryMap } from '@/interface/StoryMap'

type Props = {
  markdown: string,
  onChange: (markdown: string) => void
}

const Main = (props: Props) => {
  const { markdown, onChange } = props
  const [mode, setMode] = useState<'storyboard' | 'markdown'>('storyboard')
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null)
  const [editorError, setEditorError] = useState(false)

  function toStoryboardMode() {
    if (editorError) return
    setMode('storyboard')
  }

  function toMarkdownMode() {
    setMode('markdown')
  }

  const handleDetailOrderChange = (newStoryMap: StoryMap) => {
    const newMarkdown = storyMap2markdown(newStoryMap)
    onChange(newMarkdown)
  }

  const storyMap = markdown2storyMap(markdown)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="flex w-20 shrink-0 border-r bg-muted/40">
        <div className="flex w-full flex-col items-center gap-3 pt-5">
          <Button
            type="button"
            variant={mode === 'storyboard' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={toStoryboardMode}
            disabled={editorError}
            aria-label="Storyboard mode"
          >
            <NotebookText className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant={mode === 'markdown' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-11 w-11 rounded-xl"
            onClick={toMarkdownMode}
            aria-label="Markdown mode"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6">
        {mode === 'storyboard' ? (
          <StoryBoard storyMap={storyMap} onSelect={setSelectedElement} onDetailOrderChange={handleDetailOrderChange} />
        ) : (
          <MarkdownEditor content={markdown} onChange={onChange} onErrorStateChange={setEditorError} />
        )}
      </main>

      {selectedElement && (
        <aside className="w-[320px] shrink-0 border-l bg-card/95 backdrop-blur-sm">
          <Card className="m-4 border-none shadow-none bg-transparent">
            <CardContent className="relative p-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-8 w-8"
                onClick={() => setSelectedElement(null)}
                aria-label="Close detail panel"
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="space-y-4 pt-10">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                </div>

                <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-6 text-foreground">
                  {selectedElement.target.description}
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      )}
    </div>
  )
}

export default Main
