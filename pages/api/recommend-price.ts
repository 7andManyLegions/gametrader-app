import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

type Data = {
  title: string;
  sellPrice?: number;
  tradeInPrice?: number;
  recommendedPrice?: number;
  error?: string;
  debug?: any;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { title } = req.query;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ title: '', error: 'Missing title query parameter' });
  }

  const query = title.trim().toLowerCase().replace(/\s+/g, '-');
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // 1. Go to GameStop Search Page
    const searchUrl = `https://www.gamestop.com/search/?q=${encodeURIComponent(title)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    await page.waitForSelector('a.product-tile-link.render-tile-link.pdp-link', { timeout: 10000 });

    // 2. Extract all product links and titles
    const productLinks = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a.product-tile-link.render-tile-link.pdp-link'));
      return anchors.map(anchor => ({
        href: (anchor as HTMLAnchorElement).href || '',
        text: anchor.textContent?.trim() || '',
      }));
    });

    if (!productLinks.length) {
      return res.status(404).json({ title, error: 'No product links found in search results' });
    }

    // 3. Score best match
    // Score and sort results
const scored = productLinks
.map(p => {
  const normalizedHref = p.href.toLowerCase();
  const normalizedText = p.text.toLowerCase();
  let score = 0;

  if (normalizedHref.includes(query)) score += 2;
  if (normalizedText.includes(title.toLowerCase())) score += 1;

  return { ...p, score };
})
.sort((a, b) => b.score - a.score);

// Use best non-zero score, or fallback to first if all are zero
const bestMatch = scored.find(p => p.score > 0) || scored[0];

if (!bestMatch?.href) {
return res.status(404).json({
  title,
  error: 'No good match found for listing title',
  debug: {
    query,
    candidates: productLinks.slice(0, 5),
    scored: scored.slice(0, 5),
  },
});
}


    if (!bestMatch?.href) {
        return res.status(404).json({
          title,
          error: 'No good match found for listing title',
          debug: {
            query,
            candidates: productLinks.slice(0, 5),
            scored: scored.slice(0, 5),
          },
        });
      }
      
      // If score is 0, log it but proceed anyway as fallback
      if (bestMatch.score === 0) {
        console.warn(`Fallback: proceeding with low-confidence match for "${title}" →`, bestMatch.href);
      }
      

    // 4. Extract PID from URL
    const pidMatch = bestMatch.href.match(/\/(\d+)\.html$/);
    const pid = pidMatch ? pidMatch[1] : null;

    if (!pid) {
      return res.status(500).json({ title, error: 'Could not extract PID from product URL' });
    }

    // 5. Scrape Sell Price
    await page.goto(bestMatch.href, { waitUntil: 'networkidle2' });
    const sellPriceRaw = await page.$eval('div.primary-details-row span.actual-price', el =>
      el.textContent?.replace(/[^\d.]/g, '') || '0'
    );
    const sellPrice = parseFloat(sellPriceRaw);

    // 6. Scrape Trade-In Price
    const tradeUrl = `https://www.gamestop.com/trade/details/?pid=${pid}`;
await page.goto(tradeUrl, { waitUntil: 'networkidle2' });

const tradeInPrice = await page.evaluate(() => {
  const spans = Array.from(document.querySelectorAll('.trade-value span'));
  const values = spans
    .map(el => el.textContent?.match(/[\d.]+/))
    .filter(Boolean)
    .map(match => parseFloat(match?.[0] || '0'))
    .filter(v => !isNaN(v));

  return values.length ? Math.min(...values) : 0;
});    

    // 7. Final response
    if (isNaN(sellPrice) || isNaN(tradeInPrice)) {
      return res.status(500).json({ title: bestMatch.text, error: 'Could not extract both prices' });
    }

    const recommendedPrice = Math.round(((sellPrice + tradeInPrice) / 2) * 100) / 100;

    res.status(200).json({
      title: bestMatch.text,
      sellPrice,
      tradeInPrice,
      recommendedPrice,
    });
  } catch (error: any) {
    res.status(500).json({ title, error: error.message || 'Something went wrong' });
  } finally {
    if (browser) await browser.close();
  }
}
