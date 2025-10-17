import { NextRequest } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import Comment from '@/models/Comment';

export const DELETE = withAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    const comment = await Comment.findById(params.id);

    if (!comment) {
      return errorResponse('Comment not found', 404);
    }

    if (comment.author.toString() !== user.userId) {
      return errorResponse('You can only delete your own comments', 403);
    }

    await Comment.findByIdAndDelete(params.id);

    return successResponse({ message: 'Comment deleted successfully' });
  }
);