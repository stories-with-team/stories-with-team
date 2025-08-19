'use client'

import { markdown2storyMap } from '@/lib/md2storyMap'
import React, { useState } from 'react'
import { tv } from 'tailwind-variants'
type Props = {
  content: string
  onChange: (content: string) => void
  onErrorStateChange?: (hasError: boolean) => void
}

const textarea = tv({
  base: 'w-full h-[15rem] p-[10px] text-sm bg-[#f8f8f8] border border-[#ccc] rounded shadow-md resize-none',
})

function MarkdownEditor(props: Props) {
  const {content, onChange, onErrorStateChange} = props
  const [editingContent, setEditingContent] = useState(content) 
  const [hasError, setHasError] = useState(false)
  const contentUpdated = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setEditingContent(value)
    try {
      // Throw error if markdown is invalid
      markdown2storyMap(value)

      onChange(e.target.value)
      setHasError(false)
      if(onErrorStateChange)
        onErrorStateChange(false)
    } catch(e: unknown) {
      // do nothing
      setHasError(true)
      if(onErrorStateChange)
        onErrorStateChange(true)
    }
  }
  return (
    <React.Fragment>
      <h1>Markdown Editor</h1>
      <textarea className={textarea()} value={editingContent} onChange={contentUpdated} />
      {hasError && <p className="text-red-500">❌ Markdown is invalid</p>}
    </React.Fragment>
  )
}
export default MarkdownEditor
