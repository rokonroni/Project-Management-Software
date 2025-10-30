"use client";

import { Badge } from "@/components/shared/Badge";
import { CommentSection } from "@/components/shared/CommentSection";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormInput } from "@/components/shared/FormInput";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Modal } from "@/components/shared/Modal";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatDate, getTaskStatusColor } from "@/lib/utils";
import { IComment, IProject, ISubTask, ITask, IUser } from "@/types";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Code,
  MessageSquare,
  PlayCircle,
  Plus,
  Tag,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function DeveloperDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<
    (ITask & { subtasks?: ISubTask[]; comments?: IComment[] })[]
  >([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showSubtaskModal, setShowSubtaskModal] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState<
    (ITask & { subtasks?: ISubTask[]; comments?: IComment[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    checkAuth();
    fetchTasks();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "developer") {
      router.push("/manager");
      return;
    }

    setUser(parsedUser);
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/tasks/my-tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        const tasksWithDetails = await Promise.all(
          data.tasks.map(async (task: ITask) => {
            const [subtasksRes, commentsRes] = await Promise.all([
              fetch(`/api/subtasks?taskId=${task._id}`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
              fetch(`/api/comments?taskId=${task._id}&taskType=Task`, {
                headers: { Authorization: `Bearer ${token}` },
              }),
            ]);

            const subtasksData = await subtasksRes.json();
            const commentsData = await commentsRes.json();

            return {
              ...task,
              subtasks: subtasksData.subtasks || [],
              comments: commentsData.comments || [],
            };
          })
        );

        setTasks(tasksWithDetails);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          document.cookie =
            "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          router.push("/login");
          resolve(true);
        }, 500);
      }),
      {
        loading: "Signing out...",
        success: "See you later! 👋",
        error: "Error signing out",
      }
    );
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const loadingToast = toast.loading("Updating status...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success(
          `Status updated to ${newStatus}! ${
            newStatus === "completed" ? "🎉" : "📝"
          }`
        );
        fetchTasks();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error updating task status:", error);
    }
  };

  const handleSubtaskStatusChange = async (
    subtaskId: string,
    newStatus: string
  ) => {
    const loadingToast = toast.loading("Updating subtask...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Subtask updated! ✅");
        fetchTasks();
      } else {
        toast.error("Failed to update subtask");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error updating subtask status:", error);
    }
  };

  const handleCreateSubtask = async (taskId: string, data: any) => {
    const loadingToast = toast.loading("Creating subtask...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/subtasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, task: taskId }),
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Subtask created! 🎯");
        fetchTasks();
        setShowSubtaskModal(null);
      } else {
        toast.error("Failed to create subtask");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error creating subtask:", error);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!showCommentModal) return false;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content,
          taskId: showCommentModal._id,
          taskType: "Task",
        }),
      });

      const result = await res.json();

      if (result.success) {
        // Fetch the updated comments for this task
        const commentsRes = await fetch(
          `/api/comments?taskId=${showCommentModal._id}&taskType=Task`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const commentsData = await commentsRes.json();

        // Update the tasks state
        setTasks(
          tasks.map((task) => {
            if (task._id === showCommentModal._id) {
              return { ...task, comments: commentsData.comments || [] };
            }
            return task;
          })
        );

        // Update the modal state with new comments
        setShowCommentModal({
          ...showCommentModal,
          comments: commentsData.comments || [],
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (!result.isConfirmed) return;

    const loadingToast = toast.loading("Deleting comment...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        // Fetch the updated comments for this task
        const commentsRes = await fetch(
          `/api/comments?taskId=${showCommentModal?._id}&taskType=Task`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const commentsData = await commentsRes.json();

        // Update the tasks state
        setTasks(
          tasks.map((task) => {
            if (task._id === showCommentModal?._id) {
              return { ...task, comments: commentsData.comments || [] };
            }
            return task;
          })
        );

        // Update the modal state with new comments
        if (showCommentModal) {
          setShowCommentModal({
            ...showCommentModal,
            comments: commentsData.comments || [],
          });
        }

        toast.success("Comment deleted successfully!");
        await Swal.fire({
          title: "Deleted!",
          text: "The comment has been deleted.",
          icon: "success",
        });
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error deleting comment:", error);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "in-progress"
  ).length;
  const pendingTasks = tasks.filter((t) => t.status === "pending").length;

  if (loading) {
    return <LoadingSpinner message="Loading your tasks..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <DashboardHeader
        icon={Code}
        title="Developer Dashboard"
        subtitle={`Hey ${user?.name}, let's code! 💻`}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Tasks"
            value={totalTasks}
            icon={PlayCircle}
            accentIcon={TrendingUp}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Completed"
            value={completedTasks}
            icon={CheckCircle}
            accentIcon={Trophy}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatsCard
            title="In Progress"
            value={inProgressTasks}
            icon={Zap}
            accentIcon={Code}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard
            title="Pending"
            value={pendingTasks}
            icon={Timer}
            accentIcon={AlertCircle}
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
          />
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h2>
          <p className="text-gray-600">
            Manage your assigned tasks and track progress
          </p>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <EmptyState
            icon={Code}
            title="No tasks assigned yet"
            description="You're all caught up! Check back later for new assignments."
          />
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isExpanded = expandedTask === task._id;
              const completedSubtasks =
                task.subtasks?.filter((st) => st.status === "completed")
                  .length || 0;
              const totalSubtasks = task.subtasks?.length || 0;
              const project = task.project as IProject;

              return (
                <div key={task._id} className="card card-hover overflow-hidden">
                  <div className="p-6">
                    {/* Task Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {task.title}
                          </h3>
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "danger"
                                : task.priority === "medium"
                                ? "warning"
                                : "info"
                            }
                          >
                            <Tag size={12} className="inline mr-1" />
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                            {project.title}
                          </span>
                        </p>
                        <p className="text-gray-700 mb-3">{task.description}</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${getTaskStatusColor(
                          task.status,
                          task.deadline,
                          task.completedAt
                        )}`}
                      ></div>
                    </div>

                    {/* Task Meta */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 flex-wrap">
                      <div className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg">
                        <Clock size={14} />
                        <span className="font-medium">
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                      {totalSubtasks > 0 && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-lg">
                          <CheckCircle size={14} className="text-purple-600" />
                          <span className="font-medium text-purple-700">
                            {completedSubtasks}/{totalSubtasks} Subtasks
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 rounded-lg">
                        <MessageSquare size={14} className="text-blue-600" />
                        <span className="font-medium text-blue-700">
                          {task.comments?.length || 0} Comments
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-wrap">
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task._id, e.target.value)
                        }
                        className={`px-4 py-2 rounded-xl font-semibold border-2 transition-all cursor-pointer ${
                          task.status === "completed"
                            ? "border-green-500 bg-green-50 text-green-700"
                            : task.status === "in-progress"
                            ? "border-purple-500 bg-purple-50 text-purple-700"
                            : "border-gray-300 bg-gray-50 text-gray-700"
                        }`}
                      >
                        <option value="pending">📋 Pending</option>
                        <option value="in-progress">⚡ In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>

                      <button
                        onClick={() => setShowSubtaskModal(task._id)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                      >
                        <Plus size={16} />
                        Add Subtask
                      </button>

                      <button
                        onClick={() => setShowCommentModal(task)}
                        className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all flex items-center gap-2 font-semibold"
                      >
                        <MessageSquare size={16} />
                        Comments
                      </button>

                      {totalSubtasks > 0 && (
                        <button
                          onClick={() =>
                            setExpandedTask(isExpanded ? null : task._id)
                          }
                          className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all flex items-center gap-2 font-semibold"
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                          {isExpanded ? "Hide" : "Show"} Subtasks
                        </button>
                      )}
                    </div>

                    {/* Subtasks */}
                    {isExpanded && totalSubtasks > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-200 animate-slideDown">
                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <CheckCircle size={18} className="text-purple-600" />
                          Subtasks ({completedSubtasks}/{totalSubtasks})
                        </h4>
                        <div className="space-y-3">
                          {task.subtasks?.map((subtask) => (
                            <div
                              key={subtask._id}
                              className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 p-4 rounded-xl transition-all border border-gray-200"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  {subtask.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <Clock size={12} />
                                  Due: {formatDate(subtask.deadline)}
                                </p>
                              </div>
                              <select
                                value={subtask.status}
                                onChange={(e) =>
                                  handleSubtaskStatusChange(
                                    subtask._id,
                                    e.target.value
                                  )
                                }
                                className={`px-3 py-2 text-sm rounded-lg font-semibold border-2 cursor-pointer transition-all ${
                                  subtask.status === "completed"
                                    ? "border-green-500 bg-green-50 text-green-700"
                                    : subtask.status === "in-progress"
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-gray-300 bg-white text-gray-700"
                                }`}
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
        )}
      </div>

      {/* Modals */}
      {showSubtaskModal && (
        <CreateSubtaskModal
          taskId={showSubtaskModal}
          onClose={() => setShowSubtaskModal(null)}
          onCreate={handleCreateSubtask}
        />
      )}

      {showCommentModal && (
        <Modal
          isOpen={!!showCommentModal}
          onClose={() => setShowCommentModal(null)}
          title="Task Comments"
          subtitle={showCommentModal.title}
          maxWidth="2xl"
        >
          <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg inline-flex items-center gap-2 text-sm">
            <MessageSquare size={14} className="text-blue-600" />
            <span className="text-blue-700 font-medium">
              All team members can view and comment
            </span>
          </div>

          <CommentSection
            comments={showCommentModal.comments || []}
            currentUserId={user?._id || ""}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            placeholder="Share your progress, ask questions, or provide updates..."
          />
        </Modal>
      )}
    </div>
  );
}

// Create Subtask Modal
function CreateSubtaskModal({ taskId, onClose, onCreate }: any) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(taskId, formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create Subtask"
      subtitle="Break down your task into smaller steps"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Subtask Title"
          name="title"
          value={formData.title}
          onChange={(value: string) =>
            setFormData({ ...formData, title: value })
          }
          placeholder="e.g., Setup database schema"
          required
        />

        <FormTextarea
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={(value: string) =>
            setFormData({ ...formData, description: value })
          }
          placeholder="Add details about this subtask..."
          rows={3}
        />

        <FormInput
          label="Deadline"
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={(value: string) =>
            setFormData({ ...formData, deadline: value })
          }
          required
        />

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 btn btn-primary">
            <Plus size={18} className="inline mr-2" />
            Create Subtask
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
