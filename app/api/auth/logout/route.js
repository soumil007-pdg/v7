import { getSessions, saveSessions } from '@/lib/localDb';

export async function POST(req) {
  const { token } = await req.json();

  try {
    const sessions = getSessions();
    const index = sessions.findIndex(s => s.token === token);
    if (index === -1) {
      return new Response(JSON.stringify({ message: 'Session not found' }), { status: 404 });
    }

    sessions.splice(index, 1);
    saveSessions(sessions);

    return new Response(JSON.stringify({ message: 'Logout successful' }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
