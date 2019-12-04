import React from 'react';
import useFetch from "react-fetch-hook";
import './App.css';
import Main from './components/Main'

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
  return (
    <div className="App">
      <Main markdown={data ? data : ""}/>
    </div>
  )
}

export default App;
