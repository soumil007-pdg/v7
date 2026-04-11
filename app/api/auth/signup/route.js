import bcrypt from 'bcryptjs';
import { authStore } from '@/lib/authStore';

export async function POST(req) {
  const { email, password } = await req.json();

  try {
    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password required' }), { status: 400 });
    }

    if (authStore.users.has(email)) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    authStore.users.set(email, { email, password: hashedPassword });

    return new Response(JSON.stringify({ message: 'Signup successful' }), { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}