'use client'

import useSWR from 'swr'
import Main from './ui/Main';
import './App.css'
import { fetcher } from '@/lib/fetcher';
import { ContentsResponse } from '@/lib/types';


const URL = '/api/contents'
function useMarkdown() {
  const { data, mutate, error, isLoading } = useSWR<ContentsResponse>(
    URL,
    fetcher
  )

  async function update(markdown: string) {
    mutate({...data, storyboard: markdown}, false)
    await fetch(URL, {
      method: 'POST',
      body: JSON.stringify({storyboard: markdown})
    })
    mutate()
  }

  return {
    markdown: data?.storyboard,
    error,
    isLoading,
    update
  }
}

export default function Home() {
  const { markdown, update, error, isLoading } = useMarkdown()

  if (isLoading || !markdown) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Main markdown={markdown} onChange={update}/>
  );
}
