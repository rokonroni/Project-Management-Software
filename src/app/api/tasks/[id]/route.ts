import { NextRequest } from 'next/server';
import { withAuth, withRole, successResponse, errorResponse } from '@/lib/api-middleware';
import Task from '@/models/Task';

export const GET = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const task = await Task.findById(params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'title');

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    return successResponse({ task });
  }
);

export const PUT = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const body = await request.json();

    if (body.status === 'completed') {
      body.completedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    return successResponse({ task });
  }
);

export const DELETE = withRole('manager',
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const task = await Task.findByIdAndDelete(params.id);

    if (!task) {
      return errorResponse('Task not found', 404);
    }

    return successResponse({ message: 'Task deleted successfully' });
  }
);