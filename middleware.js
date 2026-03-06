import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'hi', 'mr', 'te'],
  defaultLocale: 'en'
});
 
export const config = {
  // This matcher ensures ALL pages are routed through the language middleware
  // while explicitly ignoring API routes, Next.js static files, and images.
  matcher: [
    '/',
    '/(hi|mr|te|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
