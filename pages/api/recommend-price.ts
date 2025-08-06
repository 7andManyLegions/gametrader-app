// pages/api/recommend-price.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import stringSimilarity from 'string-similarity';

puppeteer.use(StealthPlugin());

type ScrapedData = {
  title?: string;
  sellPrice?: number;
  tradeInPrice?: number;
  recommendedPrice?: number;
  error?: string;
};

type Data = {
  title: string;
  recommendedPrice?: number;
  sources?: {
    gamestop?: ScrapedData;
    amazon?: ScrapedData;
  };
  error?: string;
};

// Normalize input strings for better fuzzy matching
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function scrapeGamestop(title: string): Promise<ScrapedData | null> {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const normalizedQuery = normalize(title);
    const urlQuery = title.trim().toLowerCase().replace(/\s+/g, '-');

    const searchUrl = `https://www.gamestop.com/search/?q=${encodeURIComponent(title)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    await page.waitForSelector('a.product-tile-link.render-tile-link.pdp-link', { timeout: 10000 });

    const productLinks: { href: string; text: string }[] = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a.product-tile-link.render-tile-link.pdp-link'));
      return anchors.map(anchor => ({
        href: (anchor as HTMLAnchorElement).href || '',
        text: anchor.textContent?.trim() || '',
      }));
    });

    if (!productLinks.length) {
      return { error: 'No product links found on GameStop.' };
    }

    type ProductMatch = { href: string; text: string; score: number; similarity: number; };

    const scored: ProductMatch[] = productLinks
      .map((p): ProductMatch => {
        const normalizedTitle = normalize(p.text);
        const similarity = stringSimilarity.compareTwoStrings(normalizedTitle, normalizedQuery);
        let score = similarity * 5;
        if (normalizedTitle.includes(normalizedQuery)) score += 1;
        if (p.href.toLowerCase().includes(urlQuery)) score += 0.5;
        return { href: p.href, text: p.text, score, similarity };
      })
      .sort((a, b) => b.score - a.score);

    const bestMatch = scored[0];
    if (!bestMatch || bestMatch.similarity < 0.4) {
      return { error: 'No high-confidence match found on GameStop.' };
    }

    const pidMatch = bestMatch.href.match(/\/(\d+)\.html$/);
    const pid = pidMatch ? pidMatch[1] : null;

    if (!pid) {
      return { error: 'Could not extract PID from GameStop product URL.' };
    }

    await page.goto(bestMatch.href, { waitUntil: 'networkidle2' });
    const sellPriceRaw = await page.$eval('div.primary-details-row span.actual-price', el =>
      el.textContent?.replace(/[^\d.]/g, '') || '0'
    );
    const sellPrice = parseFloat(sellPriceRaw);

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

    if (isNaN(sellPrice) || isNaN(tradeInPrice)) {
      return { error: 'Could not extract both prices from GameStop.' };
    }

    const recommendedPrice = Math.round(sellPrice - ((sellPrice - tradeInPrice) * .66));

    return {
      title: bestMatch.text,
      sellPrice,
      tradeInPrice,
      recommendedPrice,
    };
  } catch (error: any) {
    console.error('GameStop scraper error:', error);
    return { error: error.message || 'GameStop scraper failed.' };
  } finally {
    if (browser) await browser.close();
  }
}

async function scrapeAmazon(title: string): Promise<ScrapedData | null> {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(title)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const productData = await page.evaluate(() => {
      const firstProduct = document.querySelector('.s-result-item .a-price-whole');
      const firstProductTitle = document.querySelector('.s-result-item h2 a span');
      if (firstProduct && firstProductTitle) {
        const sellPrice = parseFloat(firstProduct.textContent?.replace(/[^0-9.]/g, '') || '0');
        return {
          title: firstProductTitle.textContent || '',
          sellPrice,
        };
      }
      return null;
    });

    if (productData) {
      return productData;
    } else {
      return { error: 'No product found on Amazon.' };
    }
  } catch (error: any) {
    console.error('Amazon scraper error:', error);
    return { error: error.message || 'Amazon scraper failed.' };
  } finally {
    if (browser) await browser.close();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const { title } = req.query;

  if (!title || typeof title !== 'string') {
    return res.status(400).json({ title: '', error: 'Missing title query parameter' });
  }

  const [gamestopData, amazonData] = await Promise.all([
    scrapeGamestop(title),
    scrapeAmazon(title)
  ]);

  const recommendedPrice = gamestopData?.recommendedPrice;

  res.status(200).json({
    title: gamestopData?.title || amazonData?.title || title,
    recommendedPrice,
    sources: {
      gamestop: gamestopData || undefined,
      amazon: amazonData || undefined,
    },
  });
}