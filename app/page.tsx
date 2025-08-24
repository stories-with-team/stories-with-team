'use client'


import Main from './ui/Main';
import './App.css'
import { sseFetcher } from '@/lib/fetcher';
import { useEffect, useState } from 'react';


const URL = '/api/contents';
function useMarkdown() {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const sse = sseFetcher(
      URL,
      (data) => {
        if (!cancelled) {
          setMarkdown(data.storyboard);
          setIsLoading(false);
        }
      },
      (err: unknown) => {
        if (!cancelled) {
          if (err instanceof Error) {
            console.log('SSE Error:', err, err.stack, err.message, err.cause);
            setError(err);
          } else {
            console.log('SSE Error (unknown):', err);
            setError(new Error('Unknown SSE error'));
          }
          setIsLoading(false);
        }
      }
    );
    return () => {
      cancelled = true;
      sse.close();
    };
  }, []);

  async function update(newMarkdown: string) {
    setMarkdown(newMarkdown);
    await fetch(URL, {
      method: 'POST',
      body: JSON.stringify({ storyboard: newMarkdown })
    });
    // 再取得したい場合は再度SSEで取得する処理を追加可能
  }

  return {
    markdown,
    error,
    isLoading,
    update
  };
}

export default function Home() {
  const { markdown, update, error, isLoading } = useMarkdown()

  if (isLoading || !markdown) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Main markdown={markdown} onChange={update}/>
  );
}
