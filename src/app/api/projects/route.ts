// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Project from '@/models/Project';

// GET all projects
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

    const projects = await Project.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// POST create project
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is manager
    if (userPayload.role !== 'manager') {
      return NextResponse.json(
        { success: false, error: 'Only managers can create projects' },
        { status: 403 }
      );
    }

    const { title, description, deadline } = await request.json();

    // Validation
    if (!title || !description || !deadline) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      title,
      description,
      deadline: new Date(deadline),
      createdBy: userPayload.userId
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

