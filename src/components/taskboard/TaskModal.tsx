// src/components/task/TaskModal.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { X, Plus, Trash2, AlertCircle, Edit2, Check } from 'lucide-react';
import type { Task, TaskPriority, SubTask, TaskUser } from '../../types/task.types';
import { taskApi } from '../../api/taskApi';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  onSave: (taskData: any) => void;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  // assignedTo?: string;
  priority?: string;
  dueDate?: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '' as '' | TaskPriority,
    assignedTo: '',          // will store TaskUser._id
    dueDate: '',             // YYYY-MM-DD
    tags: '',
  });

  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [users, setUsers] = useState<TaskUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (task) {
      const formattedDate = task.dueDate
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : '';

      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || '',
        assignedTo: task.assignedTo?._id || '',
        dueDate: formattedDate,
        tags: task.tags?.join(', ') || '',
      });
      setSubtasks(task.subtasks || []);
    } else {
      setFormData({
        title: '',
        description: '',
        priority: '',
        assignedTo: '',
        dueDate: '',
        tags: '',
      });
      setSubtasks([]);
    }
  }, [task]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const data = await taskApi.getUsersForAssignment();
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateField = (name: string, value: string): string | undefined => {
  if (name === 'title') {
    if (!value.trim()) {
      return 'Title is required';
    }
    if (value.trim().length < 3) {
      return 'Title must be at least 3 characters';
    }
    if (value.trim().length > 200) {
      return 'Title cannot exceed 200 characters';
    }
  } else if (name === 'description') {
    if (!value.trim()) {
      return 'Description is required';
    }
    if (value.trim().length < 10) {
      return 'Description must be at least 10 characters';
    }
  } 
  
  // else if (name === 'assignedTo') {
  //   if (!value) {
  //     return 'Please select a user to assign this task';
  //   }
  // }
  else if (name === 'priority') {
    if (!value) {
      return 'Please set your priority for this task';
    }
  } else if (name === 'dueDate') {
    if (!value) {
      return 'Due Date is required for this task';
    }
  }
  
  return undefined;
};

// In validateForm function, REMOVE assignedTo validation:

const validateForm = (): boolean => {
  const newErrors: ValidationErrors = {};

  const titleError = validateField('title', formData.title);
  if (titleError) newErrors.title = titleError;

  const descriptionError = validateField('description', formData.description);
  if (descriptionError) newErrors.description = descriptionError;

  // ❌ REMOVE THESE LINES
  // const assignedToError = validateField('assignedTo', formData.assignedTo);
  // if (assignedToError) newErrors.assignedTo = assignedToError;

  const priorityError = validateField('priority', formData.priority);
  if (priorityError) newErrors.priority = priorityError;

  const dueDateError = validateField('dueDate', formData.dueDate);
  if (dueDateError) newErrors.dueDate = dueDateError; 

  setErrors(newErrors);
  setTouched({
    title: true,
    description: true,
    // assignedTo: true, // ❌ REMOVE THIS
    priority: true,
    dueDate: true,
  });

  return Object.keys(newErrors).length === 0;
};

  const handleFieldChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleFieldBlur = (name: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) {
      toast.error('Please enter a subtask title');
      return;
    }

    setSubtasks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false,
      },
    ]);
    setNewSubtask('');
    toast.success('Subtask added');
  };

  const handleRemoveSubtask = (id: string) => {
    const subtask = subtasks.find((st) => st.id === id);
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
    toast.success(`Removed: ${subtask?.title}`);
  };

  const handleStartEditSubtask = (subtask: SubTask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskText(subtask.title);
  };

  const handleSaveEditSubtask = (id: string) => {
    if (!editingSubtaskText.trim()) {
      toast.error('Subtask title cannot be empty');
      return;
    }

    setSubtasks((prev) =>
      prev.map((st) =>
        st.id === id ? { ...st, title: editingSubtaskText.trim() } : st
      )
    );
    setEditingSubtaskId(null);
    setEditingSubtaskText('');
    toast.success('Subtask updated');
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskText('');
  };

 const handleSubmit = () => {
  if (!validateForm()) {
    toast.error('Please fix all errors before submitting');
    return;
  }

  // Process tags properly
  const processedTags = formData.tags
    .split(/[ ,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  // Build task data with proper structure
  const taskData = {
    title: formData.title,
    description: formData.description,
    priority: formData.priority,
    assignedTo: formData.assignedTo,
    dueDate: formData.dueDate,
    tags: processedTags,
    subtasks: subtasks, // This should be the state array
  };

  onSave(taskData);
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                onBlur={() => handleFieldBlur('title')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                  errors.title && touched.title
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && touched.title && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.title}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange('description', e.target.value)
                }
                onBlur={() => handleFieldBlur('description')}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                  errors.description && touched.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                rows={4}
                placeholder="Describe the task in detail"
              />
              {errors.description && touched.description && (
                <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description}</span>
                </div>
              )}
            </div>

            {/* Priority and Assigned To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleFieldChange('priority', e.target.value as TaskPriority)
                  }
                  onBlur={() => handleFieldBlur('priority')}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                    errors.priority && touched.priority
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Prioritize Your Task</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                {errors.priority && touched.priority && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.priority}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Assigned To
                </label>
                {loadingUsers ? (
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-500">
                    Loading users...
                  </div>
                ) : (
                  <>
                    <select
                      value={formData.assignedTo}
                      onChange={(e) =>
                        handleFieldChange('assignedTo', e.target.value)
                      }
                      onBlur={() => handleFieldBlur('assignedTo')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                        // errors.assignedTo && touched.assignedTo
                        //   ? 'border-red-500 focus:ring-red-500'
                           'border-gray-300 focus:ring-blue-500'
                      }`}
                    >
                      <option value="">Select a user</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    {/* {errors.assignedTo && touched.assignedTo && (
                      <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.assignedTo}</span>
                      </div>
                    )} */}
                  </>
                )}
              </div>
            </div>

            {/* Due Date and Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    handleFieldChange('dueDate', e.target.value)
                  }
                  onBlur={() => handleFieldBlur('dueDate')}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${
                    errors.dueDate && touched.dueDate
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.dueDate && touched.dueDate && (
                  <div className="flex items-center gap-1 mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.dueDate}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleFieldChange('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="design, urgent, frontend"
                />
              </div>
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subtasks (Optional)
              </label>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Add a subtask and press Enter..."
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add</span>
                </button>
              </div>

              {subtasks.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                  {subtasks.map((subtask, index) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-2 bg-white rounded-lg group hover:shadow-sm transition"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {index + 1}
                      </div>

                      {editingSubtaskId === subtask.id ? (
                        <input
                          type="text"
                          value={editingSubtaskText}
                          onChange={(e) =>
                            setEditingSubtaskText(e.target.value)
                          }
                          onKeyUp={(e) => {
                            if (e.key === 'Enter') handleSaveEditSubtask(subtask.id);
                            if (e.key === 'Escape') handleCancelEditSubtask();
                          }}
                          className="flex-1 px-2 py-1 border-2 border-blue-500 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="flex-1 text-gray-700">
                          {subtask.title}
                        </span>
                      )}

                      {task && subtask.completed && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Completed
                        </span>
                      )}

                      {editingSubtaskId === subtask.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSaveEditSubtask(subtask.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                            title="Save (Enter)"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditSubtask}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition"
                            title="Cancel (Esc)"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleStartEditSubtask(subtask)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit subtask"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(subtask.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete subtask"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {task ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
