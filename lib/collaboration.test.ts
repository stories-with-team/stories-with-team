import { describe, it, expect } from 'vitest'
import {
  createUserSession,
  createEditOperation,
  applyRemoteOperation,
  transformCursorPosition,
  generateUserColor,
} from './collaboration'

describe('Collaboration Utilities', () => {
  describe('generateUserColor', () => {
    it('should generate a valid hex color', () => {
      const color = generateUserColor()
      expect(color).toMatch(/^#[0-9A-F]{6}$/i)
    })

    it('should generate one of the predefined colors', () => {
      const colors = new Set<string>()
      for (let i = 0; i < 100; i++) {
        colors.add(generateUserColor())
      }
      // Should have multiple colors in the palette
      expect(colors.size).toBeGreaterThan(1)
    })
  })

  describe('createUserSession', () => {
    it('should create a user session with required fields', () => {
      const session = createUserSession('Alice')
      expect(session.displayName).toBe('Alice')
      expect(session.userId).toBeDefined()
      expect(session.sessionId).toBeDefined()
      expect(session.color).toMatch(/^#[0-9A-F]{6}$/i)
      expect(session.cursorPosition).toBe(0)
      expect(session.lastActivity).toBeGreaterThan(0)
    })

    it('should create unique sessions', () => {
      const session1 = createUserSession('Alice')
      const session2 = createUserSession('Bob')
      expect(session1.userId).not.toBe(session2.userId)
      expect(session1.sessionId).not.toBe(session2.sessionId)
    })
  })

  describe('createEditOperation', () => {
    it('should create an insert operation', () => {
      const op = createEditOperation(
        'user1',
        'session1',
        'insert',
        0,
        1,
        'Hello'
      )
      expect(op.type).toBe('insert')
      expect(op.position).toBe(0)
      expect(op.content).toBe('Hello')
      expect(op.version).toBe(1)
      expect(op.id).toBeDefined()
      expect(op.timestamp).toBeGreaterThan(0)
    })

    it('should create a delete operation', () => {
      const op = createEditOperation('user1', 'session1', 'delete', 5, 2, undefined, 3)
      expect(op.type).toBe('delete')
      expect(op.position).toBe(5)
      expect(op.length).toBe(3)
      expect(op.content).toBeUndefined()
    })

    it('should generate unique operation IDs', () => {
      const op1 = createEditOperation('user1', 'session1', 'insert', 0, 1, 'a')
      const op2 = createEditOperation('user1', 'session1', 'insert', 1, 2, 'b')
      expect(op1.id).not.toBe(op2.id)
    })
  })

  describe('applyRemoteOperation', () => {
    it('should apply insert operation', () => {
      const content = 'Hello World'
      const operation = createEditOperation(
        'user2',
        'session2',
        'insert',
        6,
        1,
        'Beautiful '
      )
      const { newContent } = applyRemoteOperation(content, operation, [])
      expect(newContent).toBe('Hello Beautiful World')
    })

    it('should apply delete operation', () => {
      const content = 'Hello Beautiful World'
      const operation = createEditOperation(
        'user2',
        'session2',
        'delete',
        6,
        1,
        undefined,
        10
      )
      const { newContent } = applyRemoteOperation(content, operation, [])
      expect(newContent).toBe('Hello World')
    })

    it('should apply insert at beginning', () => {
      const content = 'World'
      const operation = createEditOperation(
        'user2',
        'session2',
        'insert',
        0,
        1,
        'Hello '
      )
      const { newContent } = applyRemoteOperation(content, operation, [])
      expect(newContent).toBe('Hello World')
    })

    it('should apply insert at end', () => {
      const content = 'Hello'
      const operation = createEditOperation(
        'user2',
        'session2',
        'insert',
        5,
        1,
        ' World'
      )
      const { newContent } = applyRemoteOperation(content, operation, [])
      expect(newContent).toBe('Hello World')
    })

    it('should handle multiple pending operations for conflict resolution', () => {
      const content = 'Hello'
      const pendingOp = createEditOperation(
        'user1',
        'session1',
        'insert',
        0,
        1,
        'Say '
      )
      const remoteOp = createEditOperation(
        'user2',
        'session2',
        'insert',
        5,
        2,
        '!'
      )

      const { newContent, transformedPosition } = applyRemoteOperation(
        content,
        remoteOp,
        [pendingOp]
      )

      // Remote operation inserts at position 5 in original content
      // With pending insert at position 0, the position doesn't change
      // since 5 >= 0, it becomes 5 + 4 = 9
      // But the content transformation applies to original content
      expect(newContent).toBe('Hello!')
      expect(transformedPosition).toBe(9) // 5 + 4 (pending insert length)
    })

    it('should transform cursor position with multiple pending deletes', () => {
      const content = 'Hello World'
      const pendingDel = createEditOperation(
        'user1',
        'session1',
        'delete',
        0,
        1,
        undefined,
        1
      )
      const remoteOp = createEditOperation(
        'user2',
        'session2',
        'insert',
        5,
        2,
        ' Beautiful'
      )

      const { transformedPosition } = applyRemoteOperation(content, remoteOp, [
        pendingDel,
      ])

      expect(transformedPosition).toBe(4) // 5 - 1 (pending delete length)
    })
  })

  describe('transformCursorPosition', () => {
    it('should adjust cursor position after insert operation before cursor', () => {
      const cursorPos = 5
      const operation = createEditOperation(
        'user2',
        'session2',
        'insert',
        2,
        1,
        'abc'
      )
      const newPos = transformCursorPosition(cursorPos, operation)
      expect(newPos).toBe(8) // 5 + 3
    })

    it('should not adjust cursor position after insert operation after cursor', () => {
      const cursorPos = 5
      const operation = createEditOperation(
        'user2',
        'session2',
        'insert',
        6,
        1,
        'abc'
      )
      const newPos = transformCursorPosition(cursorPos, operation)
      expect(newPos).toBe(5) // No change
    })

    it('should adjust cursor position after delete operation before cursor', () => {
      const cursorPos = 5
      const operation = createEditOperation(
        'user2',
        'session2',
        'delete',
        2,
        1,
        undefined,
        2
      )
      const newPos = transformCursorPosition(cursorPos, operation)
      expect(newPos).toBe(3) // 5 - 2
    })

    it('should adjust cursor to delete position if cursor is in deleted range', () => {
      const cursorPos = 3
      const operation = createEditOperation(
        'user2',
        'session2',
        'delete',
        1,
        1,
        undefined,
        3
      )
      const newPos = transformCursorPosition(cursorPos, operation)
      expect(newPos).toBe(1) // max(1, 3 - 3)
    })

    it('should handle delete at cursor position', () => {
      const cursorPos = 2
      const operation = createEditOperation(
        'user2',
        'session2',
        'delete',
        2,
        1,
        undefined,
        1
      )
      const newPos = transformCursorPosition(cursorPos, operation)
      expect(newPos).toBe(2) // No change (at boundary)
    })

    it('should handle insert at cursor position', () => {
      const cursorPos = 2
      const operation = createEditOperation(
        'user2',
        'session2',
        'insert',
        2,
        1,
        'x'
      )
      const newPos = transformCursorPosition(cursorPos, operation)
      expect(newPos).toBe(3) // 2 + 1
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle simultaneous inserts at same position', () => {
      const content = 'Hello'
      
      // User A inserts "Beautiful " before "Hello"
      const opA = createEditOperation('user1', 'session1', 'insert', 0, 1, 'Beautiful ')
      const afterA = applyRemoteOperation(content, opA, [])
      expect(afterA.newContent).toBe('Beautiful Hello')

      // User B inserts "Say " at original position 0 (now needs transformation)
      const opB = createEditOperation('user2', 'session2', 'insert', 0, 1, 'Say ')
      const afterB = applyRemoteOperation(afterA.newContent, opB, [])
      expect(afterB.newContent).toBe('Say Beautiful Hello')
    })

    it('should handle interleaved inserts and deletes', () => {
      let content = 'Hello World'

      // Insert at position 6
      const op1 = createEditOperation('user1', 'session1', 'insert', 6, 1, 'Beautiful ')
      content = applyRemoteOperation(content, op1, []).newContent
      expect(content).toBe('Hello Beautiful World')

      // Delete "Beautiful " (10 chars starting at position 6)
      const op2 = createEditOperation('user2', 'session2', 'delete', 6, 2, undefined, 10)
      content = applyRemoteOperation(content, op2, []).newContent
      expect(content).toBe('Hello World')

      // Insert "Amazing " at position 6
      const op3 = createEditOperation('user1', 'session1', 'insert', 6, 3, 'Amazing ')
      content = applyRemoteOperation(content, op3, []).newContent
      expect(content).toBe('Hello Amazing World')
    })
  })
})
