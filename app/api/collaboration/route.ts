import { CollaborativeMessage, EditOperation, PresenceUpdate, UserSession } from '@/lib/collaboration'

/**
 * Collaboration server state manager using SSE and HTTP
 */
function CollaborationManager() {
  // SSE クライアント管理
  const clients: Array<{
    controller: ReadableStreamDefaultController
    encoder: TextEncoder
    userId: string
    sessionId: string
  }> = []

  // アクティブなユーザーセッション
  const activeSessions = new Map<string, UserSession>()

  // 編集操作の履歴（Operational Transformation用）
  const operationHistory: EditOperation[] = []
  let currentVersion = 0

  return {
    addClient(
      controller: ReadableStreamDefaultController,
      encoder: TextEncoder,
      userId: string,
      sessionId: string,
      user: UserSession
    ) {
      clients.push({ controller, encoder, userId, sessionId })
      activeSessions.set(userId, user)
      console.log(
        `Added collaboration client: ${userId} (${user.displayName})`
      )

      // 全クライアントにユーザー参加を通知
      this.broadcast(
        {
          type: 'presence',
          update: {
            type: 'joined',
            userId,
            sessionId,
            displayName: user.displayName,
            color: user.color,
            timestamp: Date.now(),
          },
        } as CollaborativeMessage,
        null
      )
    },

    removeClient(userId: string, sessionId: string) {
      const idx = clients.findIndex(
        (c) => c.userId === userId && c.sessionId === sessionId
      )
      if (idx !== -1) {
        const client = clients[idx]
        clients.splice(idx, 1)

        // ユーザーがいなくなったらセッションを削除
        if (!clients.some((c) => c.userId === userId)) {
          activeSessions.delete(userId)

          // 全クライアントにユーザー離脱を通知
          this.broadcast(
            {
              type: 'presence',
              update: {
                type: 'left',
                userId,
                sessionId,
                timestamp: Date.now(),
              },
            } as CollaborativeMessage,
            null
          )
        }

        console.log(`Removed collaboration client: ${userId}`)
      }
    },

    getActiveSessions(): UserSession[] {
      return Array.from(activeSessions.values())
    },

    recordOperation(operation: EditOperation) {
      operation.version = currentVersion
      operationHistory.push(operation)
      currentVersion++
      console.log(
        `Recorded operation: ${operation.type} at ${operation.position} (version: ${operation.version})`
      )
    },

    getOperationsSince(version: number): EditOperation[] {
      return operationHistory.filter((op) => op.version > version)
    },

    getCurrentVersion(): number {
      return currentVersion
    },

    broadcast(
      message: CollaborativeMessage,
      excludeUserId: string | null
    ) {
      for (const { controller, encoder, userId } of clients) {
        if (excludeUserId && userId === excludeUserId) {
          continue
        }

        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify(message)}\n\n`
            )
          )
        } catch (e: unknown) {
          console.error('Failed to broadcast message:', e)
        }
      }
    },

    sendToClient(
      userId: string,
      sessionId: string,
      message: CollaborativeMessage
    ) {
      const client = clients.find(
        (c) => c.userId === userId && c.sessionId === sessionId
      )
      if (client) {
        try {
          client.controller.enqueue(
            client.encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
          )
        } catch (e: unknown) {
          console.error('Failed to send message to client:', e)
        }
      }
    },
  }
}

const collaborationManager = CollaborationManager()
const KEEP_ALIVE_INTERVAL = 30000 // 30秒

export async function GET(request: Request) {
  const url = new URL(request.url)
  const userId = url.searchParams.get('userId')
  const sessionId = url.searchParams.get('sessionId')
  const displayName = url.searchParams.get('displayName') || 'Anonymous'
  const userColor = url.searchParams.get('color') || '#FF6B6B'

  if (!userId || !sessionId) {
    return Response.json(
      { error: 'userId and sessionId are required' },
      { status: 400 }
    )
  }

  const encoder = new TextEncoder()
  let currentController: ReadableStreamDefaultController
  let keepAliveTimer: NodeJS.Timeout
  let isClosed = false

  const stream = new ReadableStream({
    async start(controller) {
      currentController = controller
      isClosed = false

      const user: UserSession = {
        userId,
        sessionId,
        displayName,
        color: userColor,
        cursorPosition: 0,
        lastActivity: Date.now(),
      }

      collaborationManager.addClient(controller, encoder, userId, sessionId, user)

      // 初回メッセージ：現在のセッション情報と操作履歴を送信
      collaborationManager.sendToClient(userId, sessionId, {
        type: 'init',
        user,
        version: collaborationManager.getCurrentVersion(),
      })

      // アクティブなユーザーリストを送信
      collaborationManager.sendToClient(userId, sessionId, {
        type: 'users',
        users: collaborationManager.getActiveSessions(),
      })

      function sendKeepAlive() {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(':keep-alive\n\n'))
            keepAliveTimer = setTimeout(sendKeepAlive, KEEP_ALIVE_INTERVAL)
          } catch (e: unknown) {
            console.error('Keep-alive error:', e)
          }
        }
      }
      sendKeepAlive()
    },

    cancel() {
      isClosed = true
      collaborationManager.removeClient(userId, sessionId)
      clearTimeout(keepAliveTimer)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { operation, update }: { operation?: EditOperation; update?: PresenceUpdate } = body

  if (operation) {
    // 編集操作を記録して配信
    const editOp = operation as EditOperation
    collaborationManager.recordOperation(editOp)
    collaborationManager.broadcast(
      { type: 'edit', operation: editOp } as CollaborativeMessage,
      editOp.userId
    )

    // 送信元のクライアントに確認応答を送信
    collaborationManager.sendToClient(editOp.userId, editOp.sessionId, {
      type: 'ack',
      operationId: editOp.id,
      appliedVersion: editOp.version,
    })

    return Response.json({ success: true, version: editOp.version })
  } else if (update) {
    // プレゼンス更新を配信
    const presenceUpdate = update as PresenceUpdate
    collaborationManager.broadcast(
      { type: 'presence', update: presenceUpdate } as CollaborativeMessage,
      presenceUpdate.userId
    )

    return Response.json({ success: true })
  } else {
    return Response.json(
      { error: 'operation or update is required' },
      { status: 400 }
    )
  }
}
