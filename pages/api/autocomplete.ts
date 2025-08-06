import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.q as string;
  const category = req.query.category as string;

  if (!query || !category) {
    return res.status(400).json({ error: 'Missing query or category' });
  }

  try {
    if (category === 'Game') {
      const baseURL = 'https://api.rawg.io/api/games';
      const rawgKey = process.env.NEXT_PUBLIC_RAWG_API_KEY;

      const searchRes = await fetch(`${baseURL}?key=${rawgKey}&search=${encodeURIComponent(query)}&page_size=5`);
      const searchData = await searchRes.json();
      const searchResults = searchData.results || [];

      const detailedResults = await Promise.all(
  searchResults.map(async (game: any) => {
    try {
      const detailRes = await fetch(`${baseURL}/${game.id}?key=${rawgKey}`);
      const detailData = await detailRes.json();

      console.log(`[RAWG DETAIL]`, {
        id: detailData.id,
        name: detailData.name,
        background_image: detailData.background_image,
        screenshots: detailData.short_screenshots,
      });

      return {
        name: detailData.name,
        id: detailData.id,
        image: detailData.background_image || detailData.short_screenshots?.[0]?.image || '',
      };
    } catch {
      return {
        name: game.name,
        id: game.id,
        image: '',
      };
    }
  })
);

      return res.status(200).json({ results: detailedResults });
    }

    if (category === 'Accessory') {
      const googleRes = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`
      );
      const googleData = await googleRes.json();
      const suggestions = googleData[1] || [];
      return res.status(200).json({ suggestions });
    }

    return res.status(400).json({ error: 'Unhandled category' });
  } catch (err) {
    console.error('Autocomplete API error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
