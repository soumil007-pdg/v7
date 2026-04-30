'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Scale, MessageSquare, FileText, LayoutDashboard, LogOut, Globe } from 'lucide-react';

export default function ProNavbarClient() {
  const { isLoggedIn, userEmail, userName, loading } = useAuth(false);
  const router = useRouter();
  const pathname = usePathname();

  const currentLocale = pathname.split('/')[1] || 'en';

  const handleLanguageChange = (e) => {
    const nextLocale = e.target.value;
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/') || '/');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('sessionToken');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      localStorage.removeItem('sessionToken');
      document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    window.location.href = `/${currentLocale}/pro/auth`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        const segments = window.location.pathname.split('/').filter(Boolean);
        const locale = segments[0] || 'en';
        const restPath = segments.slice(2).join('/');
        router.push(`/${locale}/${restPath}`);
        toast.success('Original Theme', { duration: 1500 });
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        window.open('/docs/hub.html', '_blank');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) return null;

  return (
    <nav style={{
      backgroundColor: '#111827',
      borderBottom: '1px solid rgba(212,175,55,0.12)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>

      {/* Logo */}
      <Link href={`/${currentLocale}/pro`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <Scale size={28} style={{ color: '#D4AF37' }} strokeWidth={2} />
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#D4AF37', letterSpacing: '1.5px' }}>
          ADVOCAT-Easy
        </span>
      </Link>

      {/* Center links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <Link href={`/${currentLocale}/pro/general-queries`} style={linkStyle}>
          <MessageSquare size={14} /> Quick Rights
        </Link>
        <Link href={`/${currentLocale}/pro/case-advisor`} style={linkStyle}>
          <FileText size={14} /> Case Strategist
        </Link>
        <Link href={`/${currentLocale}/pro/dashboard`} style={linkStyle}>
          <LayoutDashboard size={14} /> Dashboard
        </Link>
      </div>

      {/* Right — language + auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Language switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)' }}>
          <Globe size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <select
            onChange={handleLanguageChange}
            value={currentLocale}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 12, outline: 'none', cursor: 'pointer', border: 'none' }}
          >
            <option value="en" style={{ background: '#111827' }}>English</option>
            <option value="hi" style={{ background: '#111827' }}>हिन्दी</option>
            <option value="mr" style={{ background: '#111827' }}>मराठी</option>
            <option value="te" style={{ background: '#111827' }}>తెలుగు</option>
          </select>
        </div>

        {isLoggedIn ? (
          <>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter,sans-serif' }}>
              {userName || userEmail}
            </span>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.3 }}>
              <LogOut size={13} /> Logout
            </button>
          </>
        ) : (
          <Link href={`/${currentLocale}/pro/auth`} style={{ background: '#D4AF37', color: '#000', padding: '7px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: 0.5 }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  color: 'rgba(255,255,255,0.55)',
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.3px',
  transition: 'color 0.2s',
};
