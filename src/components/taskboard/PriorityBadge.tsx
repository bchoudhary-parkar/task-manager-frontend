import React from 'react';
import type { TaskPriority } from '../../types/task.types';
 
interface PriorityBadgeProps {
  priority: TaskPriority;
}
 
const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const colors = {
    LOW: 'bg-green-100 text-green-700 border-green-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    HIGH: 'bg-red-100 text-red-700 border-red-200',
  };
 
  return (
    <span className={`px-3 py-1.5 rounded text-sm font-medium border ${colors[priority]}`}>
      {priority}
    </span>
  );
};
 
export default PriorityBadge;
 