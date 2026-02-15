import { nanoid } from 'nanoid'

/**
 * User session information
 */
export type UserSession = {
  userId: string
  sessionId: string
  displayName: string
  color: string
  cursorPosition: number
  lastActivity: number
}

/**
 * Collaborative editing operations
 */
export type EditOperation = {
  id: string
  userId: string
  sessionId: string
  type: 'insert' | 'delete'
  position: number
  content?: string
  length?: number
  timestamp: number
  version: number
}

/**
 * Presence update for user awareness
 */
export type PresenceUpdate = {
  type: 'joined' | 'left' | 'cursor' | 'selection'
  userId: string
  sessionId: string
  displayName?: string
  color?: string
  cursorPosition?: number
  selectionStart?: number
  selectionEnd?: number
  timestamp: number
}

/**
 * Collaborative message types
 */
export type CollaborativeMessage = 
  | { type: 'init'; user: UserSession; version: number }
  | { type: 'edit'; operation: EditOperation }
  | { type: 'presence'; update: PresenceUpdate }
  | { type: 'ack'; operationId: string; appliedVersion: number }
  | { type: 'users'; users: UserSession[] }

/**
 * Client-side state for collaborative editing
 */
export type CollaborativeState = {
  localVersion: number
  remoteVersion: number
  pendingOperations: EditOperation[]
  appliedOperations: EditOperation[]
  activeUsers: Map<string, UserSession>
  currentUser: UserSession
}

/**
 * Generate a random color for user
 */
export function generateUserColor(): string {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#FFA07A', // Salmon
    '#98D8C8', // Mint
    '#F7DC6F', // Yellow
    '#BB8FCE', // Purple
    '#85C1E9', // Light Blue
    '#F8B88B', // Peach
    '#ABEBC6', // Green
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Create a new user session
 */
export function createUserSession(displayName: string): UserSession {
  return {
    userId: nanoid(),
    sessionId: nanoid(),
    displayName,
    color: generateUserColor(),
    cursorPosition: 0,
    lastActivity: Date.now(),
  }
}

/**
 * Create an edit operation
 */
export function createEditOperation(
  userId: string,
  sessionId: string,
  type: 'insert' | 'delete',
  position: number,
  version: number,
  content?: string,
  length?: number
): EditOperation {
  return {
    id: nanoid(),
    userId,
    sessionId,
    type,
    position,
    content,
    length,
    timestamp: Date.now(),
    version,
  }
}

/**
 * Apply remote edit operation to local content
 * Uses operational transformation approach
 */
export function applyRemoteOperation(
  content: string,
  operation: EditOperation,
  localPendingOps: EditOperation[]
): { newContent: string; transformedPosition: number } {
  let newContent = content
  let adjustedPosition = operation.position

  // Transform incoming operation against pending local operations
  for (const pendingOp of localPendingOps) {
    if (pendingOp.type === 'insert') {
      if (adjustedPosition >= pendingOp.position) {
        adjustedPosition += pendingOp.content?.length || 0
      }
    } else if (pendingOp.type === 'delete') {
      if (adjustedPosition >= pendingOp.position) {
        adjustedPosition -= (pendingOp.length || 0)
      }
    }
  }

  // Apply the transformed operation
  if (operation.type === 'insert' && operation.content) {
    newContent =
      newContent.slice(0, adjustedPosition) +
      operation.content +
      newContent.slice(adjustedPosition)
  } else if (operation.type === 'delete' && operation.length) {
    newContent =
      newContent.slice(0, adjustedPosition) +
      newContent.slice(adjustedPosition + operation.length)
  }

  return { newContent, transformedPosition: adjustedPosition }
}

/**
 * Transform local cursor position based on remote operations
 */
export function transformCursorPosition(
  cursorPosition: number,
  remoteOperation: EditOperation
): number {
  if (remoteOperation.type === 'insert') {
    if (cursorPosition >= remoteOperation.position) {
      return cursorPosition + (remoteOperation.content?.length || 0)
    }
  } else if (remoteOperation.type === 'delete') {
    if (cursorPosition > remoteOperation.position) {
      return Math.max(
        remoteOperation.position,
        cursorPosition - (remoteOperation.length || 0)
      )
    }
  }
  return cursorPosition
}
