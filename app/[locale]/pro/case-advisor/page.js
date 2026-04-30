import { setRequestLocale } from 'next-intl/server';
import CaseAdvisorProClient from './CaseAdvisorProClient';

export const metadata = {
  title: 'Case Strategist — ADVOCAT-Easy Pro',
  robots: { index: false, follow: false },
};

export default async function ProCaseAdvisorPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CaseAdvisorProClient />;
}
