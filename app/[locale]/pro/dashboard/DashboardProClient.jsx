'use client';
import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Scale, MessageCircle, Briefcase, ArrowRight, ShieldCheck } from 'lucide-react';
import './Dashboard.css';

export default function DashboardProClient() {
  const locale = useLocale();
  const t = useTranslations('Dashboard');

  return (
    <div className="dash-container">

      {/* Header */}
      <div className="dash-header">
        <div className="dash-logo-box">
          <Scale size={36} className="dash-logo-icon" strokeWidth={2} />
        </div>
        <h1 className="dash-main-title">{t('title')}</h1>
        <p className="dash-main-subtitle">
          {t.rich('subtitle', { bold: (chunks) => <strong>{chunks}</strong> })}
        </p>
      </div>

      {/* Cards */}
      <div className="dash-main">

        {/* Quick Rights Chat */}
        <div className="dash-card dash-card-dark">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <MessageCircle size={26} className="dash-icon-gold" strokeWidth={2} />
              {t('quickChat.title')}
            </h2>
            <div className="dash-badge dash-badge-light">{t('quickChat.tag').toUpperCase()}</div>
          </div>
          <p className="dash-card-desc">
            {t('quickChat.desc')}
          </p>
          <Link href={`/${locale}/pro/general-queries`} className="dash-btn dash-btn-gold">
            {t('quickChat.btn')} <ArrowRight size={17} />
          </Link>
        </div>

        {/* Case Strategist */}
        <div className="dash-card dash-card-light">
          <div className="dash-card-header">
            <h2 className="dash-card-title">
              <Briefcase size={26} className="dash-icon-dark" strokeWidth={2} />
              {t('caseAdvisor.title')}
            </h2>
            <div className="dash-badge dash-badge-dark">{t('caseAdvisor.tag').toUpperCase()}</div>
          </div>
          <p className="dash-card-desc">
            {t('caseAdvisor.desc')}
          </p>
          <Link href={`/${locale}/pro/case-advisor`} className="dash-btn dash-btn-dark">
            {t('caseAdvisor.btn')} <ArrowRight size={17} />
          </Link>
        </div>

      </div>

      {/* Footer */}
      <div className="dash-footer">
        <ShieldCheck size={14} />
        <span>{t('footer').toUpperCase()}</span>
      </div>

    </div>
  );
}
