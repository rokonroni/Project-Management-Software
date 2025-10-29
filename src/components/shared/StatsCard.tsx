import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  accentIcon: LucideIcon;
  gradient: string;
  iconBg?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  accentIcon: AccentIcon,
  gradient,
  iconBg = 'bg-white/20',
}: StatsCardProps) {
  return (
    <div className={`card card-hover p-6 ${gradient} text-white border-0`}>
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 ${iconBg} backdrop-blur-sm rounded-xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <AccentIcon className="w-5 h-5 opacity-50" />
      </div>
      <p className="text-sm font-medium mb-1 opacity-90">{title}</p>
      <p className="text-4xl font-bold">{value}</p>
    </div>
  );
}