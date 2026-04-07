import { getTranslations, setRequestLocale } from 'next-intl/server';
import GeneralQueriesClient from './GeneralQueriesClient';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'GeneralQueries' });

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  };
}

export default async function GeneralQueriesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GeneralQueriesClient />;
}
