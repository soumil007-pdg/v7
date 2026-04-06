import { MetadataRoute } from 'next';

const baseUrl = 'https://yourdomain.com';   // ← CHANGE TO SAME DOMAIN AS ABOVE

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/chatbot', '/case-advisor', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}