// PRO VERSION — Dashboard
// Same backend/logic as the orange version.
// Redesign the UI here freely — original is untouched at app/[locale]/dashboard/
// Press Ctrl+Shift+T to toggle back.

import { setRequestLocale } from 'next-intl/server';
import DashboardClient from '../../dashboard/DashboardClient';

export const metadata = {
  title: 'Dashboard — Pro',
  robots: { index: false, follow: false },
};

export default async function ProDashboardPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardClient />;
}
