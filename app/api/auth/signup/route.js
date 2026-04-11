import bcrypt from 'bcryptjs';
import { getUsers, saveUsers } from '@/lib/localDb';

export async function POST(req) {
  const { email, password, name } = await req.json();

  try {
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, name: name || '' });
    saveUsers(users);

    return new Response(JSON.stringify({ message: 'Signup successful' }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}
