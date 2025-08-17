'use client'

import useSWR from 'swr'
import Main from './ui/Main';
import './App.css'
import { fetcher } from '@/lib/fetcher';


export default function Home() {
  const { data, mutate: setMarkdown, error, isLoading } = useSWR<{storyboard: string}>(
    '/api/contents',
    fetcher
  )

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  function handleChange(storyboard: string) {
    setMarkdown({storyboard})
  }

  return (
    <Main markdown={data?.storyboard} onChange={handleChange}/>
  );
}
