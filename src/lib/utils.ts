import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function getTaskStatusColor(
  status: string,
  deadline: Date,
  completedAt?: Date
): string {
  if (status === 'completed' && completedAt) {
    const isOnTime = new Date(completedAt) <= new Date(deadline);
    return isOnTime ? 'bg-green-500' : 'bg-red-500';
  }

  if (status === 'in-progress' || status === 'pending') {
    const isPastDeadline = new Date() > new Date(deadline);
    return isPastDeadline ? 'bg-red-500' : 'bg-yellow-500';
  }

  return 'bg-gray-500';
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'text-red-600 bg-red-50';
    case 'medium':
      return 'text-orange-600 bg-orange-50';
    case 'low':
      return 'text-green-600 bg-green-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}