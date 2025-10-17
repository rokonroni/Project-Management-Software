// src/app/(dashboard)/manager/page.tsx - COMPLETE FILE WITH COMMENTS
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, CheckCircle, AlertCircle, Clock, Plus, LogOut, MessageSquare } from 'lucide-react';
import { IProject, ITask, IUser, IComment } from '@/types';
import { formatDate, getTaskStatusColor } from '@/lib/utils';

export default function ManagerDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<(IProject & { tasks?: ITask[] })[]>([]);
  const [developers, setDevelopers] = useState<IUser[]>([]);
  const [selectedProject, setSelectedProject] = useState<(IProject & { tasks?: ITask[] }) | null>(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'manager') {
      router.push('/developer');
      return;
    }

    setUser(parsedUser);
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const projectsRes = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const projectsData = await projectsRes.json();

      if (projectsData.success) {
        const projectsWithTasks = await Promise.all(
          projectsData.projects.map(async (project: IProject) => {
            const tasksRes = await fetch(`/api/tasks?projectId=${project._id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const tasksData = await tasksRes.json();
            return { ...project, tasks: tasksData.tasks || [] };
          })
        );
        setProjects(projectsWithTasks);
      }

      const devsRes = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const devsData = await devsRes.json();
      if (devsData.success) {
        setDevelopers(devsData.developers);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  const handleCreateProject = async (data: { title: string; description: string; deadline: string }) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (result.success) {
        fetchData();
        setShowCreateProjectModal(false);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleCreateTask = async (projectId: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, project: projectId })
      });

      const result = await res.json();
      if (result.success) {
        fetchData();
        setShowCreateTaskModal(null);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const fetchTaskComments = async (taskId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/comments?taskId=${taskId}&taskType=Task`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      return data.comments || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, taskId, taskType: 'Task' })
      });
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Project Manager Dashboard</h1>
            <p className="text-blue-100">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Projects</h2>
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0;
            const totalTasks = project.tasks?.length || 0;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            return (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedProject(project)}
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{formatDate(project.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{totalTasks} Tasks</span>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No projects yet. Create your first project!</p>
          </div>
        )}
      </div>

      {showCreateProjectModal && (
        <CreateProjectModal
          onClose={() => setShowCreateProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          developers={developers}
          onClose={() => setSelectedProject(null)}
          onCreateTask={() => setShowCreateTaskModal(selectedProject._id)}
          fetchComments={fetchTaskComments}
          addComment={handleAddComment}
        />
      )}

      {showCreateTaskModal && (
        <CreateTaskModal
          projectId={showCreateTaskModal}
          developers={developers}
          onClose={() => setShowCreateTaskModal(null)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}

function CreateProjectModal({ onClose, onCreate }: any) {
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Project</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Project
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectDetailModal({ project, developers, onClose, onCreateTask, fetchComments, addComment }: any) {
  const [selectedTaskForComment, setSelectedTaskForComment] = useState<(ITask & { comments?: IComment[] }) | null>(null);

  const handleOpenComments = async (task: ITask) => {
    const comments = await fetchComments(task._id);
    setSelectedTaskForComment({ ...task, comments });
  };

  const handleAddComment = async (taskId: string, content: string) => {
    const success = await addComment(taskId, content);
    if (success && selectedTaskForComment) {
      const comments = await fetchComments(taskId);
      setSelectedTaskForComment({ ...selectedTaskForComment, comments });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">{project.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">{project.description}</p>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle size={20} />
              Tasks Overview
            </h3>
            <button
              onClick={onCreateTask}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>

          <div className="space-y-3">
            {project.tasks?.map((task: ITask) => {
              const assignedUser = task.assignedTo as IUser;
              return (
                <div key={task._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <p className="text-sm text-gray-600">
                        Assigned to: <span className="font-medium">{assignedUser.name}</span>
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getTaskStatusColor(
                        task.status,
                        task.deadline,
                        task.completedAt
                      )}`}
                    >
                      {task.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Deadline: {formatDate(task.deadline)}</span>
                    </div>
                    {task.completedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={14} />
                        <span>Completed: {formatDate(task.completedAt)}</span>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenComments(task);
                      }}
                      className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <MessageSquare size={14} />
                      <span>View Comments</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {selectedTaskForComment && (
          <CommentModal
            task={selectedTaskForComment}
            onClose={() => setSelectedTaskForComment(null)}
            onAddComment={handleAddComment}
          />
        )}
      </div>
    </div>
  );
}

function CreateTaskModal({ projectId, developers, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(projectId, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create New Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              required
            >
              <option value="">Select Developer</option>
              {developers.map((dev: IUser) => (
                <option key={dev._id} value={dev._id}>
                  {dev.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Task
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CommentModal({ task, onClose, onAddComment }: any) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onAddComment(task._id, newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Task Comments & Updates</h2>
              <p className="text-sm text-gray-600 mt-1">{task.title}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">💬 All team members can view and comment</p>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            {task.comments?.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No comments yet.</p>
                <p className="text-sm text-gray-400 mt-1">Start the conversation with updates!</p>
              </div>
            ) : (
              task.comments?.map((comment: IComment) => {
                const author = comment.author as IUser;
                return (
                  <div key={comment._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{author.name}</span>
                        <span 
                          className={`text-xs px-2 py-1 rounded-full ${
                            author.role === 'manager' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {author.role === 'manager' ? 'Manager' : 'Developer'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleAddComment} className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Comment or Update
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              rows={3}
              placeholder="Share updates, provide feedback, or ask questions..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
              required
            ></textarea>
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                💡 Keep your team informed with regular updates
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <MessageSquare size={16} />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}