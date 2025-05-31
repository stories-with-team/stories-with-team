'use client'

import React from 'react'
import './MarkdownEditor.css'
type Props = {
  content: string
  onChange: (content: string) => void
}
function MarkdownEditor(props: Props) {
  const {content, onChange} = props
  const contentUpdated = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }
  return (
    <React.Fragment>
      <h1>Markdown Editor</h1>
      <textarea value={content} onChange={contentUpdated} />
    </React.Fragment>
  )
}
export default MarkdownEditor
