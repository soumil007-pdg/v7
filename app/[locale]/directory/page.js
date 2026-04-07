import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import DirectoryClient from './DirectoryClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Directory' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/directory`,
      languages: {
        en: '/en/directory',
        hi: '/hi/directory',
        mr: '/mr/directory',
        te: '/te/directory',
      },
    },
  };
}

export default async function DirectoryPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">Loading directory...</div>}>
      <DirectoryClient initialCity="Pitampura" />
    </Suspense>
  );
}
