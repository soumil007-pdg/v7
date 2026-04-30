'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ProFAQ() {
  const [open, setOpen] = useState(null);
  const t = useTranslations('ProFAQ');

  const faqs = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
  ];

  return (
    <section className="lx-faq-section">
      <h2 className="lx-faq-title lx-serif">{t('title')}</h2>

      <div className="lx-faq-list">
        {faqs.map((item, i) => (
          <div
            key={i}
            className={`lx-faq-item lx-faq-accordion${open === i ? ' open' : ''}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="lx-faq-row">
              <h4 className="lx-faq-q">{item.q}</h4>
              <ChevronDown
                size={16}
                className="lx-faq-icon"
                style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
              />
            </div>
            {open === i && (
              <p className="lx-faq-answer">{item.a}</p>
            )}
          </div>
        ))}
      </div>

      <div className="lx-faq-footer">
        <p>{t('stillHave')}</p>
        <button className="lx-btn-outline-dark">{t('contactBtn')}</button>
      </div>
    </section>
  );
}
