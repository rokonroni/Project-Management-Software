import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import Comment from '@/models/Comment';

export const GET = withAuth(async (request: NextRequest, user) => {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const taskType = searchParams.get('taskType');

  if (!taskId || !taskType) {
    return errorResponse('Task ID and task type are required');
  }

  const comments = await Comment.find({ taskId, taskType })
    .populate('author', 'name email')
    .sort({ createdAt: 1 });

  return successResponse({ comments });
});

export const POST = withAuth(async (request: NextRequest, user) => {
  const { content, taskId, taskType } = await request.json();

  if (!content || !taskId || !taskType) {
    return errorResponse('All fields are required');
  }

  if (!['Task', 'SubTask'].includes(taskType)) {
    return errorResponse('Invalid task type');
  }

  const comment = await Comment.create({
    content,
    taskId,
    taskType,
    author: user.userId
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('author', 'name email');

  return successResponse({ comment: populatedComment });
});