import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, getSessions, saveSessions } from '@/lib/localDb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const users = getUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const sessions = getSessions();
    sessions.push({
      token: sessionToken,
      email,
      name: user.name || '',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
    saveSessions(sessions);

    const response = NextResponse.json({ message: 'Login successful', token: sessionToken }, { status: 200 });
    response.cookies.set('sessionToken', sessionToken, {
      path: '/',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
