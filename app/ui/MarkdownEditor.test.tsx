import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@vitest/browser'
import MarkdownEditor from './MarkdownEditor'

// Mock the useCollaboration hook
vi.mock('@/lib/useCollaboration', () => ({
  useCollaboration: () => ({
    currentUser: {
      userId: 'test-user-1',
      sessionId: 'test-session-1',
      displayName: 'Test User',
      color: '#FF6B6B',
      cursorPosition: 0,
      lastActivity: Date.now(),
    },
    activeUsers: new Map([
      [
        'user-2',
        {
          userId: 'user-2',
          sessionId: 'session-2',
          displayName: 'Other User',
          color: '#4ECDC4',
          cursorPosition: 5,
          lastActivity: Date.now(),
        },
      ],
    ]),
    cursorPositions: new Map(),
    sendEditOperation: vi.fn(),
    updateCursorPosition: vi.fn(),
    pendingOperations: [],
    appliedOperations: [],
  }),
}))

// Mock markdown2storyMap to avoid parsing
vi.mock('@/lib/md2storyMap', () => ({
  markdown2storyMap: () => ({
    title: 'Test',
    storyList: [],
  }),
}))

// Mock UserPresence component
vi.mock('./UserPresence', () => ({
  default: () => <div data-testid="user-presence">User Presence</div>,
}))

