import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { authStore } from '@/lib/authStore';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ message: 'Email and password are required' }), { status: 400 });
    }

    // Check if user exists
    const user = authStore.users.get(email);
    if (!user) {
      return new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ message: 'Invalid email or password' }), { status: 401 });
    }

    // Create session with expiration
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    authStore.sessions.set(sessionToken, {
      token: sessionToken,
      email,
      createdAt: new Date(),
      expiresAt
    });

    return new Response(JSON.stringify({
      message: 'Login successful',
      token: sessionToken
    }), { status: 200 });

  } catch (err) {
    console.error('Login error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}