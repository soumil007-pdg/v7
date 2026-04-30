import { getTranslations } from 'next-intl/server';
import { Scale } from 'lucide-react';

export default async function ProFooter() {
  const t = await getTranslations('ProFooter');

  return (
    <footer style={{
      backgroundColor: '#0D1117',
      borderTop: '1px solid rgba(212,175,55,0.1)',
      padding: '24px 32px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

        {/* Logo + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Scale size={22} style={{ color: '#D4AF37' }} strokeWidth={2} />
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#D4AF37', letterSpacing: '1px' }}>
              ADVOCAT-Easy
            </span>
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif' }}>
            {t('tagline')}
          </span>
        </div>

        {/* Disclaimer */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter,sans-serif', fontWeight: 600, margin: 0, textAlign: 'right' }}>
          {t('disclaimer')}
        </p>

      </div>
    </footer>
  );
}
