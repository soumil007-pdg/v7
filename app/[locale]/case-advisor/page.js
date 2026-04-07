import { getTranslations, setRequestLocale } from 'next-intl/server';
import CaseAdvisorClient from './CaseAdvisorClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CaseAdvisor' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function CaseAdvisorPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CaseAdvisorClient />;
}
