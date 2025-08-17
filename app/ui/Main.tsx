'use client'

import React, {useState} from 'react'
import StoryBoard from './StoryBoard'
import MarkdownEditor from './MarkdownEditor'
import {markdown2storyMap} from '@/lib/md2storyMap'
import NoteIcon from '@mui/icons-material/Note';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { tv } from 'tailwind-variants';

type Props = {
  markdown: string|undefined,
  onChange: (markdown: string) => void
}

const toolbar = tv({
  base: 'fixed top-0 left-0 bottom-0 w-[47px] pt-[10px] text-[#ff6f6f] bg-[#ffcca2] shadow-[3px_0px_3px_rgba(0,0,0,0.6)]',
})

const Main = (props: Props) => {
  const {markdown, onChange} = props
  const [mode, setMode] = useState("storyboard");
  const toStoryboardMode = () => { setMode("storyboard") }
  const toMarkdownMode = () => { setMode("markdown") }
    const storyMap = markdown2storyMap(markdown)
  return (
    <React.Fragment>
      <div className={toolbar()}>
        <div onClick={toStoryboardMode}>
          <NoteIcon fontSize="large" className="cursor-pointer"/>
        </div>
        <div onClick={toMarkdownMode}>
          <KeyboardIcon fontSize="large" className="cursor-pointer"/>
        </div>
      </div>
      {
        mode === "storyboard" ?
          (<div className="ml-[50px]"><StoryBoard storyMap={storyMap}/></div>) :
          (<div className="ml-[50px]"><MarkdownEditor content={markdown} onChange={onChange}/></div>)
      }
    </React.Fragment>
  )
}
export default Main
