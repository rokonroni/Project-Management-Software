"use client";

import { formatDate } from "@/lib/utils";
import { IProject, ITask, IUser } from "@/types";
import {
  Activity,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Folder,
  LogOut,
  Plus,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

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

      const projectsRes = await fetch("/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const projectsData = await projectsRes.json();

      if (projectsData.success) {
        const projectsWithTasks = await Promise.all(
          projectsData.projects.map(async (project: IProject) => {
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
        toast.success("Task created and assigned!");
        fetchData();
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

  // Calculate stats
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Folder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">
                  Manager Dashboard
                </h1>
                <p className="text-blue-400 text-sm">
                  Welcome back, {user?.name}!
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all duration-200 border border-white/20"
            >
              <LogOut className="text-blue-400" size={18} />
              <span className="font-medium text-blue-400">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card card-hover p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Folder className="w-6 h-6" />
              </div>
              <Activity className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Total Projects
            </p>
            <p className="text-4xl font-bold">{totalProjects}</p>
          </div>

          <div className="card card-hover p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-purple-100 text-sm font-medium mb-1">
              Total Tasks
            </p>
            <p className="text-4xl font-bold">{totalTasks}</p>
          </div>

          <div className="card card-hover p-6 bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <Award className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Completed Tasks
            </p>
            <p className="text-4xl font-bold">{completedTasks}</p>
          </div>

          <div className="card card-hover p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <Zap className="w-5 h-5 opacity-50" />
            </div>
            <p className="text-orange-100 text-sm font-medium mb-1">
              Completion Rate
            </p>
            <p className="text-4xl font-bold">{completionRate}%</p>
          </div>
        </div>

        {/* Projects Section */}
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
          <div className="card p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Folder className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first project to get started!
            </p>
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const completedTasks =
                project.tasks?.filter((t) => t.status === "completed").length ||
                0;
              const totalTasks = project.tasks?.length || 0;
              const progress =
                totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

              return (
                <div
                  key={project._id}
                  onClick={() => setSelectedProject(project)}
                  className="card card-hover p-6 cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Folder className="w-6 h-6 text-white" />
                    </div>
                    <span
                      className={`badge ${
                        project.status === "completed"
                          ? "badge-success"
                          : project.status === "in-progress"
                          ? "badge-primary"
                          : "badge-warning"
                      }`}
                    >
                      {project.status}
                    </span>
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

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">
                        Progress
                      </span>
                      <span className="font-bold text-gray-900">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
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

// Modal Components remain similar but with updated styling
function CreateProjectModal({ onClose, onCreate }: any) {
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
    <div
      className="modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal-content max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Project
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Start a new project and organize your tasks
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Project Title
            </label>
            <input
              type="text"
              className="input"
              placeholder="Enter project name"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="input min-h-[120px]"
              placeholder="Describe your project goals and objectives"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="date"
              className="input"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              required
            />
          </div>

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
      </div>
    </div>
  );
}

// Similar professional styling for other modals...
function ProjectDetailModal({
  project,
  developers,
  onClose,
  onCreateTask,
}: any) {
  return (
    <div
      className="modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal-content max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {project.title}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              View and manage project tasks
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">{project.description}</p>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target size={20} className="text-blue-600" />
              Tasks
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
            {project.tasks?.map((task: ITask) => {
              const assignedUser = task.assignedTo as IUser;
              return (
                <div
                  key={task._id}
                  className="card p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600">
                          👤 {assignedUser.name}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600">
                          📅 {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        task.status === "completed"
                          ? "badge-success"
                          : task.status === "in-progress"
                          ? "badge-primary"
                          : "badge-warning"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ projectId, developers, onClose, onCreate }: any) {
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

  return (
    <div
      className="modal-backdrop flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="modal-content max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Create New Task</h2>
          <p className="text-gray-600 text-sm mt-1">
            Assign a new task to your team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              className="input"
              placeholder="Enter task name"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="input min-h-[100px]"
              placeholder="Describe the task requirements"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign To
            </label>
            <select
              className="input"
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                className="input"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="flex-1 btn btn-primary">
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
      </div>
    </div>
  );
}
