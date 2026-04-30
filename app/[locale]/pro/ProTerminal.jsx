'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations, useLocale } from 'next-intl';
import { Landmark, Scale, ArrowRight, Clock, MapPin, Loader } from 'lucide-react';
import Link from 'next/link';

export default function ProTerminal() {
  const { userEmail, isLoggedIn, loading } = useAuth(false);
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);
  const t = useTranslations('ProTerminal');
  const locale = useLocale();

  useEffect(() => {
    if (!userEmail) { setFetching(false); return; }

    const load = async () => {
      try {
        const res = await fetch('/api/case-advisor/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userEmail }),
        });
        if (res.ok) {
          const data = await res.json();
          setHistory((data.history || []).slice(0, 3));
        }
      } catch (_) {}
      finally { setFetching(false); }
    };
    load();
  }, [userEmail]);

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="lx-hero-terminal">
      {/* Header */}
      <div className="lx-term-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Landmark size={14} />
          <span>ADVOCAT-easy</span>
        </div>
        <span style={{ opacity: 0.5, fontSize: 9, letterSpacing: 1 }}>{t('caseHistory')}</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, marginTop: 20 }}>

        {loading || fetching ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
            <span>{t('loading')}</span>
          </div>

        ) : !isLoggedIn ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 12 }}>
              {t('signInPrompt')}
            </p>
            <Link href={`/${locale}/pro/auth`} style={{
              display: 'inline-block',
              border: '1px solid rgba(212,175,55,0.5)',
              color: '#D4AF37', fontSize: 10,
              padding: '8px 16px', letterSpacing: 1,
              textDecoration: 'none', fontWeight: 600,
            }}>
              {t('signInBtn')}
            </Link>
          </div>

        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <Scale size={24} style={{ color: 'rgba(212,175,55,0.3)', marginBottom: 12 }} />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 14 }}>
              {t('noCases')}
            </p>
            <Link href={`/${locale}/pro/case-advisor`} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: '#D4AF37', fontSize: 10, letterSpacing: 1,
              textDecoration: 'none', fontWeight: 700,
            }}>
              {t('analyseFirst')} <ArrowRight size={12} />
            </Link>
          </div>

        ) : (
          history.map((entry, i) => (
            <Link key={entry.id} href={`/${locale}/pro/case-advisor`} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 14px',
                borderRadius: 4,
                backgroundColor: i === 0 ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.03)',
                border: i === 0 ? '1px solid rgba(212,175,55,0.25)' : '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {/* Title row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                    <Scale size={11} color={i === 0 ? '#D4AF37' : 'rgba(255,255,255,0.3)'} style={{ flexShrink: 0 }} />
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      color: i === 0 ? '#D4AF37' : 'rgba(255,255,255,0.75)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry.caseTitle}
                    </span>
                  </div>
                  {i === 0 && (
                    <span style={{ fontSize: 8, color: '#D4AF37', letterSpacing: 1, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>
                      {t('latest')}
                    </span>
                  )}
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {entry.caseType && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: 0.5 }}>
                      {entry.caseType.toUpperCase()}
                    </span>
                  )}
                  {entry.city && (
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <MapPin size={8} /> {entry.city}
                    </span>
                  )}
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', gap: 3, marginLeft: 'auto' }}>
                    <Clock size={8} /> {timeAgo(entry.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      {isLoggedIn && history.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href={`/${locale}/pro/case-advisor`} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 1,
            textDecoration: 'none', fontWeight: 600,
          }}>
            <span>{t('newCaseAnalysis')}</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
