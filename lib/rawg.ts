export async function searchGames(query: string): Promise<{ name: string }[]> {
  if (!query) return [];

  const url = `https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.results) return [];
    return data.results.map((game: any) => ({ name: game.name }));
  } catch (error) {
    console.error('RAWG API fetch failed:', error);
    return [];
  }
}
