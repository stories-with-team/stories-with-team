'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  UserSession,
  EditOperation,
  PresenceUpdate,
  CollaborativeMessage,
  createUserSession,
  createEditOperation,
  applyRemoteOperation,
  transformCursorPosition,
} from '@/lib/collaboration'

export type UseCollaborationOptions = {
  userId?: string
  displayName?: string
}

export function useCollaboration(options: UseCollaborationOptions = {}) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null)
  const [activeUsers, setActiveUsers] = useState<Map<string, UserSession>>(
    new Map()
  )
  const [cursorPositions, setCursorPositions] = useState<
    Map<string, { position: number; displayName: string; color: string }>
  >(new Map())

  const eventSourceRef = useRef<EventSource | null>(null)
  const pendingOpsRef = useRef<EditOperation[]>([])
  const appliedOpsRef = useRef<EditOperation[]>([])
  const localVersionRef = useRef(0)
  const remoteVersionRef = useRef(0)
  const isClosed = useRef(false)

  // ユーザーセッションを初期化
  useEffect(() => {
    const displayName = options.displayName || `User-${Math.random().toString(36).substr(2, 9)}`
    const user = createUserSession(displayName)
    setCurrentUser(user)

    // SSE接続を確立
    const params = new URLSearchParams({
      userId: user.userId,
      sessionId: user.sessionId,
      displayName: user.displayName,
      color: user.color,
    })

    const eventSource = new EventSource(`/api/collaboration?${params}`)
    eventSourceRef.current = eventSource
    isClosed.current = false

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as CollaborativeMessage

        switch (message.type) {
          case 'init':
            // 初期化メッセージ - リモートバージョンをセット
            remoteVersionRef.current = message.version
            break

          case 'users':
            // アクティブなユーザーリストを更新
            const usersMap = new Map<string, UserSession>()
            message.users.forEach((u) => {
              usersMap.set(u.userId, u)
            })
            setActiveUsers(usersMap)
            break

          case 'edit':
            // リモート編集操作を適用
            handleRemoteOperation(message.operation)
            break

          case 'presence':
            // プレゼンス更新（カーソル位置、参加/離脱など）
            handlePresenceUpdate(message.update)
            break

          case 'ack':
            // 操作承認 - ペンディング操作から削除
            pendingOpsRef.current = pendingOpsRef.current.filter(
              (op) => op.id !== message.operationId
            )
            break
        }
      } catch (e) {
        console.error('Error parsing collaboration message:', e)
      }
    }

    eventSource.onerror = (err) => {
      if (!isClosed.current) {
        console.error('SSE connection error:', err)
        eventSource.close()

        // 再接続を試みる
        setTimeout(() => {
          if (!isClosed.current) {
            window.location.reload()
          }
        }, 3000)
      }
    }

    return () => {
      isClosed.current = true
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [options.displayName])

  const handleRemoteOperation = (operation: EditOperation) => {
    remoteVersionRef.current = operation.version
    appliedOpsRef.current.push(operation)

    // リモート操作イベントを発火
    const event = new CustomEvent('remoteEdit', {
      detail: operation,
    })
    window.dispatchEvent(event)
  }

  const handlePresenceUpdate = (update: PresenceUpdate) => {
    if (update.type === 'joined') {
      const newUser: UserSession = {
        userId: update.userId,
        sessionId: update.sessionId,
        displayName: update.displayName || 'Anonymous',
        color: update.color || '#FF6B6B',
        cursorPosition: 0,
        lastActivity: update.timestamp,
      }
      setActiveUsers((prev) => new Map(prev).set(update.userId, newUser))
    } else if (update.type === 'left') {
      setActiveUsers((prev) => {
        const next = new Map(prev)
        next.delete(update.userId)
        return next
      })
      setCursorPositions((prev) => {
        const next = new Map(prev)
        next.delete(update.userId)
        return next
      })
    } else if (update.type === 'cursor' && update.cursorPosition !== undefined) {
      const user = activeUsers.get(update.userId)
      if (user) {
        setCursorPositions((prev) =>
          new Map(prev).set(update.userId, {
            position: update.cursorPosition || 0,
            displayName: user.displayName,
            color: user.color,
          })
        )
      }
    }
  }

  const sendEditOperation = useCallback(
    async (
      type: 'insert' | 'delete',
      position: number,
      content?: string,
      length?: number
    ) => {
      if (!currentUser) return

      const operation = createEditOperation(
        currentUser.userId,
        currentUser.sessionId,
        type,
        position,
        localVersionRef.current,
        content,
        length
      )

      localVersionRef.current++
      pendingOpsRef.current.push(operation)

      // ローカルイベント発火
      const event = new CustomEvent('localEdit', {
        detail: operation,
      })
      window.dispatchEvent(event)

      // サーバーに送信
      try {
        const response = await fetch('/api/collaboration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation }),
        })

        if (!response.ok) {
          console.error('Failed to send operation:', response.statusText)
        }
      } catch (e) {
        console.error('Error sending operation:', e)
      }
    },
    [currentUser]
  )

  const updateCursorPosition = useCallback(
    async (position: number) => {
      if (!currentUser) return

      const update: PresenceUpdate = {
        type: 'cursor',
        userId: currentUser.userId,
        sessionId: currentUser.sessionId,
        cursorPosition: position,
        timestamp: Date.now(),
      }

      try {
        await fetch('/api/collaboration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update }),
        })
      } catch (e) {
        console.error('Error updating cursor position:', e)
      }
    },
    [currentUser]
  )

  return {
    currentUser,
    activeUsers,
    cursorPositions,
    sendEditOperation,
    updateCursorPosition,
    pendingOperations: pendingOpsRef.current,
    appliedOperations: appliedOpsRef.current,
  }
}
