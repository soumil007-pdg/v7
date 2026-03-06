import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
 
const locales = ['en', 'hi', 'mr', 'te'];
 
export default getRequestConfig(async ({ requestLocale }) => {
  // In next-intl v4, requestLocale is a Promise that must be awaited
  let locale = await requestLocale;
 
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale)) {
    notFound();
  }
 
  return {
    locale, // You must return the locale string in v4
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
