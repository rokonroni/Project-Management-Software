import { NextRequest } from 'next/server';
import { withDB, successResponse, errorResponse } from '@/lib/api-middleware';
import { comparePassword, generateToken } from '@/lib/auth';
import User from '@/models/User';

export const POST = withDB(async (request: NextRequest) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    return errorResponse('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return errorResponse('Invalid credentials');
  }

  const isValidPassword = await comparePassword(password, user.password as string);
  if (!isValidPassword) {
    return errorResponse('Invalid credentials');
  }

  const token = generateToken({
    userId: user._id.toString(),
    role: user.role
  });

  const response = successResponse({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });

  // Set cookies
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  response.cookies.set('user', JSON.stringify({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  }), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  return response;
});
