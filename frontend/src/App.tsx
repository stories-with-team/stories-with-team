import React, {useState} from 'react';
import useFetch from "react-fetch-hook";
import './App.css';
import Main from './components/Main'

const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(undefined as string | undefined)

  const { isLoading, data } = useFetch("/api/v1/story-map-as-markdown", {
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
  return (
    <div className="App">
      <Main markdown={markdown ? markdown : ""} onChange={setMarkdown}/>
    </div>
  )
}

export default App;
