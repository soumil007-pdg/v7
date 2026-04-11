import { getCases, saveCases } from '@/lib/localDb';

export async function POST(req) {
  try {
    const { email, cases } = await req.json();

    if (!email || !cases) {
      return new Response('Missing email or cases data', { status: 400 });
    }

    const allCases = getCases();
    const index = allCases.findIndex(c => c.email === email);
    if (index === -1) {
      allCases.push({ email, cases, updatedAt: new Date().toISOString() });
    } else {
      allCases[index] = { email, cases, updatedAt: new Date().toISOString() };
    }
    saveCases(allCases);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Save error:', error);
    return new Response(JSON.stringify({ message: 'Error saving cases' }), { status: 500 });
  }
}
