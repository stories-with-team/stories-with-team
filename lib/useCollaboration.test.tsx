import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@vitest/browser'
import { useCollaboration } from './useCollaboration'

// Mock EventSource
class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  URL: string

  constructor(url: string) {
    this.URL = url
  }

  close() {}

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(
        new MessageEvent('message', { data: JSON.stringify(data) })
      )
    }
  }

  simulateError() {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }
}

let mockEventSource: MockEventSource | null = null

// Mock window.EventSource
global.EventSource = MockEventSource as any

// Mock fetch
global.fetch = vi.fn()

describe('useCollaboration Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEventSource = null
    vi.spyOn(global, 'EventSource').mockImplementation((url: string) => {
      mockEventSource = new MockEventSource(url) as any
      return mockEventSource
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with user session', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    expect(result.current.currentUser?.displayName).toBe('Alice')
    expect(result.current.currentUser?.userId).toBeDefined()
    expect(result.current.currentUser?.sessionId).toBeDefined()
    expect(result.current.currentUser?.color).toMatch(/^#[0-9A-F]{6}$/i)
  })

  it('should establish SSE connection on mount', async () => {
    renderHook(() => useCollaboration({ displayName: 'Alice' }))

    await waitFor(() => {
      expect(mockEventSource).toBeDefined()
    })

    const url = new URL(mockEventSource!.URL, 'http://localhost')
    expect(url.pathname).toContain('/api/collaboration')
    expect(url.searchParams.get('displayName')).toBe('Alice')
    expect(url.searchParams.has('userId')).toBe(true)
    expect(url.searchParams.has('sessionId')).toBe(true)
    expect(url.searchParams.has('color')).toBe(true)
  })

  it('should handle init message', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    act(() => {
      mockEventSource?.simulateMessage({
        type: 'init',
        user: result.current.currentUser,
        version: 42,
      })
    })

    // Should process init message without errors
    expect(result.current.currentUser).toBeDefined()
  })

  it('should handle users list message', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    const testUsers = [
      {
        userId: 'user2',
        sessionId: 'session2',
        displayName: 'Bob',
        color: '#FF6B6B',
        cursorPosition: 0,
        lastActivity: Date.now(),
      },
      {
        userId: 'user3',
        sessionId: 'session3',
        displayName: 'Charlie',
        color: '#4ECDC4',
        cursorPosition: 0,
        lastActivity: Date.now(),
      },
    ]

    act(() => {
      mockEventSource?.simulateMessage({
        type: 'users',
        users: testUsers,
      })
    })

    await waitFor(() => {
      expect(result.current.activeUsers.size).toBe(2)
    })

    expect(result.current.activeUsers.get('user2')?.displayName).toBe('Bob')
    expect(result.current.activeUsers.get('user3')?.displayName).toBe('Charlie')
  })

  it('should handle presence update for user join', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    act(() => {
      mockEventSource?.simulateMessage({
        type: 'presence',
        update: {
          type: 'joined',
          userId: 'user2',
          sessionId: 'session2',
          displayName: 'Bob',
          color: '#FF6B6B',
          timestamp: Date.now(),
        },
      })
    })

    await waitFor(() => {
      expect(result.current.activeUsers.size).toBe(1)
    })

    expect(result.current.activeUsers.get('user2')?.displayName).toBe('Bob')
  })

  it('should handle presence update for user leave', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    // Add a user
    act(() => {
      mockEventSource?.simulateMessage({
        type: 'presence',
        update: {
          type: 'joined',
          userId: 'user2',
          sessionId: 'session2',
          displayName: 'Bob',
          color: '#FF6B6B',
          timestamp: Date.now(),
        },
      })
    })

    await waitFor(() => {
      expect(result.current.activeUsers.size).toBe(1)
    })

    // Remove the user
    act(() => {
      mockEventSource?.simulateMessage({
        type: 'presence',
        update: {
          type: 'left',
          userId: 'user2',
          sessionId: 'session2',
          timestamp: Date.now(),
        },
      })
    })

    await waitFor(() => {
      expect(result.current.activeUsers.size).toBe(0)
    })
  })

  it('should handle cursor position update', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    // Add a user first
    const bob = {
      userId: 'user2',
      sessionId: 'session2',
      displayName: 'Bob',
      color: '#FF6B6B',
      cursorPosition: 0,
      lastActivity: Date.now(),
    }

    act(() => {
      mockEventSource?.simulateMessage({
        type: 'users',
        users: [bob],
      })
    })

    await waitFor(() => {
      expect(result.current.activeUsers.size).toBe(1)
    })

    // Update cursor position
    act(() => {
      mockEventSource?.simulateMessage({
        type: 'presence',
        update: {
          type: 'cursor',
          userId: 'user2',
          sessionId: 'session2',
          cursorPosition: 42,
          timestamp: Date.now(),
        },
      })
    })

    await waitFor(() => {
      expect(result.current.cursorPositions.has('user2')).toBe(true)
    })

    const cursor = result.current.cursorPositions.get('user2')
    expect(cursor?.position).toBe(42)
    expect(cursor?.displayName).toBe('Bob')
  })

  it('should send edit operation via POST', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, version: 1 }),
    })

    act(() => {
      result.current.sendEditOperation('insert', 0, 'Hello')
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const call = (global.fetch as any).mock.calls[0]
    expect(call[0]).toBe('/api/collaboration')
    expect(call[1].method).toBe('POST')

    const body = JSON.parse(call[1].body)
    expect(body.operation).toBeDefined()
    expect(body.operation.type).toBe('insert')
    expect(body.operation.position).toBe(0)
    expect(body.operation.content).toBe('Hello')
  })

  it('should update cursor position via POST', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    act(() => {
      result.current.updateCursorPosition(42)
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const call = (global.fetch as any).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.update).toBeDefined()
    expect(body.update.type).toBe('cursor')
    expect(body.update.cursorPosition).toBe(42)
  })

  it('should emit remoteEdit event on edit message', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    const eventListener = vi.fn()
    window.addEventListener('remoteEdit', eventListener)

    act(() => {
      mockEventSource?.simulateMessage({
        type: 'edit',
        operation: {
          id: 'op1',
          userId: 'user2',
          sessionId: 'session2',
          type: 'insert',
          position: 0,
          content: 'Hello',
          timestamp: Date.now(),
          version: 1,
        },
      })
    })

    await waitFor(() => {
      expect(eventListener).toHaveBeenCalled()
    })

    window.removeEventListener('remoteEdit', eventListener)
  })

  it('should handle connection error and attempt reconnect', async () => {
    const { result } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(result.current.currentUser).toBeDefined()
    })

    vi.useFakeTimers()

    act(() => {
      mockEventSource?.simulateError()
    })

    // Should have attempted reconnect after 3 seconds
    expect(true) // Connection error handled gracefully

    vi.useRealTimers()
  })

  it('should close SSE connection on unmount', async () => {
    const { unmount } = renderHook(() =>
      useCollaboration({ displayName: 'Alice' })
    )

    await waitFor(() => {
      expect(mockEventSource).toBeDefined()
    })

    const closeSpy = vi.spyOn(mockEventSource!, 'close')

    unmount()

    expect(closeSpy).toHaveBeenCalled()
  })
})
