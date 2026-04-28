'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from './Navbar';

export default function NavbarClient() {
  const { isLoggedIn, userEmail, userName, loading } = useAuth(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.open('/docs/hub.html', '_blank');
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        // Navigate between orange (professor demo) ↔ pro (design workspace)
        // Maps the current page to its equivalent:
        //   /en/case-advisor  →  /en/pro/case-advisor
        //   /en/pro/general-queries  →  /en/general-queries
        const segments = window.location.pathname.split('/').filter(Boolean);
        const locale = segments[0] || 'en';
        const isPro = segments[1] === 'pro';
        if (isPro) {
          // Remove 'pro' segment → go back to orange equivalent page
          const restPath = segments.slice(2).join('/');
          router.push(`/${locale}/${restPath}`);
          toast.success('Original Theme', { duration: 1500 });
        } else {
          // Insert 'pro' segment → go to pro equivalent page
          const restPath = segments.slice(1).join('/');
          router.push(`/${locale}/pro/${restPath}`);
          toast.success('Pro Design Workspace', { duration: 1500 });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      localStorage.removeItem('sessionToken');
    }
    router.push('/auth');
  };

  if (loading) return null;

  return (
    <Navbar
      isLoggedIn={isLoggedIn}
      userEmail={userEmail}
      userName={userName}
      handleLogout={handleLogout}
    />
  );
}
