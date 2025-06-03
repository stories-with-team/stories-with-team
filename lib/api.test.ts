import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveStory } from './api'; // Adjust path as necessary

// Mock the global fetch function
global.fetch = vi.fn();

describe('saveStory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send a POST request to /api/saveStory with markdown content', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Story saved successfully!' }),
    } as Response);

    const markdown = `# Test Story
This is a test.`;
    await saveStory(markdown);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/saveStory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ markdown }),
    });
  });

  it('should throw an error if the save operation fails (response not ok)', async () => {
    const errorMessage = 'Failed to save story due to server error.';
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: errorMessage }),
    } as Response);

    const markdown = `# Test Story
This is another test.`;
    await expect(saveStory(markdown)).rejects.toThrow(errorMessage);
  });

  it('should throw a generic error if the save operation fails and no error message is provided by the server', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}), // No error field in response
    } as Response);

    const markdown = `# Test Story
This is a test for generic error.`;
    await expect(saveStory(markdown)).rejects.toThrow('Failed to save story.');
  });

  it('should throw an error if the fetch call itself fails', async () => {
    const networkErrorMessage = 'Network error';
    vi.mocked(fetch).mockRejectedValueOnce(new Error(networkErrorMessage));

    const markdown = `# Test Story
This is for network error.`;
    await expect(saveStory(markdown)).rejects.toThrow(networkErrorMessage);
  });
});
