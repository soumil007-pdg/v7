import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css'; 

import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';

export const metadata = {
  title: 'ADVOCAT-Easy',
  description: 'Your Legal AI Assistant',
};

export default async function RootLayout({ children, params }) {
  // In Next.js 15, params is a Promise and must be awaited
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Validate that the incoming locale is supported
  if (!['en', 'hi', 'mr', 'te'].includes(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Fetch the translation messages for the current language
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
