import { getTranslations, setRequestLocale } from 'next-intl/server';
import AuthClient from './AuthClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/auth`,
      languages: {
        en: '/en/auth',
        hi: '/hi/auth',
        mr: '/mr/auth',
        te: '/te/auth',
      },
    },
  };
}

export default async function AuthPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthClient />;
}
