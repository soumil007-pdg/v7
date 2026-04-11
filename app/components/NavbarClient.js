'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarClient() {
  const { isLoggedIn, userEmail, userName, loading } = useAuth(false);
  const router = useRouter();

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
