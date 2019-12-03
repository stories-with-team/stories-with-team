import React from 'react';
import useFetch from "react-fetch-hook";
import './App.css';
import {StoryMap} from './interface/StoryMap'
import StoryBoard from './components/StoryBoard'
import {markdown2storyMap} from './lib/md2storyMap'

const App: React.FC = () => {
  const { isLoading, data } = useFetch("/api/v1/story-map-as-markdown", {
    formatter: (response) => response.text()
  })

  if(isLoading) {
    return (
      <div className="App">
      </div>
    )
  }
  const storyMap = markdown2storyMap(data ? data : "")
  return (
    <div className="App">
      <h1>{storyMap.title}</h1>
      <StoryBoard storyMap={storyMap}/>
    </div>
  )
}

export default App;
