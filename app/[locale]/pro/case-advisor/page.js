// PRO VERSION — Case Advisor
// Same backend/logic as the orange version.
// Redesign the UI here freely — original is untouched at app/[locale]/case-advisor/
// Press Ctrl+Shift+T to toggle back.

import { setRequestLocale } from 'next-intl/server';
import CaseAdvisorClient from '../../case-advisor/CaseAdvisorClient';

export const metadata = {
  title: 'Case Advisor — Pro',
  robots: { index: false, follow: false },
};

export default async function ProCaseAdvisorPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CaseAdvisorClient />;
}
