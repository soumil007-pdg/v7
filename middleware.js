import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

const locales = ['en', 'hi', 'mr', 'te'];
const defaultLocale = 'en';

const intlMiddleware = createMiddleware({ locales, defaultLocale });

export default function middleware(req) {
  const { pathname } = req.nextUrl;

  // Detect locale from pathname
  const pathnameLocale = locales.find(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const locale = pathnameLocale || defaultLocale;

  const isAuthPage = pathname === `/${locale}/auth` || pathname === '/auth';

  const token = req.cookies.get('sessionToken')?.value;

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}/auth`, req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}`, req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    '/',
    '/(hi|mr|te|en)/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};
