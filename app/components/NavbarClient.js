'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
