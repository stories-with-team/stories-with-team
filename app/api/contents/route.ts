import fs from 'node:fs'

function ClientManager() {
  // SSEクライアント管理用
  const clients: Array<{ controller: ReadableStreamDefaultController, encoder: TextEncoder }> = [];
  return {
    addClient(controller: ReadableStreamDefaultController, encoder: TextEncoder) {
      clients.push({ controller, encoder });
    },
    removeClient(controller: ReadableStreamDefaultController) {
      const idx = clients.findIndex(c => c.controller === controller);
      if (idx !== -1) clients.splice(idx, 1);
    },
    broadcast(markdown: string) {
      // すべてのSSEクライアントに新しいデータを送信
      for (const { controller, encoder } of clients) {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ storyboard: markdown })}\n\n`));
          console.log("Sent update to a client");
        } catch (e: unknown) {
          // エラー時は無視（切断済みなど）
        }
      }
    }
  }
}

const clientManager = ClientManager();

async function loadMarkdown() {
  try {
    return await fs.promises.readFile('data/storyboard.md', { encoding: 'utf8' })
  } catch(error: unknown) {
    return await fs.promises.readFile('data/initial-storyboard.md', { encoding: 'utf8' })  
  }
}

async function saveMarkdown(markdown: string) {
  await fs.promises.writeFile('data/storyboard.md', markdown)
}

const KEEP_ALIVE_INTERVAL = 30000; // 30秒ごと

export async function GET(request: Request) {
  const encoder = new TextEncoder();
  let currentController: ReadableStreamDefaultController;
  let keepAliveTimer: NodeJS.Timeout;
  const stream = new ReadableStream({
    async start(controller) {
      currentController = controller;
      console.log("Adding new SSE client");
      clientManager.addClient(controller, encoder);
      // 初回データ送信
      const markdown = await loadMarkdown();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ storyboard: markdown })}\n\n`));

      function sendKeepAlive() {
        controller.enqueue(encoder.encode(':keep-alive\n\n'));
        keepAliveTimer = setTimeout(sendKeepAlive, KEEP_ALIVE_INTERVAL);
      }
      sendKeepAlive();
    },
    cancel() {
      console.log("SSE client disconnected");
      // 切断時にクライアントリストから削除
      clientManager.removeClient(currentController);
      clearTimeout(keepAliveTimer);
    }
  });
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const markdown = body.storyboard;
  if (typeof markdown !== 'string') {
    return Response.json({
      error: "markdown is not string"
    }, {
      status: 400
    });
  }
  await saveMarkdown(markdown);
  clientManager.broadcast(markdown);
  return Response.json(body);
}