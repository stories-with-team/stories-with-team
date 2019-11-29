import React from 'react';
import logo from './logo.svg';
import './App.css';
import {StoryMap} from './interface/StoryMap'
import StoryBoard from './components/StoryBoard'
import {markdown2storyMap} from './lib/md2storyMap'

const App: React.FC = () => {
  const md = `
# Another Story Map Tool
## Create a story map
### You can write a story map by a story board
### You can write a story map as a markdown
## Show your stories
### You can see a story map by a story board
### You can see a story map as a markdown
## Share your stories
### You can share the stories by markdown.
`
  const storyMap: StoryMap = markdown2storyMap(md)
  return (
    <div className="App">
      <h1>{storyMap.title}</h1>
      <StoryBoard storyMap={storyMap}/>
    </div>
  );
}

export default App;
