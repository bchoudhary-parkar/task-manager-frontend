// import React from 'react';
// import type { Task, TaskStatus } from '../../types/task.types';
// import TaskCard from './TaskCard';
 
// interface KanbanColumnProps {
//   id: TaskStatus;
//   title: string;
//   color: string;
//   tasks: Task[];
//   onDragOver: (e: React.DragEvent) => void;
//   onDrop: () => void;
//   onTaskEdit: (task: Task) => void;
//   onTaskDelete: (taskId: string, e: React.MouseEvent) => void;
//   onTaskView: (task: Task) => void;
//   onDragStart: (task: Task) => void;
// }
 
// const KanbanColumn: React.FC<KanbanColumnProps> = ({
//   title,
//   color,
//   tasks,
//   onDragOver,
//   onDrop,
//   onTaskEdit,
//   onTaskDelete,
//   onTaskView,
//   onDragStart,
// }) => {
//   return (
//     <div
//       onDragOver={onDragOver}
//       onDrop={onDrop}
//       className="bg-white rounded-lg shadow-sm p-4"
//     >
//       <div className={`${color} rounded-lg p-3 mb-4`}>
//         <h3 className="font-semibold text-gray-800">{title}</h3>
//         <span className="text-sm text-gray-600">{tasks.length} tasks</span>
//       </div>
//       <div className="space-y-3 min-h-[400px]">
//         {tasks.map((task) => (
//           <TaskCard
//             key={task._id}
//             task={task}
//             onEdit={onTaskEdit}
//             onDelete={onTaskDelete}
//             onView={onTaskView}
//             onDragStart={onDragStart}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };
 
// export default KanbanColumn;
 
// src/components/taskboard/KanbanColumn.tsx - WORKING VERSION
// src/components/taskboard/KanbanColumn.tsx - SINGLE SCROLL VERSION
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
      className="flex flex-col bg-white shadow-sm border border-gray-200 w-75 flex-shrink-0"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* STICKY HEADER - Stays at top when parent scrolls */}
      <div className={`${color} px-4 py-3 border-b border-gray-200 sticky top-0 z-10`}>
        <h3 className="font-bold text-gray-800 text-base">{title}</h3>
        <span className="text-xs text-gray-600 font-medium">
          {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {/* TASK LIST - NO SCROLL, just flows naturally */}
      <div className="p-3 space-y-3 mt-3">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-100 text-gray-400 text-sm">
            <p>No tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onView={onTaskView}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;