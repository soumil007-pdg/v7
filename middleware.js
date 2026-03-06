import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'hi', 'mr', 'te'],
  defaultLocale: 'en'
});
 
export const config = {
  matcher: [
    '/',
    '/(hi|mr|te|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
