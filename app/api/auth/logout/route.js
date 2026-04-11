import { getSessions, saveSessions } from '@/lib/localDb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (token) {
      const sessions = getSessions();
      saveSessions(sessions.filter(s => s.token !== token));
    }

    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
    response.cookies.set('sessionToken', '', {
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
