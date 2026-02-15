'use client'

import { markdown2storyMap } from '@/lib/md2storyMap'
import React, { useState, useEffect, useRef } from 'react'
import { tv } from 'tailwind-variants'
import { useCollaboration } from '@/lib/useCollaboration'
import { EditOperation, applyRemoteOperation, transformCursorPosition } from '@/lib/collaboration'
import UserPresence from './UserPresence'

type Props = {
  content: string
  onChange: (content: string) => void
  onErrorStateChange?: (hasError: boolean) => void
  enableCollaboration?: boolean
}

const textarea = tv({
  base: 'w-full h-[15rem] p-[10px] text-sm bg-[#f8f8f8] border border-[#ccc] rounded shadow-md resize-none',
})

const editorContainer = tv({
  base: 'relative',
})

const cursorOverlay = tv({
  base: 'absolute pointer-events-none text-sm font-mono',
})

function MarkdownEditor(props: Props) {
  const {content, onChange, onErrorStateChange, enableCollaboration = false} = props
  const [editingContent, setEditingContent] = useState(content) 
  const [hasError, setHasError] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastLocalEditRef = useRef(0)

  const {
    currentUser,
    activeUsers,
    cursorPositions,
    sendEditOperation,
    updateCursorPosition,
  } = useCollaboration({
    displayName: 'Editor User',
  })

  // リモート編集イベントをリッスン
  useEffect(() => {
    if (!enableCollaboration) return

    const handleRemoteEdit = (e: Event) => {
      const customEvent = e as CustomEvent<EditOperation>
      const operation = customEvent.detail

      // 自分の編集はスキップ
      if (currentUser && operation.userId === currentUser.userId) {
        return
      }

      // リモート編集を適用
      setEditingContent((prev) => {
        const { newContent, transformedPosition } = applyRemoteOperation(
          prev,
          operation,
          []
        )

        // ローカルカーソル位置を変換
        setCursorPosition((curPos) =>
          transformCursorPosition(curPos, operation)
        )

        return newContent
      })
    }

    window.addEventListener('remoteEdit', handleRemoteEdit)
    return () => {
      window.removeEventListener('remoteEdit', handleRemoteEdit)
    }
  }, [enableCollaboration, currentUser])

  const contentUpdated = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    const oldValue = editingContent
    const newCursorPos = event.target.selectionStart || 0

    setEditingContent(value)
    setCursorPosition(newCursorPos)

    try {
      // Throw error if markdown is invalid
      markdown2storyMap(value)

      onChange(value)
      setHasError(false)
      if(onErrorStateChange)
        onErrorStateChange(false)

      // 協調編集処理
      if (enableCollaboration && currentUser) {
        const timeSinceLastEdit = Date.now() - lastLocalEditRef.current
        lastLocalEditRef.current = Date.now()

        // テキストの差分を計算して操作を送信
        if (value.length > oldValue.length) {
          // テキスト挿入
          const insertedText = value.substring(
            newCursorPos - (value.length - oldValue.length),
            newCursorPos
          )
          if (insertedText) {
            sendEditOperation(
              'insert',
              newCursorPos - insertedText.length,
              insertedText
            )
          }
        } else if (value.length < oldValue.length) {
          // テキスト削除
          const deletedLength = oldValue.length - value.length
          sendEditOperation('delete', newCursorPos, undefined, deletedLength)
        }

        // カーソル位置をアップデート（100ms以上経過時のみ送信）
        if (timeSinceLastEdit > 100) {
          updateCursorPosition(newCursorPos)
        }
      }
    } catch(_e: unknown) {
      setHasError(true)
      if(onErrorStateChange)
        onErrorStateChange(true)
    }
  }

  const handleTextareaBlur = () => {
    if (enableCollaboration) {
      updateCursorPosition(cursorPosition)
    }
  }

  return (
    <React.Fragment>
      <h1>Markdown Editor</h1>

      {enableCollaboration && currentUser && (
        <UserPresence currentUser={currentUser} activeUsers={activeUsers} />
      )}

      <div className={editorContainer()}>
        <textarea
          ref={textareaRef}
          className={textarea()}
          value={editingContent}
          onChange={contentUpdated}
          onBlur={handleTextareaBlur}
        />

        {/* リモートユーザーのカーソル表示 */}
        {enableCollaboration &&
          Array.from(cursorPositions.entries()).map(([userId, cursor]) => {
            if (userId === currentUser?.userId) return null
            return (
              <div
                key={userId}
                className={cursorOverlay()}
                style={{
                  pointerEvents: 'none',
                  opacity: 0.7,
                }}
                title={cursor.displayName}
              >
                <span
                  style={{
                    backgroundColor: cursor.color,
                    padding: '2px 4px',
                    borderRadius: '2px',
                    fontSize: '10px',
                    color: 'white',
                  }}
                >
                  {cursor.displayName}
                </span>
              </div>
            )
          })}
      </div>

      {hasError && <p className="text-red-500">❌ Markdown is invalid</p>}
    </React.Fragment>
  )
}
export default MarkdownEditor
