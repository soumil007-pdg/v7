import { deleteCaseAdvisorEntry } from '@/lib/localDb';

export async function POST(req) {
  try {
    const { id, email } = await req.json();
    if (!id || !email) {
      return new Response(JSON.stringify({ message: 'Missing id or email' }), { status: 400 });
    }
    deleteCaseAdvisorEntry(id, email);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error('Delete case advisor error:', err);
    return new Response(JSON.stringify({ message: 'Failed to delete' }), { status: 500 });
  }
}
