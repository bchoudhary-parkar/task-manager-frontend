import React from 'react';
import { X, Calendar, User, Tag, CheckSquare, Clock } from 'lucide-react';
import type { Task } from '../../types/task.types';
import PriorityBadge from './PriorityBadge';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onToggleSubtask,
}) => {
  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  const getAssignedToName = () => {
    if (!task.assignedTo) return 'Unassigned';
    if (typeof task.assignedTo === 'object' && 'name' in task.assignedTo) {
      return task.assignedTo.name;
    }
    return task.assignedTo;
  };

  const getCreatedByName = () => {
    if (!task.createdBy) return 'Unknown';
    if (typeof task.createdBy === 'object' && 'name' in task.createdBy) {
      return task.createdBy.name;
    }
    return task.createdBy;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.title}</h2>
              <div className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{task.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-gray-500">Assigned to:</span>
                <span className="ml-2 font-medium text-gray-700">{getAssignedToName()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-gray-500">Created by:</span>
                <span className="ml-2 font-medium text-gray-700">{getCreatedByName()}</span>
              </div>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-gray-500">Due date:</span>
                  <span className="ml-2 font-medium text-gray-700">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium text-gray-700">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-100 text-purple-700 uppercase rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Subtasks ({completedSubtasks}/{totalSubtasks})
                  </h3>
                </div>
                <div className="text-sm text-gray-500">
                  {totalSubtasks > 0
                    ? Math.round((completedSubtasks / totalSubtasks) * 100)
                    : 0}
                  % Complete
                </div>
              </div>

              <div className="mb-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{
                    width: `${
                      totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0
                    }%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    onClick={() => onToggleSubtask(task._id, subtask.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer hover:shadow-md ${
                      subtask.completed
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition ${
                        subtask.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-white border-2 border-gray-300'
                      }`}
                    >
                      {subtask.completed && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`flex-1 ${
                        subtask.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                      }`}
                    >
                      {subtask.title}
                    </span>
                    {subtask.completed && (
                      <span className="text-xs text-green-600 font-medium">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!task.subtasks || task.subtasks.length === 0) && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-700">Subtasks</h3>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500 text-sm">
                No subtasks added yet
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;