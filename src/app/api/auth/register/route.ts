import { NextRequest } from 'next/server';
import { withDB, successResponse, errorResponse } from '@/lib/api-middleware';
import { hashPassword, generateToken } from '@/lib/auth';
import User from '@/models/User';

export const POST = withDB(async (request: NextRequest) => {
  const { name, email, password, role } = await request.json();

  if (!name || !email || !password || !role) {
    return errorResponse('All fields are required');
  }

  if (password.length < 6) {
    return errorResponse('Password must be at least 6 characters');
  }

  if (!['manager', 'developer'].includes(role)) {
    return errorResponse('Invalid role');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role
  });

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role
  });

  return successResponse({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});