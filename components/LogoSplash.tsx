'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function LogoSplash() {
  const [showLogo, setShowLogo] = useState(false);
  const [showText, setShowText] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    // Show the logo first
    const logoTimeout = setTimeout(() => {
      setShowLogo(true);
    }, 200);

    // Then show the text after the logo has appeared
    const textTimeout = setTimeout(() => {
      setShowText(true);
    }, 1000); // Wait 1 second after the logo appears

    // Blinking dots animation
    const dotsInterval = setInterval(() => {
      setDots((prev) => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500); // Cycle every half second

    // Set the total splash screen duration to 6.5 seconds (7.5s - 1s)
    const splashEndTimeout = setTimeout(() => {
      setShowLogo(false);
      setShowText(false);
    }, 6500);

    return () => {
      clearTimeout(logoTimeout);
      clearTimeout(textTimeout);
      clearTimeout(splashEndTimeout);
      clearInterval(dotsInterval);
    };
  }, []);

  if (!showLogo && !showText) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white text-black">
      <AnimatePresence>
        {showLogo && (
          <motion.div
            key="logo-container"
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              damping: 8,
              stiffness: 120,
              duration: 1.2,
            }}
            className="mb-8"
          >
            <motion.img
              src="/logo_only.png"
              alt="GameTrader Logo"
              className="w-48"
              // Continuous spin animation
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showText && (
          <motion.p
            key="tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="font-semibold text-lg text-gray-600 tracking-wider"
          >
            Optimizing UX{dots}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}