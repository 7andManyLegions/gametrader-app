export async function validateGameTitle(inputTitle: string): Promise<string> {
  const res = await fetch('/api/validate-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: inputTitle }),
  });

  const data = await res.json();
  return data.cleanedTitle || 'UNKNOWN';
}

