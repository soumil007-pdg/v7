import { authStore } from '@/lib/authStore';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ isValid: false, message: 'No token provided' }), { status: 400 });
    }

    const session = authStore.sessions.get(token);

    if (!session) {
      return new Response(JSON.stringify({ isValid: false, message: 'Session not found' }), { status: 401 });
    }

    // Check expiration
    if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
      authStore.sessions.delete(token);
      return new Response(JSON.stringify({ isValid: false, message: 'Session expired' }), { status: 401 });
    }

    return new Response(JSON.stringify({ isValid: true, email: session.email }), { status: 200 });
  } catch (err) {
    console.error('Validation error:', err);
    return new Response(JSON.stringify({ isValid: false, message: 'Server error' }), { status: 500 });
  }
}