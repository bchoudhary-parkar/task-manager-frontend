import React from 'react';
import { Calendar, User, CheckSquare } from 'lucide-react';
import type { Task } from '../../types/task.types';
import PriorityBadge from './PriorityBadge';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string, e: React.MouseEvent) => void;
  onView: (task: Task) => void;
  onDragStart: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onView,
  onDragStart,
}) => {
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // Helper function to get assignedTo name
  const getAssignedToName = () => {
    if (!task.assignedTo) return 'Unassigned';
    
    if (typeof task.assignedTo === 'object' && 'name' in task.assignedTo) {
      return task.assignedTo.name;
    }
    
    return task.assignedTo;
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition group"
    >
      <div onClick={() => onView(task)} className="cursor-pointer mb-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-gray-800 group-hover:text-blue-600 transition pr-2">
            {task.title}
          </h4>
          <PriorityBadge priority={task.priority} />
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
        {totalSubtasks > 0 && (
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-600">
            <CheckSquare className="w-3 h-3" />
            <span>
              {completedSubtasks}/{totalSubtasks} subtasks
            </span>
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{getAssignedToName()}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        {task.tags && task.tags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-purple-100 text-purple-700 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={(e) => onDelete(task._id, e)}
          className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
