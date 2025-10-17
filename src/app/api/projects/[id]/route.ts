import { NextRequest } from 'next/server';
import { withAuth, withRole, successResponse, errorResponse } from '@/lib/api-middleware';
import Project from '@/models/Project';
import Task from '@/models/Task';

export const GET = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const project = await Project.findById(params.id)
      .populate('createdBy', 'name email');

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return successResponse({ project });
  }
);

export const PUT = withRole('manager',
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const body = await request.json();

    const project = await Project.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    ).populate('createdBy', 'name email');

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    return successResponse({ project });
  }
);

export const DELETE = withRole('manager',
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const project = await Project.findById(params.id);

    if (!project) {
      return errorResponse('Project not found', 404);
    }

    await Task.deleteMany({ project: params.id });
    await Project.findByIdAndDelete(params.id);

    return successResponse({ message: 'Project deleted successfully' });
  }
);