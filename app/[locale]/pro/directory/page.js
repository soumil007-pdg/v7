// PRO VERSION — Directory
// Same backend/logic as the orange version.
// Redesign the UI here freely — original is untouched at app/[locale]/directory/
// Press Ctrl+Shift+T to toggle back.

import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import DirectoryClient from '../../directory/DirectoryClient';

export const metadata = {
  title: 'Directory — Pro',
  robots: { index: false, follow: false },
};

export default async function ProDirectoryPage({ params, searchParams }) {
  const { locale } = await params;
  const { city } = await searchParams;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#031126', color: 'white' }}>Loading directory...</div>}>
      <DirectoryClient initialCity={city || 'Delhi'} />
    </Suspense>
  );
}
