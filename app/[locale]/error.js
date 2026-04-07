'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = useTranslations('Error');

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">
          {t('title')}
        </h1>
        <p className="text-slate-500 mb-8">
          {t('description')}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-lg bg-[#171717] text-white font-bold hover:bg-black transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    </main>
  );
}
