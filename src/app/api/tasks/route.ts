import { NextRequest } from 'next/server';
import { withAuth, withRole, successResponse, errorResponse } from '@/lib/api-middleware';
import Task from '@/models/Task';

export const GET = withAuth(async (request: NextRequest, user) => {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return errorResponse('Project ID is required');
  }

  const tasks = await Task.find({ project: projectId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  return successResponse({ tasks });
});

export const POST = withRole('manager', async (request: NextRequest, user) => {
  const { project, title, description, assignedTo, priority, deadline } = await request.json();

  if (!project || !title || !description || !assignedTo || !deadline) {
    return errorResponse('All fields are required');
  }

  const task = await Task.create({
    project,
    title,
    description,
    assignedTo,
    priority: priority || 'medium',
    deadline: new Date(deadline),
    createdBy: user.userId
  });

  const populatedTask = await Task.findById(task._id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  return successResponse({ task: populatedTask });
});
