import { NextRequest } from 'next/server';
import { withAuth, successResponse } from '@/lib/api-middleware';
import Task from '@/models/Task';

export const GET = withAuth(async (request: NextRequest, user) => {
  const tasks = await Task.find({ assignedTo: user.userId })
    .populate('project', 'title')
    .populate('createdBy', 'name email')
    .sort({ deadline: 1 });

  return successResponse({ tasks });
});
