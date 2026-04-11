import bcrypt from 'bcryptjs';
import { getUsers, saveUsers } from '@/lib/localDb';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, name: name || '' });
    saveUsers(users);

    return NextResponse.json({ message: 'Signup successful' }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
