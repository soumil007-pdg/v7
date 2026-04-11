import { getCases } from '@/lib/localDb';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new Response('Missing email', { status: 400 });
    }

    const allCases = getCases();
    const record = allCases.find(c => c.email === email);

    return new Response(JSON.stringify({ cases: record ? record.cases : {} }), { status: 200 });
  } catch (error) {
    console.error('Load error:', error);
    return new Response(JSON.stringify({ message: 'Error loading cases' }), { status: 500 });
  }
}
