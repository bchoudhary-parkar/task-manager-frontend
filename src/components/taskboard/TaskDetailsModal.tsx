// src/components/taskboard/TaskDetailsModal.tsx
import React, { useState } from 'react';
import { X, Calendar, User, Tag, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import type { Task, TaskStatus } from '../../types/task.types';
import PriorityBadge from './PriorityBadge';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void; // ADDED: New prop for status change
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onToggleSubtask,
  onStatusChange, // ADDED: Accept status change handler
}) => {
  // ADDED: Local state for status dropdown
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(task.status);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  // ADDED: Helper to get assignedTo name
  const getAssignedToName = () => {
    if (!task.assignedTo) return 'Unassigned';
    
    if (typeof task.assignedTo === 'object' && 'name' in task.assignedTo) {
      return task.assignedTo.name;
    }
    
    return task.assignedTo;
  };

  // ADDED: Handle status change
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return; // No change needed
    
    setIsChangingStatus(true);
    setSelectedStatus(newStatus);
    
    try {
      await onStatusChange(task._id, newStatus);
    } catch (error) {
      // Revert on error
      setSelectedStatus(task.status);
    } finally {
      setIsChangingStatus(false);
    }
  };
  const getCreatedByName = () => {
    if (!task.createdBy) return 'Unknown';
    if (typeof task.createdBy === 'object' && 'name' in task.createdBy) {
      return task.createdBy.name;
    }
    return String(task.createdBy);
  };

  // ADDED: Status dropdown options with colors
  const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
    { value: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'REVIEW', label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' },
  ];

  const currentStatusOption = statusOptions.find(opt => opt.value === selectedStatus);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
              </div>
              {/* ADDED: Status Dropdown */}
              <div className="flex items-center gap-2">
                <PriorityBadge priority={task.priority} />
                {/* <span className="text-sm font-medium text-gray-600">Status:</span> */}
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  disabled={isChangingStatus}
                  className={`px-3 py-1.5 rounded font-medium text-sm cursor-pointer transition-colors
                    ${currentStatusOption?.color || 'bg-gray-100 text-gray-800'}
                    ${isChangingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
                    border-none outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isChangingStatus && (
                  <span className="text-xs text-gray-500">Updating...</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Assigned To */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className=" flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">
                  Assigned To:
                </span>
                <span className="ml-2 text-sm font-semibold text-gray-600">
                  {getAssignedToName()}
                </span>
              </div>
            </div>
             <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">Created By:</span>
                <span className="ml-2 text-xm font-semibold text-gray-600">{getCreatedByName()}</span>
              </div>
            </div>

            {/* Due Date */}
            {task.dueDate && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Due Date:
                  </span>
                  <span className="ml-2 text-xm font-semibold text-gray-600">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <span className="text-xs text-gray-600 uppercase tracking-wide font-medium">Created At:</span>
                <span className="ml-2 text-xm font-semibold text-gray-600">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'})}
                </span>
              </div>
            </div>
          </div>
          

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Tags
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {totalSubtasks > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Subtasks
                  </h3>
                </div>
                <span className="text-sm text-gray-600">
                  {completedSubtasks} of {totalSubtasks} completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Subtask List */}
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => onToggleSubtask(task._id, subtask.id)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${
                        subtask.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-700'
                      } transition`}
                    >
                      {subtask.title}
                    </span>
                    {subtask.completed && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        ✓ Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Subtasks Message */}
          {totalSubtasks === 0 && (
            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                This task has no subtasks. You can add subtasks by editing the task.
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 pt-6 border-t">
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