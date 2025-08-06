'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface CartItem {
  listingId: string;
  title: string;
  price: number;
  sellerStripeId: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listingId: string) => void;
  clear: () => void;
}

// Create the context with an explicit (nullable) type
const CartContext = createContext<CartContextValue | undefined>(undefined);

// Strongly-typed props so “children” isn’t implicit any
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage once on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  // Persist whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => setItems(prev => [...prev, item]);
  const removeItem = (listingId: string) =>
    setItems(prev => prev.filter(i => i.listingId !== listingId));
  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

// Hook to consume the cart context
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
