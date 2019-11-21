import React from 'react';
import logo from './logo.svg';
import './App.css';
import {StoryMap} from './interface/StoryMap'
import StoryBoard from './components/StoryBoard'

const App: React.FC = () => {
  const storyMap: StoryMap = {
    storyList: [
      {
        activity: { description: 'あああ' },
        details: [
          { description: 'いいい' }, 
          { description: 'ううう' }
        ]
      }, {
        activity: { description: 'かかか' },
        details: [
          { description: 'ききき' }, 
          { description: 'くくく' }
        ]
      }
    ]
  } as StoryMap
  return (
    <div className="App">
      <StoryBoard storyMap={storyMap}/>
    </div>
  );
}

export default App;
