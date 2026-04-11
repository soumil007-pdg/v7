import { getSessions, saveSessions } from '@/lib/localDb';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ isValid: false, message: 'No token provided' }), { status: 400 });
    }

    const sessions = getSessions();
    const session = sessions.find(s => s.token === token);

    if (!session) {
      return new Response(JSON.stringify({ isValid: false, message: 'Session not found' }), { status: 401 });
    }

    if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
      saveSessions(sessions.filter(s => s.token !== token));
      return new Response(JSON.stringify({ isValid: false, message: 'Session expired' }), { status: 401 });
    }

    return new Response(JSON.stringify({ isValid: true, email: session.email, name: session.name || '' }), { status: 200 });
  } catch (err) {
    console.error('Validation error:', err);
    return new Response(JSON.stringify({ isValid: false, message: 'Server error' }), { status: 500 });
  }
}
