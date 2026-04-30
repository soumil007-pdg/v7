import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import {
  Landmark, Activity, Target, MessageSquare, Scale,
  MousePointerClick, ShieldCheck, Brain, Layers, RefreshCw, Clock
} from 'lucide-react';
import ProTerminal from './ProTerminal';
import ProFAQ from './ProFAQ';
import './Home.css';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ProHomePage' });
  return {
    title: 'ADVOCAT-Easy — Legal Command Center',
    robots: { index: false, follow: false },
  };
}

export default async function ProHomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ProHomePage' });

  return (
    <div className="lx-wrapper">

      {/* ── Hero ───────────────────────────────────────── */}
      <header className="lx-hero">
        <div className="lx-hero-content">
          <div className="lx-hero-badge">
            <Landmark size={12} /> {t('badge')}
          </div>
          <h2 className="lx-hero-title lx-serif">
            {t('titlePart1')}<span className="lx-gold lx-italic">{t('titlePart2')}</span><br />
            {t('titlePart3')}
          </h2>
          <p className="lx-hero-desc">
            {t('desc')}
          </p>
          <div className="lx-hero-buttons">
            <Link href={`/${locale}/pro/general-queries`}>
              <button className="lx-btn-primary">{t('quickChatBtn')}</button>
            </Link>
            <Link href={`/${locale}/pro/case-advisor`}>
              <button className="lx-btn-secondary">{t('caseAdvisorBtn')}</button>
            </Link>
          </div>
        </div>

        <ProTerminal />
      </header>

      {/* ── Section 2: Empower ─────────────────────────── */}
      <section className="lx-section">
        <div className="lx-center-header">
          <h2 className="lx-section-title lx-serif">
            {t('empowerTitle')}
          </h2>
          <p className="lx-section-desc">
            {t('empowerDesc')}
          </p>
        </div>

        <div className="lx-cards-grid">
          <div className="lx-card lx-card-white">
            <div className="lx-icon-box dark">
              <Activity size={20} />
            </div>
            <h3 className="lx-card-title">{t('clarityTitle')}</h3>
            <p className="lx-card-desc">
              {t('clarityDesc')}
            </p>
          </div>

          <div className="lx-card lx-card-dark">
            <div className="lx-icon-box outline">
              <Target size={20} />
            </div>
            <h3 className="lx-card-title">{t('confidenceTitle')}</h3>
            <p className="lx-card-desc">
              {t('confidenceDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 3: The Suite ───────────────────────── */}
      <section className="lx-suite-section">
        <div className="lx-suite-header">
          <p className="lx-tag">{t('suiteTag')}</p>
          <h2 className="lx-suite-title lx-serif">{t('suiteTitle')}</h2>
        </div>

        <div className="lx-cards-grid">
          <div className="lx-suite-card lx-card-white">
            <div className="lx-suite-card-top">
              <div className="lx-icon-box dark">
                <MessageSquare size={20} />
              </div>
              <span className="lx-badge muted">{t('instantAccess')}</span>
            </div>
            <h3 className="lx-card-title">{t('quickRightsTitle')}</h3>
            <p className="lx-card-desc">
              {t('quickRightsDesc')}
            </p>
            <Link href={`/${locale}/pro/general-queries`} className="lx-link">
              {t('initiateDialogue')} <span>&rarr;</span>
            </Link>
          </div>

          <div className="lx-suite-card lx-card-dark">
            <div className="lx-suite-card-top">
              <div className="lx-icon-box outline">
                <Scale size={20} />
              </div>
              <span className="lx-badge gold">{t('deepAnalysis')}</span>
            </div>
            <h3 className="lx-card-title">{t('caseStrategistTitle')}</h3>
            <p className="lx-card-desc">
              {t('caseStrategistDesc')}
            </p>
            <Link href={`/${locale}/pro/case-advisor`} className="lx-link">
              {t('developStrategy')} <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 4: Features (F Layout) ─────────────── */}
      <section className="lx-frow-section">
        <div className="lx-frow-header">
          <p className="lx-tag">{t('standardTag')}</p>
          <h2 className="lx-frow-title lx-serif">
            {t('standardTitle1')}<span className="lx-gold lx-italic">{t('standardTitle2')}</span>{t('standardTitle3')}
          </h2>
        </div>

        <div className="lx-frow-list">
          <ProFeatureRow
            icon={Layers}
            title={t('intuitiveTitle')}
            description={t('intuitiveDesc')}
            variant="dark"
          />
          <ProFeatureRow
            icon={ShieldCheck}
            title={t('accuracyTitle')}
            description={t('accuracyDesc')}
            variant="light"
          />
          <ProFeatureRow
            icon={Clock}
            title={t('speedTitle')}
            description={t('speedDesc')}
            variant="gold"
          />
        </div>
      </section>

      {/* ── Section 5: FAQ ─────────────────────────────── */}
      <ProFAQ />

    </div>
  );
}

const ProFeatureRow = ({ icon: Icon, title, description, variant }) => {
  const isDark = variant === 'dark';
  const isGold = variant === 'gold';

  const bg     = isDark ? '#111827' : isGold ? '#D4AF37' : '#ffffff';
  const border  = isDark || isGold ? 'none' : '1px solid rgba(0,0,0,0.07)';
  const iconBg  = isDark ? 'rgba(212,175,55,0.1)' : isGold ? 'rgba(255,255,255,0.2)' : '#f3f4f6';
  const iconColor = isDark ? '#D4AF37' : isGold ? '#000' : '#111827';
  const titleColor = isDark || isGold ? (isGold ? '#000' : '#fff') : '#111827';
  const descColor  = isDark ? '#6B7280' : isGold ? 'rgba(0,0,0,0.65)' : '#6B7280';
  const divider    = isDark ? '1px solid rgba(255,255,255,0.07)' : isGold ? '1px solid rgba(0,0,0,0.1)' : '1px solid #e5e7eb';

  return (
    <div className="lx-frow-item" style={{ background: bg, border }}>
      <div className="lx-frow-left">
        <div className="lx-frow-icon-box" style={{ background: iconBg }}>
          <Icon size={28} strokeWidth={1.8} style={{ color: iconColor }} />
        </div>
        <h3 className="lx-frow-item-title lx-serif" style={{ color: titleColor }}>{title}</h3>
      </div>
      <div className="lx-frow-right" style={{ borderLeft: divider }}>
        <p className="lx-frow-desc" style={{ color: descColor }}>{description}</p>
      </div>
    </div>
  );
};
