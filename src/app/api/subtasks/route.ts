import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import SubTask from '@/models/SubTask';

export const GET = withAuth(async (request: NextRequest, user) => {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return errorResponse('Task ID is required');
  }

  const subtasks = await SubTask.find({ task: taskId })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  return successResponse({ subtasks });
});

export const POST = withAuth(async (request: NextRequest, user) => {
  const { task, title, description, deadline } = await request.json();

  if (!task || !title || !deadline) {
    return errorResponse('Task, title and deadline are required');
  }

  const subtask = await SubTask.create({
    task,
    title,
    description,
    deadline: new Date(deadline),
    createdBy: user.userId
  });

  const populatedSubtask = await SubTask.findById(subtask._id)
    .populate('createdBy', 'name email');

  return successResponse({ subtask: populatedSubtask });
});