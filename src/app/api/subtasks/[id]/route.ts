import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import SubTask from '@/models/SubTask';

export const PUT = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const body = await request.json();

    if (body.status === 'completed') {
      body.completedAt = new Date();
    }

    const subtask = await SubTask.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!subtask) {
      return errorResponse('Subtask not found', 404);
    }

    return successResponse({ subtask });
  }
);

export const DELETE = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const subtask = await SubTask.findByIdAndDelete(params.id);

    if (!subtask) {
      return errorResponse('Subtask not found', 404);
    }

    return successResponse({ message: 'Subtask deleted successfully' });
  }
);
