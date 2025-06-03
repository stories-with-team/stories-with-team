'use client'

import React from 'react'
import { tv } from 'tailwind-variants'
type Props = {
  content: string
  onChange: (content: string) => void
}

const textarea = tv({
  base: 'w-full h-[15rem] p-[10px] text-sm bg-[#f8f8f8] border border-[#ccc] rounded shadow-md resize-none',
})

function MarkdownEditor(props: Props) {
  const {content, onChange} = props
  const contentUpdated = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }
  return (
    <React.Fragment>
      <h1>Markdown Editor</h1>
      <textarea className={textarea()} value={content} onChange={contentUpdated} />
    </React.Fragment>
  )
}
export default MarkdownEditor
