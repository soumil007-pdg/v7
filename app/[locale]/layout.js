//Open Graph + Twitter cards → When someone shares your link on WhatsApp/LinkedIn, it shows a nice preview instead of a blank box.
//Better alternates → Google now understands all 4 language versions perfectly.
//JSON-LD structured data → Google can show rich results (star ratings, app info, etc.) in search results.
//baseUrl variable → Easy to change when you deploy.




import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '../globals.css'; 

import NavbarClient from '../components/NavbarClient';
import Footer from '../components/Footer';

const locales = ['en', 'hi', 'mr', 'te'];
const baseUrl = 'https://yourdomain.com';   // ← CHANGE THIS TO YOUR REAL DOMAIN (or Vercel URL)

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: t('title'),
    description: t('description'),
    
    alternates: {
      languages: locales.reduce((acc, lang) => {
        acc[lang] = `/${lang}`;
        return acc;
      }, {}),
    },

    // === OPEN GRAPH (for WhatsApp, LinkedIn, Facebook, etc.) ===
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `${baseUrl}/${locale}`,
      siteName: 'ADVOCAT-Easy',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,   // ← Add a real 1200x630 image later
          width: 1200,
          height: 630,
          alt: 'ADVOCAT-Easy - AI Legal Assistant',
        },
      ],
      locale: locale,
      type: 'website',
    },

    // === TWITTER CARDS ===
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${baseUrl}/og-image.jpg`],
    },
  };
}

export default async function RootLayout({ children, params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  if (!locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  // Structured Data (JSON-LD) for Google rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ADVOCAT-Easy',
    description: 'AI-powered legal assistant with chatbot and case advisor',
    url: `${baseUrl}/${locale}`,
    applicationCategory: 'LegalApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR',
    },
  };

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NavbarClient />
          {children}
          <Footer />
        </NextIntlClientProvider>

        {/* JSON-LD Structured Data - tells Google exactly what your app is */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}