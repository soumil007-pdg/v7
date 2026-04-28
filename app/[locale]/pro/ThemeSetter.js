'use client';
import { useEffect } from 'react';

// Sets data-theme="pro" on <html> when on pro pages,
// and removes it cleanly when navigating back to orange pages.
export default function ThemeSetter() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'pro');
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, []);
  return null;
}
