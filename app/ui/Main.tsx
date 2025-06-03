'use client'

import React, {useState} from 'react'
import StoryBoard from './StoryBoard'
import MarkdownEditor from './MarkdownEditor'
import {markdown2storyMap} from '@/lib/md2storyMap'
import './Main.css'
import NoteIcon from '@mui/icons-material/Note';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { saveStory } from '@/lib/api' // Import saveStory
import SaveIcon from '@mui/icons-material/Save'; // Import SaveIcon

type Props = {
  markdown: string,
  onChange: (markdown: string) => void
}


const Main = (props: Props) => {
  const {markdown, onChange} = props
  const [mode, setMode] = useState("storyboard");
  // Add state for saving
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const toStoryboardMode = () => { setMode("storyboard") }
  const toMarkdownMode = () => { setMode("markdown") }
  const storyMap = markdown2storyMap(markdown)

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await saveStory(markdown);
      setSaveMessage('Story saved successfully!');
    } catch (error: any) {
      setSaveMessage(error.message || 'Failed to save story.');
    } finally {
      setIsSaving(false);
      // Optional: clear message after some time
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <React.Fragment>
      <div className="toolbar">
        <div onClick={toStoryboardMode}>
          <NoteIcon fontSize="large" className="toolbar-icon"/>
        </div>
        <div onClick={toMarkdownMode}>
          <KeyboardIcon fontSize="large" className="toolbar-icon"/>
        </div>
        <div onClick={handleSave} style={{ pointerEvents: isSaving ? 'none' : 'auto', opacity: isSaving ? 0.5 : 1 }}>
          <SaveIcon fontSize="large" className="toolbar-icon"/>
        </div>
      </div>
      {saveMessage && <div className="save-message">{saveMessage}</div>} {/* Display save message */}
      {
        mode === "storyboard" ?
          (<div className="main"><StoryBoard storyMap={storyMap}/></div>) :
          (<div className="main"><MarkdownEditor content={markdown} onChange={onChange}/></div>)
      }
    </React.Fragment>
  )
}
export default Main
