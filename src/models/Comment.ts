import mongoose, { Schema, Model } from 'mongoose';
import { IComment } from '@/types';

const CommentSchema = new Schema<IComment>({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  taskId: { type: Schema.Types.ObjectId, refPath: 'taskType' },
  taskType: {
    type: String,
    enum: ['Task', 'SubTask'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;