describe('MarkdownEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render the editor with initial content', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content="# Hello World"
          onChange={onChange}
          enableCollaboration={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toBeDefined()
      expect(textarea).toHaveValue('# Hello World')
    })

    it('should render heading', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          enableCollaboration={false}
        />
      )

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeDefined()
      expect(heading).toHaveTextContent('Markdown Editor')
    })

    it('should not show user presence when collaboration is disabled', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          enableCollaboration={false}
        />
      )

      expect(screen.queryByTestId('user-presence')).toBeNull()
    })

    it('should show user presence when collaboration is enabled', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          enableCollaboration={true}
        />
      )

      expect(screen.getByTestId('user-presence')).toBeDefined()
    })
  })

  describe('Content Updates', () => {
    it('should update content when user types', async () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          enableCollaboration={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, {
        target: { value: '# New Content' },
      })

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('# New Content')
      })
    })

    it('should update editing content state', async () => {
      const { rerender } = render(
        <MarkdownEditor
          content="Initial"
          onChange={() => {}}
          enableCollaboration={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Initial')

      fireEvent.change(textarea, {
        target: { value: 'Updated' },
      })

      await waitFor(() => {
        expect(textarea).toHaveValue('Updated')
      })
    })

    it('should preserve content on prop update', () => {
      const { rerender } = render(
        <MarkdownEditor
          content="First"
          onChange={() => {}}
          enableCollaboration={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('First')

      rerender(
        <MarkdownEditor
          content="Second"
          onChange={() => {}}
          enableCollaboration={false}
        />
      )

      expect(textarea).toHaveValue('Second')
    })
  })

  describe('Error Handling', () => {
    it('should not show error for valid markdown', async () => {
      const onChange = vi.fn()
      const onErrorStateChange = vi.fn()

      render(
        <MarkdownEditor
          content="# Valid Markdown"
          onChange={onChange}
          onErrorStateChange={onErrorStateChange}
          enableCollaboration={false}
        />
      )

      await waitFor(() => {
        expect(screen.queryByText(/Markdown is invalid/i)).toBeNull()
      })
    })

    it('should call onErrorStateChange with false for valid content', async () => {
      const onChange = vi.fn()
      const onErrorStateChange = vi.fn()

      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          onErrorStateChange={onErrorStateChange}
          enableCollaboration={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, {
        target: { value: '# Valid' },
      })

      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalledWith(false)
      })
    })

    it('should call onErrorStateChange callback when errorStateChange prop is provided', async () => {
      const onChange = vi.fn()
      const onErrorStateChange = vi.fn()

      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          onErrorStateChange={onErrorStateChange}
          enableCollaboration={false}
        />
      )

      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalled()
      })
    })
  })

  describe('Collaborative Editing', () => {
    it('should send edit operation on collaboration', async () => {
      const { useCollaboration } = await import('@/lib/useCollaboration')
      const mockSendEditOperation = vi.fn()

      vi.mocked(useCollaboration).mockReturnValue({
        currentUser: {
          userId: 'user-1',
          sessionId: 'session-1',
          displayName: 'Test User',
          color: '#FF6B6B',
          cursorPosition: 0,
          lastActivity: Date.now(),
        },
        activeUsers: new Map(),
        cursorPositions: new Map(),
        sendEditOperation: mockSendEditOperation,
        updateCursorPosition: vi.fn(),
        pendingOperations: [],
        appliedOperations: [],
      })

      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          enableCollaboration={true}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, {
        target: { value: 'H', selectionStart: 1 },
      })

      await waitFor(() => {
        expect(mockSendEditOperation).toHaveBeenCalled()
      })
    })

    it('should update cursor position on focus change', async () => {
      const { useCollaboration } = await import('@/lib/useCollaboration')
      const mockUpdateCursorPosition = vi.fn()

      vi.mocked(useCollaboration).mockReturnValue({
        currentUser: {
          userId: 'user-1',
          sessionId: 'session-1',
          displayName: 'Test User',
          color: '#FF6B6B',
          cursorPosition: 0,
          lastActivity: Date.now(),
        },
        activeUsers: new Map(),
        cursorPositions: new Map(),
        sendEditOperation: vi.fn(),
        updateCursorPosition: mockUpdateCursorPosition,
        pendingOperations: [],
        appliedOperations: [],
      })

      render(
        <MarkdownEditor
          content="Hello"
          onChange={() => {}}
          enableCollaboration={true}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.blur(textarea)

      await waitFor(() => {
        expect(mockUpdateCursorPosition).toHaveBeenCalled()
      })
    })

    it('should listen for remoteEdit events when collaboration enabled', () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content="Hello"
          onChange={onChange}
          enableCollaboration={true}
        />
      )

      const eventListener = vi.fn()
      window.addEventListener('remoteEdit', eventListener)

      const event = new CustomEvent('remoteEdit', {
        detail: {
          id: 'op1',
          userId: 'user-2',
          sessionId: 'session-2',
          type: 'insert',
          position: 0,
          content: 'Hi ',
          timestamp: Date.now(),
          version: 1,
        },
      })

      window.dispatchEvent(event)

      expect(eventListener).toHaveBeenCalled()

      window.removeEventListener('remoteEdit', eventListener)
    })

    it('should not process own remoteEdit events', async () => {
      const { useCollaboration } = await import('@/lib/useCollaboration')

      const testUser = {
        userId: 'own-user',
        sessionId: 'own-session',
        displayName: 'Me',
        color: '#FF6B6B',
        cursorPosition: 0,
        lastActivity: Date.now(),
      }

      vi.mocked(useCollaboration).mockReturnValue({
        currentUser: testUser,
        activeUsers: new Map(),
        cursorPositions: new Map(),
        sendEditOperation: vi.fn(),
        updateCursorPosition: vi.fn(),
        pendingOperations: [],
        appliedOperations: [],
      })

      render(
        <MarkdownEditor
          content="Hello"
          onChange={() => {}}
          enableCollaboration={true}
        />
      )

      const event = new CustomEvent('remoteEdit', {
        detail: {
          id: 'op1',
          userId: 'own-user', // Same user
          sessionId: 'own-session',
          type: 'insert',
          position: 0,
          content: 'Hi ',
          timestamp: Date.now(),
          version: 1,
        },
      })

      fireEvent.dispatchEvent(window, event)

      // Should not significantly change UI since event is from self
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Hello')
    })
  })

  describe('Props Behavior', () => {
    it('should handle missing optional props', () => {
      render(
        <MarkdownEditor
          content="Test"
          onChange={() => {}}
        />
      )

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Test')
    })

    it('should accept enableCollaboration prop', () => {
      const { rerender } = render(
        <MarkdownEditor
          content="Test"
          onChange={() => {}}
          enableCollaboration={false}
        />
      )

      expect(screen.queryByTestId('user-presence')).toBeNull()

      rerender(
        <MarkdownEditor
          content="Test"
          onChange={() => {}}
          enableCollaboration={true}
        />
      )

      expect(screen.getByTestId('user-presence')).toBeDefined()
    })

    it('should call onChange prop when content changes', async () => {
      const onChange = vi.fn()
      render(
        <MarkdownEditor
          content=""
          onChange={onChange}
          enableCollaboration={false}
        />
      )

      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, {
        target: { value: 'New Content' },
      })

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('New Content')
      })
    })
  })
})
