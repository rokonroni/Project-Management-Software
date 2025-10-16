// src/types/index.ts

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'manager' | 'developer';
  createdAt: Date;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  createdBy: string | IUser;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: Date;
  deadline: Date;
  createdAt: Date;
}

export interface ITask {
  _id: string;
  project: string | IProject;
  title: string;
  description: string;
  assignedTo: string | IUser;
  createdBy: string | IUser;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface ISubTask {
  _id: string;
  task: string | ITask;
  title: string;
  description?: string;
  createdBy: string | IUser;
  status: 'pending' | 'in-progress' | 'completed';
  deadline: Date;
  completedAt?: Date;
  createdAt: Date;
}

export interface IComment {
  _id: string;
  content: string;
  author: string | IUser;
  taskId: string;
  taskType: 'Task' | 'SubTask';
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'manager' | 'developer';
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: IUser;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';
export type UserRole = 'manager' | 'developer';
export type ProjectStatus = 'planning' | 'in-progress' | 'completed' | 'on-hold';