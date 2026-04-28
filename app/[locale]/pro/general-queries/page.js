// PRO VERSION — General Queries (Quick Rights Chat)
// Same backend/logic as the orange version.
// Redesign the UI here freely — original is untouched at app/[locale]/general-queries/
// Press Ctrl+Shift+T to toggle back.

import { setRequestLocale } from 'next-intl/server';
import GeneralQueriesClient from '../../general-queries/GeneralQueriesClient';

export const metadata = {
  title: 'Quick Rights Chat — Pro',
  robots: { index: false, follow: false },
};

export default async function ProGeneralQueriesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GeneralQueriesClient />;
}
