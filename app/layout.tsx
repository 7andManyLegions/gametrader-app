import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from '@/components/NavBar';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/ThemeContext';



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'GameTrader',
  description: "Buy for less. Sell for more.",
 };

 export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>
          <NavBar />
          <Toaster position="top-center" /> 
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
