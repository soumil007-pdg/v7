'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import {
  Scale, MessageCircle, Briefcase, ArrowRight, ShieldCheck,
  Clock, MapPin, FolderOpen, TrendingUp, Zap,
  AlertTriangle, Users, BookOpen, ChevronRight,
} from 'lucide-react';
import './Dashboard.css';

/* ── Helpers ───────────────────────────────────────── */
const caseTypeColors = {
  contract: '#3B82F6',
  property: '#10B981',
  family:   '#8B5CF6',
  consumer: '#F59E0B',
  tort:     '#EF4444',
  other:    '#6B7280',
};

const strengthConfig = {
  Strong:   { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)'  },
  Moderate: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)'  },
  Weak:     { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)'   },
};

const LEGAL_REFS = [
  {
    Icon: Clock,
    title: 'Limitation Periods',
    color: '#3B82F6',
    items: ['Contracts & torts — 3 years', 'Property recovery — 12 years', 'Consumer complaints — 2 years'],
  },
  {
    Icon: ShieldCheck,
    title: 'Consumer Court Limits',
    color: '#10B981',
    items: ['District Court — up to ₹50 Lakh', 'State Commission — ₹50L to ₹2 Cr', 'National Commission — above ₹2 Cr'],
  },
  {
    Icon: AlertTriangle,
    title: 'Section 65B Affidavit',
    color: '#F59E0B',
    items: ['Required for WhatsApp, emails, CCTV', 'Must be certified by the device owner', 'Missing it = evidence inadmissible in court'],
  },
  {
    Icon: Users,
    title: 'Lok Adalat',
    color: '#8B5CF6',
    items: ['Free, fast & legally binding settlement', 'Ideal for motor accidents, cheque bounces', 'Award cannot be appealed once passed'],
  },
];

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const topCaseType = (history) => {
  if (!history.length) return null;
  const counts = {};
  history.forEach(h => { counts[h.caseType] = (counts[h.caseType] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
};

/* Parse "Prima Facie Strength: Strong/Moderate/Weak" from AI result */
const parseStrength = (result) => {
  if (!result) return null;
  const match = result.match(/Prima Facie Strength[^:]*:\s*\*{0,2}(Strong|Moderate|Weak)\*{0,2}/i);
  return match ? match[1] : null;
};

/* Parse the Immediate action from Strategic Action Plan section */
const parseImmediateAction = (result) => {
  if (!result) return null;
  const match = result.match(/\*{1,2}Immediate[^*:]*[*:]+\*{0,2}\s*([^\n]+)/i);
  if (!match) return null;
  return match[1].replace(/\*\*/g, '').replace(/^\(|\)$/g, '').trim();
};

/* ── Component ─────────────────────────────────────── */
export default function DashboardProClient() {
  const locale = useLocale();
  const t = useTranslations('Dashboard');
  const { userEmail, userName, loading } = useAuth(true);

  const [history, setHistory]           = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;
    fetch('/api/case-advisor/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail }),
    })
      .then(r => r.ok ? r.json() : { history: [] })
      .then(d => setHistory(d.history || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, [userEmail]);

  if (loading) return null;

  const recent      = history.slice(0, 3);
  const topType     = topCaseType(history);
  const lastActive  = history[0]?.createdAt ? timeAgo(history[0].createdAt) : null;
  const lastCase    = history[0] || null;
  const immediateAction = lastCase ? parseImmediateAction(lastCase.result) : null;

  return (
    <div className="dash-container">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="dash-header">
        <div className="dash-logo-box">
          <Scale size={36} className="dash-logo-icon" strokeWidth={2} />
        </div>
        <h1 className="dash-main-title">
          {userName ? `Welcome back, ${userName.split(' ')[0]}` : t('title')}
        </h1>
        <p className="dash-main-subtitle">
          {t.rich('subtitle', { bold: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </div>

      {/* ── Stats Row ──────────────────────────────────── */}
      {!historyLoading && history.length > 0 && (
        <div className="dash-stats-row">
          <div className="dash-stat">
            <span className="dash-stat-value">{history.length}</span>
            <span className="dash-stat-label">Cases Analysed</span>
          </div>
          <div className="dash-stat-divider" />
          {lastActive && (
            <>
              <div className="dash-stat">
                <span className="dash-stat-value">{lastActive}</span>
                <span className="dash-stat-label">Last Active</span>
              </div>
              <div className="dash-stat-divider" />
            </>
          )}
          {topType && (
            <div className="dash-stat">
              <span
                className="dash-stat-value"
                data-colored="true"
                style={{ color: caseTypeColors[topType] || '#D4AF37', textTransform: 'capitalize' }}
              >
                {topType}
              </span>
              <span className="dash-stat-label">Top Case Type</span>
            </div>
          )}
        </div>
      )}

      {/* ── Immediate Action Card ───────────────────────── */}
      {immediateAction && lastCase && (
        <div className="dash-action-card">
          <div className="dash-action-left">
            <div className="dash-action-icon-box">
              <Zap size={16} style={{ color: '#D4AF37' }} />
            </div>
            <div className="dash-action-body">
              <div className="dash-action-meta">
                <span className="dash-action-tag">IMMEDIATE ACTION</span>
                <span className="dash-action-case-name">{lastCase.caseTitle}</span>
              </div>
              <p className="dash-action-text">{immediateAction}</p>
            </div>
          </div>
          <Link href={`/${locale}/pro/case-advisor`} className="dash-action-btn">
            Open Case <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* ── Tool Cards ─────────────────────────────────── */}
      <div className="dash-main">

        <div className="dash-card dash-card-dark">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <MessageCircle size={22} className="dash-icon-gold" strokeWidth={2} />
              {t('quickChat.title')}
            </h2>
            <div className="dash-badge dash-badge-light">{t('quickChat.tag').toUpperCase()}</div>
          </div>
          <p className="dash-card-desc">{t('quickChat.desc')}</p>
          <Link href={`/${locale}/pro/general-queries`} className="dash-btn dash-btn-gold">
            {t('quickChat.btn')} <ArrowRight size={16} />
          </Link>
        </div>

        <div className="dash-card dash-card-light">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <Briefcase size={22} className="dash-icon-dark" strokeWidth={2} />
              {t('caseAdvisor.title')}
            </h2>
            <div className="dash-badge dash-badge-dark">{t('caseAdvisor.tag').toUpperCase()}</div>
          </div>
          <p className="dash-card-desc">{t('caseAdvisor.desc')}</p>
          <Link href={`/${locale}/pro/case-advisor`} className="dash-btn dash-btn-dark">
            {t('caseAdvisor.btn')} <ArrowRight size={16} />
          </Link>
        </div>

      </div>

      {/* ── Recent Cases ───────────────────────────────── */}
      <div className="dash-recent-section">
        <div className="dash-recent-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} style={{ color: '#D4AF37' }} />
            <span className="dash-recent-title">Recent Cases</span>
          </div>
          {history.length > 3 && (
            <Link href={`/${locale}/pro/case-advisor`} className="dash-recent-viewall">
              View all <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {historyLoading ? (
          <div className="dash-recent-empty">
            <span style={{ color: '#64748B', fontSize: 13 }}>Loading…</span>
          </div>
        ) : recent.length === 0 ? (
          <div className="dash-recent-empty">
            <FolderOpen size={32} style={{ color: 'rgba(0,0,0,0.12)', marginBottom: 12 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#94A3B8' }}>
              No cases yet. Run your first analysis above.
            </p>
          </div>
        ) : (
          <div className="dash-recent-list">
            {recent.map((entry, i) => {
              const strength = parseStrength(entry.result);
              const sc = strength ? strengthConfig[strength] : null;
              return (
                <Link key={entry.id || i} href={`/${locale}/pro/case-advisor`} className="dash-case-row">
                  <div className="dash-case-left">
                    <div
                      className="dash-case-dot"
                      style={{ background: caseTypeColors[entry.caseType] || '#D4AF37' }}
                    />
                    <div className="dash-case-info">
                      <span className="dash-case-title">{entry.caseTitle || 'Untitled Case'}</span>
                      <div className="dash-case-meta">
                        {entry.caseType && (
                          <span
                            className="dash-case-type"
                            style={{ color: caseTypeColors[entry.caseType] || '#D4AF37' }}
                          >
                            {entry.caseType.toUpperCase()}
                          </span>
                        )}
                        {entry.city && (
                          <span className="dash-case-city">
                            <MapPin size={10} /> {entry.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="dash-case-right">
                    {/* Strength badge */}
                    {sc && (
                      <span
                        className="dash-strength-badge"
                        style={{ color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}
                      >
                        {strength}
                      </span>
                    )}
                    <span className="dash-case-time">
                      <Clock size={10} /> {timeAgo(entry.createdAt)}
                    </span>
                    <ArrowRight size={14} style={{ color: '#CBD5E1' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Legal Quick Reference ───────────────────────── */}
      <div className="dash-ref-section">
        <div className="dash-recent-header" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} style={{ color: '#D4AF37' }} />
            <span className="dash-recent-title">Legal Quick Reference</span>
          </div>
          <span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: 0.5 }}>
            INDIAN LAW · ALWAYS RELEVANT
          </span>
        </div>

        <div className="dash-ref-grid">
          {LEGAL_REFS.map(({ Icon, title, color, items }) => (
            <div key={title} className="dash-ref-card">
              <div className="dash-ref-card-top">
                <div className="dash-ref-icon" style={{ background: `${color}14`, color }}>
                  <Icon size={16} />
                </div>
                <h4 className="dash-ref-title">{title}</h4>
              </div>
              <ul className="dash-ref-list">
                {items.map(item => (
                  <li key={item} className="dash-ref-item">
                    <span className="dash-ref-dot" style={{ background: color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="dash-footer">
        <ShieldCheck size={14} />
        <span>{t('footer').toUpperCase()}</span>
      </div>

    </div>
  );
}
