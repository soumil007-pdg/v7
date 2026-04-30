import { getCaseAdvisorHistory } from '@/lib/localDb';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ history: [] }), { status: 200 });
    }
    const history = getCaseAdvisorHistory(email);
    return new Response(JSON.stringify({ history }), { status: 200 });
  } catch (err) {
    console.error('History fetch error:', err);
    return new Response(JSON.stringify({ history: [] }), { status: 500 });
  }
}
