'use client'

import React, {useState} from 'react'
import StoryBoard, { SelectedElement } from './StoryBoard'
import MarkdownEditor from './MarkdownEditor'
import {markdown2storyMap} from '@/lib/md2storyMap'
import NoteIcon from '@mui/icons-material/Note';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import CloseIcon from '@mui/icons-material/Close';
import { tv } from 'tailwind-variants';

type Props = {
  markdown: string,
  onChange: (markdown: string) => void
}

const toolbar = tv({
  base: 'fixed top-0 left-0 bottom-0 w-[47px] pt-[10px] text-[#ff6f6f] bg-[#ffcca2] shadow-[3px_0px_3px_rgba(0,0,0,0.6)]',
})

const Main = (props: Props) => {
  const {markdown, onChange} = props
  const [mode, setMode] = useState("storyboard");
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

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
          (<div className="ml-[50px]">
            <StoryBoard storyMap={storyMap} onSelect={setSelectedElement}/>
          </div>) :
          (<div className="ml-[50px]">
            <MarkdownEditor content={markdown} onChange={onChange}/>
          </div>)
      }
      {
        selectedElement &&
          <div className='fixed top-0 right-0 bottom-0 w-[300px] bg-[#ffddc2] shadow-[-3px_0px_3px_rgba(0,0,0,0.6)]'>
            <div className='absolute top-[10px] right-[10px]'>
              <CloseIcon className='cursor-pointer' onClick={() => setSelectedElement(null)}/>
            </div>
            <div className='p-[10px] '>
              Description
              <div className='p-[10px] bg-[#fff]'>
                {
                  selectedElement.type === "activity" ?
                    selectedElement.target.description :
                    selectedElement.target.description
                }
              </div>
            </div>
          </div>
      }
    </React.Fragment>
  )
}
export default Main
