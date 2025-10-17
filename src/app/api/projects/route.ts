import { NextRequest } from 'next/server';
import { withAuth, withRole, successResponse, errorResponse } from '@/lib/api-middleware';
import Project from '@/models/Project';

export const GET = withAuth(async (request: NextRequest, user) => {
  const projects = await Project.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  return successResponse({ projects });
});

export const POST = withRole('manager', async (request: NextRequest, user) => {
  const { title, description, deadline } = await request.json();

  if (!title || !description || !deadline) {
    return errorResponse('All fields are required');
  }

  const project = await Project.create({
    title,
    description,
    deadline: new Date(deadline),
    createdBy: user.userId
  });

  const populatedProject = await Project.findById(project._id)
    .populate('createdBy', 'name email');

  return successResponse({ project: populatedProject });
});
