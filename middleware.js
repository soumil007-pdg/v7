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

  const isProPath = pathname.startsWith(`/${locale}/pro`) || pathname.startsWith('/pro');
  const isAuthPage =
    pathname === `/${locale}/auth` ||
    pathname === '/auth' ||
    pathname === `/${locale}/pro/auth`;

  const token = req.cookies.get('sessionToken')?.value;

  if (!token && !isAuthPage) {
    const redirectTarget = isProPath
      ? `/${locale}/pro/auth`
      : `/${locale}/auth`;
    return NextResponse.redirect(new URL(redirectTarget, req.url));
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
