import React from 'react'
import './MarkdownEditor.css'
type Props = {
  content: string
  onChange: (content: string) => void
}
const MarkdownEditor = (props: Props) => {
  const {content, onChange} = props
  const contentUpdated = (e: any) => {
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
