'use client'

import React, {useState} from 'react'
import StoryBoard from './StoryBoard'
import MarkdownEditor from './MarkdownEditor'
import {markdown2storyMap} from '@/lib/md2storyMap'
import './Main.css'
import NoteIcon from '@mui/icons-material/Note';
import KeyboardIcon from '@mui/icons-material/Keyboard';

type Props = {
  markdown: string,
  onChange: (markdown: string) => void
}


const Main = (props: Props) => {
  const {markdown, onChange} = props
  const [mode, setMode] = useState("storyboard");
  const toStoryboardMode = () => { setMode("storyboard") }
  const toMarkdownMode = () => { setMode("markdown") }
    const storyMap = markdown2storyMap(markdown)
  return (
    <React.Fragment>
      <div className="toolbar">
        <div onClick={toStoryboardMode}>
          <NoteIcon fontSize="large" className="toolbar-icon"/>
        </div>
        <div onClick={toMarkdownMode}>
          <KeyboardIcon fontSize="large" className="toolbar-icon"/>
        </div>
      </div>
      {
        mode === "storyboard" ?
          (<div className="main"><StoryBoard storyMap={storyMap}/></div>) :
          (<div className="main"><MarkdownEditor content={markdown} onChange={onChange}/></div>)
      }
    </React.Fragment>
  )
}
export default Main
