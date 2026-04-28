// PRO VERSION — Auth (Login / Signup)
// Same backend/logic as the orange version.
// Redesign the UI here freely — original is untouched at app/[locale]/auth/
// Press Ctrl+Shift+T to toggle back.

import { setRequestLocale } from 'next-intl/server';
import AuthClient from '../../auth/AuthClient';

export const metadata = {
  title: 'Sign In — Pro',
  robots: { index: false, follow: false },
};

export default async function ProAuthPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuthClient />;
}
