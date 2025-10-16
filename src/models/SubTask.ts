import mongoose, { Schema, Model } from 'mongoose';
import { ISubTask } from '@/types';

const SubTaskSchema = new Schema<ISubTask>({
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  deadline: { type: Date, required: true },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const SubTask: Model<ISubTask> = mongoose.models.SubTask || mongoose.model<ISubTask>('SubTask', SubTaskSchema);
export default SubTask;
