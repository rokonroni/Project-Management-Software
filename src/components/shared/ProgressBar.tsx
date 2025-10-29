
interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  height = 'md',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div>
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 font-medium">Progress</span>
          <span className="font-bold text-gray-900">{percentage}%</span>
        </div>
      )}
      <div className={`progress-bar ${heights[height]}`}>
        <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
}