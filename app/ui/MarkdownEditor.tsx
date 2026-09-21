'use client'

import { markdown2storyMap } from '@/lib/md2storyMap'
import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  content: string
  onChange: (content: string) => void
  onErrorStateChange?: (hasError: boolean) => void
}

function MarkdownEditor(props: Props) {
  const { content, onChange, onErrorStateChange } = props
  const [editingContent, setEditingContent] = useState(content)
  const [hasError, setHasError] = useState(false)

  const contentUpdated = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    setEditingContent(value)
    try {
      markdown2storyMap(value)
      onChange(value)
      setHasError(false)
      if (onErrorStateChange) onErrorStateChange(false)
    } catch (_e: unknown) {
      setHasError(true)
      if (onErrorStateChange) onErrorStateChange(true)
    }
  }

  return (
    <Card className="mx-auto max-w-5xl border-border/60 bg-card/80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Markdown editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={editingContent}
          onChange={contentUpdated}
          className="min-h-[20rem] resize-y bg-background font-mono text-sm leading-6"
          placeholder="Write your storyboard markdown here..."
        />
        {hasError && <p className="text-sm font-medium text-destructive">Markdown is invalid.</p>}
      </CardContent>
    </Card>
  )
}

export default MarkdownEditor
