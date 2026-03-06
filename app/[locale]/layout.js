import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css'; // Notice the path changed to '../' because layout moved!

// Import your components. Adjust paths since layout is now inside [locale]
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';

export const metadata = {
  title: 'ADVOCAT-Easy',
  description: 'Your Legal AI Assistant',
};

export default async function RootLayout({ children, params }) {
  const { locale } = await params;

  // Validate that the incoming locale is supported
  if (!['en', 'hi', 'mr', 'te'].includes(locale)) {
    notFound();
  }

  // Fetch the translation messages for the current language
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        {/* NextIntlClientProvider passes the translations to the whole app */}
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
