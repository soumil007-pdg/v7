import { setRequestLocale } from 'next-intl/server';
import GeneralQueriesClient from '../../general-queries/GeneralQueriesClient';
import ProCaseFollowUpClient from './ProCaseFollowUpClient';

export const metadata = {
  title: 'Quick Rights Chat — Pro',
  robots: { index: false, follow: false },
};

export default async function ProGeneralQueriesPage({ params, searchParams }) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  if (sp?.source === 'case-advisor') {
    return <ProCaseFollowUpClient />;
  }

  return <GeneralQueriesClient />;
}
