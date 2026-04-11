import { authStore } from '@/lib/authStore';
import { getSessions, saveSessions } from '@/lib/localDb';

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(JSON.stringify({ message: 'No token provided' }), { status: 400 });
    }

    const deleted = authStore.sessions.has(token);
    if (deleted) {
      authStore.sessions.delete(token);
      return new Response(JSON.stringify({ message: 'Logout successful' }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: 'Session not found' }), { status: 404 });
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.token === token);
    if (index === -1) {
      return new Response(JSON.stringify({ message: 'Session not found' }), { status: 404 });
    }

    sessions.splice(index, 1);
    saveSessions(sessions);

    return new Response(JSON.stringify({ message: 'Logout successful' }), { status: 200 });
  } catch (err) {
    console.error('Logout error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
