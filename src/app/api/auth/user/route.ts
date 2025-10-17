import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import User from '@/models/User';

export const GET = withAuth(async (request: NextRequest, user) => {
  const userData = await User.findById(user.userId).select('-password');
  
  if (!userData) {
    return errorResponse('User not found', 404);
  }

  return successResponse({ user: userData });
});

export const POST = withAuth(async (request: NextRequest, user) => {
  const developers = await User.find({ role: 'developer' }).select('-password');
  return successResponse({ developers });
});
