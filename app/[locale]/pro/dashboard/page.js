import { setRequestLocale } from 'next-intl/server';
import DashboardProClient from './DashboardProClient';

export const metadata = {
  title: 'Dashboard — ADVOCAT-Easy Pro',
  robots: { index: false, follow: false },
};

export default async function ProDashboardPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DashboardProClient />;
}
