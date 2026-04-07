import { getTranslations, setRequestLocale } from 'next-intl/server';
import DashboardClient from './DashboardClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Dashboard' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function DashboardPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardClient />;
}
