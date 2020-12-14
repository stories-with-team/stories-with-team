import React, {useState} from 'react';
import useFetch from "react-fetch-hook";
import './App.css';
import Main from './components/Main'

let delayTimer: NodeJS.Timer;
function saveMarkdown(md: string) {
    clearTimeout(delayTimer);
    delayTimer = setTimeout(function() {
      fetch("/api/v1/story-map-as-markdown", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({markdown: md})
      })
    }, 1000); // Will do the ajax stuff after 1000 ms, or 1 s
}

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(undefined as string | undefined)

  const { isLoading } = useFetch("/api/v1/story-map-as-markdown", {
    formatter: async (response) => {
      const text = await response.text()
      setMarkdown(text)
      return text
    }
  })

  if(isLoading) {
    return (
      <div className="App">
      </div>
    )
  }
  if(markdown)
    saveMarkdown(markdown)
  return (
    <div className="App">
      <Main markdown={markdown ? markdown : ""} onChange={setMarkdown}/>
    </div>
  )
}

export default App;
