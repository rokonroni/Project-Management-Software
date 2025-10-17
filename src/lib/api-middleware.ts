import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from './mongodb';
import { getUserFromRequest, JWTPayload } from './auth';

export function apiResponse(success: boolean, data?: any, error?: string, status: number = 200) {
  return NextResponse.json({ success, ...data, ...(error && { error }) }, { status: success ? status : 400 });
}

export function errorResponse(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export function successResponse(data: any, status: number = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function withDB(handler: (request: NextRequest, context?: any) => Promise<NextResponse>) {
  return async (request: NextRequest, context?: any) => {
    try {
      await connectDB();
      return await handler(request, context);
    } catch (error) {
      console.error('Database connection error:', error);
      return errorResponse('Database connection failed', 500);
    }
  };
}

export function withAuth(handler: (request: NextRequest, user: JWTPayload, context?: any) => Promise<NextResponse>) {
  return withDB(async (request: NextRequest, context?: any) => {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return errorResponse('Unauthorized', 401);
    }
    try {
      return await handler(request, userPayload, context);
    } catch (error) {
      console.error('API error:', error);
      return errorResponse('Internal server error', 500);
    }
  });
}

export function withRole(role: 'manager' | 'developer', handler: (request: NextRequest, user: JWTPayload, context?: any) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: JWTPayload, context?: any) => {
    if (user.role !== role) {
      return errorResponse(`Access denied. ${role} role required.`, 403);
    }
    return await handler(request, user, context);
  });
}