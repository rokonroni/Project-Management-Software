// src/app/api/tasks/my-tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Task from '@/models/Task';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const tasks = await Task.find({ assignedTo: userPayload.userId })
      .populate('project', 'title')
      .populate('createdBy', 'name email')
      .sort({ deadline: 1 });

    return NextResponse.json({
      success: true,
      tasks
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
