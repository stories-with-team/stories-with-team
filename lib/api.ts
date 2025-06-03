export async function saveStory(markdown: string): Promise<void> {
  const response = await fetch('/api/saveStory', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ markdown }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save story.');
  }

  // Optionally, you can return data from the response if needed
  // const data = await response.json();
  // return data;
}
