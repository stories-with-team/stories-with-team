export async function fetcher(url: string) {
  const r = await fetch(url)
  return await r.json()
}

// SSEでデータを取得するfetcher
import type { ContentsResponse } from './types';

// コールバックで複数回データを受け取れるように変更
export function sseFetcher(
  url: string,
  onData: (data: ContentsResponse) => void,
  onError?: (err: unknown) => void
) {
  let eventSource = new EventSource(url);
  let closed = false;

  function setup() {
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onData(data);
      } catch (e) {
        console.log('SSE parse error x:', e);
        if (onError) onError(e);
        eventSource.close();
      }
    };
  eventSource.onerror = (err: unknown) => {
      if (!closed) {
        // Reconnect on error
        eventSource.close();
        setTimeout(() => {
          if (!closed) {
            eventSource = new EventSource(url);
            setup();
          }
        }, 1000);
        return
      }
  console.log('SSE error y:', err, eventSource.readyState, closed);
  if (onError) onError(err);
    };
  }
  setup();

  return {
    close: () => {
      closed = true;
      eventSource.close();
    }
  };
}
