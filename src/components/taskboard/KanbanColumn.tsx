import React from 'react';
import type { Task, TaskStatus } from '../../types/task.types';
import TaskCard from './TaskCard';
 
interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string, e: React.MouseEvent) => void;
  onTaskView: (task: Task) => void;
  onDragStart: (task: Task) => void;
}
 
const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  color,
  tasks,
  onDragOver,
  onDrop,
  onTaskEdit,
  onTaskDelete,
  onTaskView,
  onDragStart,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="bg-white rounded-lg shadow-sm p-4"
    >
      <div className={`${color} rounded-lg p-3 mb-4`}>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-600">{tasks.length} tasks</span>
      </div>
      <div className="space-y-3 min-h-[400px]">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onTaskEdit}
            onDelete={onTaskDelete}
            onView={onTaskView}
            onDragStart={onDragStart}
          />
        ))}
      </div>
    </div>
  );
};
 
export default KanbanColumn;
 