export interface Listing {
  id: string;
  title: string;
  platform: string;
  price: number;
  category: string;
  description: string;
  imageUrls: string[];
  coverImage?: string;
  rawgId?: number;
  gamestopSellPrice?: number;
  gamestopTradeInPrice?: number;
  gamestopRecommendedPrice?: number;
  // Fixes:
  createdAt: string;
  updatedAt: string | null;
  userId?: string;
}