
import { LogOut, LucideIcon } from 'lucide-react';

interface DashboardHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  userName?: string;
  onLogout: () => void;
}

export function DashboardHeader({
  icon: Icon,
  title,
  subtitle,
  userName,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-blue-900">{title}</h1>
              <p className="text-blue-600 text-sm">{subtitle}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-blue-600 rounded-xl transition-all duration-200 border border-white/20"
          >
            <LogOut size={18} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
