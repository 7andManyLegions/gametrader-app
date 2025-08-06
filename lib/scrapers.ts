// lib/scrapers.ts
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import stringSimilarity from 'string-similarity';

puppeteer.use(StealthPlugin());

function normalize(str: string): string {
  // Your existing normalize function
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Scraper for GameStop (based on your existing code)
export async function scrapeGamestop(title: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  // ... your GameStop scraping logic here ...
  await browser.close();
  return {
    source: 'GameStop',
    sellPrice,
    tradeInPrice,
    recommendedPrice,
  };
}

// Scraper for Amazon (new)
export async function scrapeAmazon(title: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(title)}`;
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });

  // Example: Find the first product with a price and a title similar to the query
  const productData = await page.evaluate((normalizedQuery) => {
    const products = Array.from(document.querySelectorAll('.s-result-item'));
    for (const product of products) {
      const productTitleElement = product.querySelector('h2 a span');
      const productPriceElement = product.querySelector('.a-price-whole');
      
      if (productTitleElement && productPriceElement) {
        const productTitle = productTitleElement.textContent;
        const price = productPriceElement.textContent;
        // You would use stringSimilarity here to validate the match
        // and extract the price.
        if (productTitle?.toLowerCase().includes(normalizedQuery)) {
          return {
            title: productTitle,
            sellPrice: parseFloat(price?.replace(/[^0-9.]/g, '') || '0'),
          };
        }
      }
    }
    return null;
  }, normalize(title));

  await browser.close();
  if (!productData) return null;

  return {
    source: 'Amazon',
    sellPrice: productData.sellPrice,
  };
}
