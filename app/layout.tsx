'use client';

import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SearchProvider } from '@/context/SearchContext';
import TopSearchBar from '@/components/TopSearchBar';
import SearchPopup from '@/components/SearchPopup';
import { Anton } from 'next/font/google';
import { Bebas_Neue } from 'next/font/google';
import { Manrope } from 'next/font/google';
import { Poppins } from 'next/font/google';



const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
});

const bebas = Bebas_Neue({
  weight: '400', 
  subsets: ['latin'],
  variable: '--font-bebas',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-manrope',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
            <head>
        <script
          src="https://www.google.com/recaptcha/enterprise.js?render=6LfiKoErAAAAAODj_xpFDmh0ltGZlGG2N-hmvxA3"
          async
          defer
        ></script>
      </head>
      <body className={poppins.variable}>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <TopSearchBar />
              <SearchPopup />
               <main className="pt-20 px-4">{children}</main>
               <div id="modal-root" />
               <div id="recaptcha-container" className="hidden" />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
