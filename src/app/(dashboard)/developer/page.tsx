'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Clock, MessageSquare, Plus, ChevronDown, ChevronUp, LogOut } from 'lucide-react';
import { ITask, ISubTask, IComment, IUser, IProject } from '@/types';
import { formatDate, getTaskStatusColor, getPriorityColor } from '@/lib/utils';

export default function DeveloperDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<(ITask & { subtasks?: ISubTask[]; comments?: IComment[] })[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<(ITask & { subtasks?: ISubTask[]; comments?: IComment[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    checkAuth();
    fetchTasks();
  }, [""]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'developer') {
      router.push('/manager');
      return;
    }

    setUser(parsedUser);
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/tasks/my-tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        // Fetch subtasks and comments for each task
        const tasksWithDetails = await Promise.all(
          data.tasks.map(async (task: ITask) => {
            const [subtasksRes, commentsRes] = await Promise.all([
              fetch(`/api/subtasks?taskId=${task._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              }),
              fetch(`/api/comments?taskId=${task._id}&taskType=Task&populate=author`, {
                headers: { 'Authorization': `Bearer ${token}` }
              })
            ]);

            const subtasksData = await subtasksRes.json();
            const commentsData = await commentsRes.json();

            return {
              ...task,
              subtasks: subtasksData.subtasks || [],
              comments: commentsData.comments || []
            };
          })
        );

        setTasks(tasksWithDetails);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating subtask status:', error);
    }
  };

  const handleCreateSubtask = async (taskId: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...data, task: taskId })
      });

      if (res.ok) {
        fetchTasks();
        setShowSubtaskModal(null);
      }
    } catch (error) {
      console.error('Error creating subtask:', error);
    }
  };

  const handleAddComment = async (taskId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, taskId, taskType: 'Task' })
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
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
      {/* Header */}
      <div className="bg-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
            <p className="text-indigo-100">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2 font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">My Tasks</h2>

        <div className="space-y-4">
          {tasks.map((task) => {
            const isExpanded = expandedTask === task._id;
            const completedSubtasks = task.subtasks?.filter(st => st.status === 'completed').length || 0;
            const project = task.project as IProject;

            return (
              <div key={task._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{project.title}</p>
                      <p className="text-gray-700">{task.description}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-full ${getTaskStatusColor(task.status, task.deadline, task.completedAt)}`}></div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>Due: {formatDate(task.deadline)}</span>
                    </div>
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        <span>{completedSubtasks}/{task.subtasks.length} Subtasks</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MessageSquare size={16} />
                      <span>{task.comments?.length || 0} Comments</span>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => setShowSubtaskModal(task._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add Subtask
                    </button>

                    <button
                      onClick={() => setShowCommentModal(task)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare size={16} />
                      Comments
                    </button>

                    {task.subtasks && task.subtasks.length > 0 && (
                      <button
                        onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        {isExpanded ? 'Hide' : 'Show'} Subtasks
                      </button>
                    )}
                  </div>

                  {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Subtasks</h4>
                      <div className="space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask._id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{subtask.title}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Due: {formatDate(subtask.deadline)}
                              </p>
                            </div>
                            <select
                              value={subtask.status}
                              onChange={(e) => handleSubtaskStatusChange(subtask._id, e.target.value)}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No tasks assigned yet.</p>
          </div>
        )}
      </div>

      {/* Create Subtask Modal */}
      {showSubtaskModal && (
        <CreateSubtaskModal
          taskId={showSubtaskModal}
          onClose={() => setShowSubtaskModal(null)}
          onCreate={handleCreateSubtask}
        />
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal
          task={showCommentModal}
          onClose={() => setShowCommentModal(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}

// Create Subtask Modal
function CreateSubtaskModal({ taskId, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(taskId, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Create Subtask</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subtask Title</label>
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
            ></textarea>
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
              Create Subtask
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

// Comment Modal
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
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
                <p className="text-sm text-gray-400 mt-1">Start the conversation with your updates!</p>
              </div>
            ) : (
              task.comments?.map((comment: IComment,) => {
                const author = comment.author as unknown as IUser;
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
              placeholder="Share progress updates, ask questions, or provide feedback..."
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