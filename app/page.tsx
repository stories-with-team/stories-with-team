'use client'

import { useState } from 'react';
import Main from './ui/Main';
import './App.css'

export default function Home() {
  const initialMarkdown = `# Another Story Map Tool
## Create a story map
### You can write a story map by a story board
### You can write a story map as a markdown
## Show your stories
### You can see a story map by a story board
### You can see a story map as a markdown
## Share your stories
### You can share the stories by markdown.
`;

  const [markdown, setMarkdown] = useState(initialMarkdown)

  return (
    <Main markdown={markdown} onChange={setMarkdown}/>
  );
}
