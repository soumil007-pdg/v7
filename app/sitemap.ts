import { MetadataRoute } from 'next';

const locales = ['en', 'hi', 'mr', 'te'];
const baseUrl = 'https://yourdomain.com';   // ← CHANGE THIS TO YOUR REAL DEPLOYED URL (Vercel, etc.)

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    '',           // homepage
    '/login',
    // ADD EVERY OTHER PUBLIC PAGE YOU HAVE HERE (example: '/about', '/features')
    // NEVER add dashboard, chatbot, case-advisor — Google can't see them anyway
  ];

  return publicRoutes.flatMap((route) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1 : 0.8,
      alternates: {
        languages: locales.reduce((acc, l) => {
          acc[l] = `${baseUrl}/${l}${route}`;
          return acc;
        }, {} as Record<string, string>),
      },
    }))
  );
}