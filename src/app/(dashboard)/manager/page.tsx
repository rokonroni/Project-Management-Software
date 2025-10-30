"use client";

import { Badge } from "@/components/shared/Badge";
import { CommentSection } from "@/components/shared/CommentSection";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormInput } from "@/components/shared/FormInput";
import { FormSelect } from "@/components/shared/FormSelect";
import { FormTextarea } from "@/components/shared/FormTextarea";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { Modal } from "@/components/shared/Modal";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { StatsCard } from "@/components/shared/StatsCard";
import { formatDate } from "@/lib/utils";
import { IComment, IProject, ITask, IUser } from "@/types";
import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Folder,
  MessageSquare,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export default function ManagerDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<(IProject & { tasks?: ITask[] })[]>(
    []
  );
  const [developers, setDevelopers] = useState<IUser[]>([]);
  const [selectedProject, setSelectedProject] = useState<
    (IProject & { tasks?: ITask[] }) | null
  >(null);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState<string | null>(
    null
  );
  const [showCommentModal, setShowCommentModal] = useState<
    (ITask & { comments?: IComment[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "manager") {
      router.push("/developer");
      return;
    }

    setUser(parsedUser);
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const currentUser = JSON.parse(userData!);

      const projectsRes = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = await projectsRes.json();

      if (projectsData.success) {
        const myProjects = projectsData.projects.filter((project: IProject) => {
          const createdBy =
            typeof project.createdBy === "string"
              ? project.createdBy
              : project.createdBy._id;
          return createdBy === currentUser._id;
        });

        const projectsWithTasks = await Promise.all(
          myProjects.map(async (project: IProject) => {
            const tasksRes = await fetch(
              `/api/tasks?projectId=${project._id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const tasksData = await tasksRes.json();
            return { ...project, tasks: tasksData.tasks || [] };
          })
        );
        setProjects(projectsWithTasks);
      }

      const devsRes = await fetch("/api/auth/user", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const devsData = await devsRes.json();
      if (devsData.success) {
        setDevelopers(devsData.developers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
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
        success: "Signed out successfully! 👋",
        error: "Error signing out",
      }
    );
  };

  const handleCreateProject = async (data: {
    title: string;
    description: string;
    deadline: string;
  }) => {
    const loadingToast = toast.loading("Creating project...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Project created successfully! 🎉");
        fetchData();
        setShowCreateProjectModal(false);
      } else {
        toast.error(result.error || "Failed to create project");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error! Please try again.");
      console.error("Error creating project:", error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const loadingToast = toast.loading("Deleting project...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Project deleted successfully!");
        fetchData();
        setSelectedProject(null);
      } else {
        toast.error("Failed to delete project");
      }

      await Swal.fire({
        title: "Deleted!",
        text: "Your project has been deleted.",
        icon: "success",
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error deleting project:", error);
    }
  };

  const handleCreateTask = async (projectId: string, data: any) => {
    const loadingToast = toast.loading("Creating task...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, project: projectId }),
      });

      const result = await res.json();
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Task created and assigned! ✅");
        await fetchData();

        // Update the selected project with the latest data
        if (selectedProject && selectedProject._id === projectId) {
          const updatedProject = projects.find((p) => p._id === projectId);
          if (updatedProject) {
            setSelectedProject(updatedProject);
          }
        }

        setShowCreateTaskModal(null);
      } else {
        toast.error(result.error || "Failed to create task");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error creating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This task will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const loadingToast = toast.loading("Deleting task...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Task deleted successfully!");
        fetchData();
      } else {
        toast.error("Failed to delete task");
      }
      await Swal.fire({
        title: "Deleted!",
        text: "The task has been deleted.",
        icon: "success",
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error deleting task:", error);
    }
  };

  const fetchTaskComments = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/comments?taskId=${taskId}&taskType=Task`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      return data.comments || [];
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
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

      if (res.ok) {
        const comments = await fetchTaskComments(showCommentModal._id);
        setShowCommentModal({ ...showCommentModal, comments });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) {
      return;
    }

    const loadingToast = toast.loading("Deleting comment...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        toast.success("Comment deleted! 🗑️");
        if (showCommentModal) {
          const comments = await fetchTaskComments(showCommentModal._id);
          setShowCommentModal({ ...showCommentModal, comments });
        }
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Network error!");
      console.error("Error deleting comment:", error);
    }
  };

  const totalProjects = projects.length;
  const totalTasks = projects.reduce(
    (acc, p) => acc + (p.tasks?.length || 0),
    0
  );
  const completedTasks = projects.reduce(
    (acc, p) =>
      acc + (p.tasks?.filter((t) => t.status === "completed").length || 0),
    0
  );
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DashboardHeader
        icon={Folder}
        title="Manager Dashboard"
        subtitle={`Welcome back, ${user?.name}! 👋`}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="My Projects"
            value={totalProjects}
            icon={Folder}
            accentIcon={Activity}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatsCard
            title="Total Tasks"
            value={totalTasks}
            icon={Target}
            accentIcon={TrendingUp}
            gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatsCard
            title="Completed Tasks"
            value={completedTasks}
            icon={CheckCircle}
            accentIcon={Award}
            gradient="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatsCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={BarChart3}
            accentIcon={Zap}
            gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          />
        </div>

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-600 mt-1">
              Manage and track all your projects
            </p>
          </div>
          <button
            onClick={() => setShowCreateProjectModal(true)}
            className="btn btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="No projects yet"
            description="Create your first project to get started!"
            action={{
              label: "Create Project",
              onClick: () => setShowCreateProjectModal(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const completedTasks =
                project.tasks?.filter((t) => t.status === "completed").length ||
                0;
              const totalTasks = project.tasks?.length || 0;

              return (
                <div
                  key={project._id}
                  className="card card-hover p-6 group relative"
                >
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Folder className="w-6 h-6 text-white" />
                      </div>
                      <Badge
                        variant={
                          project.status === "completed"
                            ? "success"
                            : project.status === "in-progress"
                            ? "primary"
                            : "warning"
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(project.deadline)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{totalTasks} tasks</span>
                      </div>
                    </div>

                    <ProgressBar current={completedTasks} total={totalTasks} />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project._id);
                    }}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
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
          onDeleteTask={handleDeleteTask}
          onOpenComments={async (task: ITask) => {
            const comments = await fetchTaskComments(task._id);
            setShowCommentModal({ ...task, comments });
          }}
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

      {showCommentModal && (
        <Modal
          isOpen={!!showCommentModal}
          onClose={() => setShowCommentModal(null)}
          title={showCommentModal.title}
          subtitle="Task Comments"
          maxWidth="2xl"
        >
          <div className="mb-4">
            <p className="text-gray-700 mb-4">{showCommentModal.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1 px-3 py-1 bg-gray-50 rounded-lg">
                <Calendar size={14} />
                {formatDate(showCommentModal.deadline)}
              </span>
              <Badge
                variant={
                  showCommentModal.status === "completed"
                    ? "success"
                    : showCommentModal.status === "in-progress"
                    ? "primary"
                    : "warning"
                }
              >
                {showCommentModal.status}
              </Badge>
            </div>
          </div>

          <CommentSection
            comments={showCommentModal.comments || []}
            currentUserId={user?._id || ""}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            placeholder="Write a comment..."
            showRoleBadge={true}
          />
        </Modal>
      )}
    </div>
  );
}

// Create Project Modal Component
function CreateProjectModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Project"
      subtitle="Start a new project and organize your tasks"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Project Title"
          name="title"
          value={formData.title}
          onChange={(value: string) =>
            setFormData({ ...formData, title: value })
          }
          placeholder="Enter project name"
          required
        />

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value: string) =>
            setFormData({ ...formData, description: value })
          }
          placeholder="Describe your project goals and objectives"
          rows={4}
          required
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
            Create Project
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

// Project Detail Modal Component
function ProjectDetailModal({
  project,
  developers,
  onClose,
  onCreateTask,
  onDeleteTask,
  onOpenComments,
}: {
  project: IProject & { tasks?: ITask[] };
  developers: IUser[];
  onClose: () => void;
  onCreateTask: () => void;
  onDeleteTask: (taskId: string) => void;
  onOpenComments: (task: ITask) => void;
}) {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={project.title}
      subtitle="View and manage project tasks"
      maxWidth="4xl"
    >
      <p className="text-gray-700 mb-6">{project.description}</p>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Target size={20} className="text-blue-600" />
          Tasks ({project.tasks?.length || 0})
        </h3>
        <button
          onClick={onCreateTask}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <div className="space-y-3">
        {project.tasks?.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">
              No tasks yet. Create your first task!
            </p>
          </div>
        ) : (
          project.tasks?.map((task: ITask) => {
            const assignedUser = task.assignedTo as IUser;
            return (
              <div
                key={task._id}
                className="card p-4 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {task.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm flex-wrap">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Users size={14} />
                        {assignedUser.name}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(task.deadline)}
                      </span>
                      <span className="text-gray-400">•</span>
                      <button
                        onClick={() => onOpenComments(task)}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <MessageSquare size={14} />
                        Comments
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in-progress"
                          ? "primary"
                          : "warning"
                      }
                    >
                      {task.status}
                    </Badge>
                    <button
                      onClick={() => onDeleteTask(task._id)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

// Create Task Modal Component
function CreateTaskModal({
  projectId,
  developers,
  onClose,
  onCreate,
}: {
  projectId: string;
  developers: IUser[];
  onClose: () => void;
  onCreate: (projectId: string, data: any) => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    deadline: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(projectId, formData);
  };

  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  const developerOptions = developers.map((dev: IUser) => ({
    value: dev._id,
    label: dev.name,
  }));

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Create New Task"
      subtitle="Assign a new task to your team"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={(value: string) =>
            setFormData({ ...formData, title: value })
          }
          placeholder="Enter task name"
          required
        />

        <FormTextarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={(value: string) =>
            setFormData({ ...formData, description: value })
          }
          placeholder="Describe the task requirements"
          rows={3}
          required
        />

        <FormSelect
          label="Assign To"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={(value: string) =>
            setFormData({ ...formData, assignedTo: value })
          }
          options={developerOptions}
          placeholder="Select Developer"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={(value: string) =>
              setFormData({ ...formData, priority: value })
            }
            options={priorityOptions}
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
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" className="flex-1 btn btn-primary">
            <Plus size={18} className="inline mr-2" />
            Create Task
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
