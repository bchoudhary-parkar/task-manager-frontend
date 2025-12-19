// src/pages/TaskManagementPage.tsx - JIRA STYLE FINAL
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { taskApi } from '../api/taskApi';
import type { Task, TaskStatus, CreateTaskDTO } from '../types/task.types';
import SearchBar from '../components/taskboard/SearchBar';
import KanbanColumn from '../components/taskboard/KanbanColumn';
import TaskModal from '../components/taskboard/TaskModal';
import TaskDetailsModal from '../components/taskboard/TaskDetailsModal';
import TaskDeletionModal from '../components/taskboard/TaskDeletionModal';
import DashboardLayout from '../layouts/DashboardLayout';

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'REVIEW', title: 'Review', color: 'bg-yellow-100' },
    { id: 'DONE', title: 'Done', color: 'bg-green-100' },
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (userFilter) {
      filtered = filtered.filter((task) => {
        const assignedToName = typeof task.assignedTo === 'object' && task.assignedTo !== null
          ? task.assignedTo.name
          : task.assignedTo;
        
        return assignedToName?.toLowerCase().includes(userFilter.toLowerCase());
      });
    }

    setFilteredTasks(filtered);
  }, [searchQuery, userFilter, tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const uniqueUsers = Array.from(
    new Set(
      tasks
        .filter(t => t.assignedTo)
        .map((t) => {
          if (typeof t.assignedTo === 'object' && t.assignedTo !== null) {
            return t.assignedTo.name;
          }
          return t.assignedTo;
        })
    )
  );

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (status: TaskStatus) => {
    if (!draggedTask) return;

    const originalStatus = draggedTask.status;

    setTasks((prev) =>
      prev.map((task) =>
        task._id === draggedTask._id ? { ...task, status } : task
      )
    );

    try {
      await taskApi.updateTask(draggedTask._id, { status });
      toast.success(`Task moved to ${status.replace('_', ' ')}`);
    } catch (error: any) {
      console.error('Error updating task:', error);
      toast.error(error.response?.data?.message || 'Failed to update task status');

      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggedTask._id ? { ...task, status: originalStatus } : task
        )
      );
    }

    setDraggedTask(null);
  };
  
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const originalStatus = task.status;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, status: newStatus } : t
      )
    );

    if (selectedTask && selectedTask._id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }

    try {
      await taskApi.updateTask(taskId, { status: newStatus });
      toast.success(`Task status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error(error.response?.data?.message || 'Failed to update task status');

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status: originalStatus } : t
        )
      );
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, status: originalStatus });
      }
    }
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsCreateEditModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDetailsModalOpen(false);
    setIsCreateEditModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const originalSubtasks = [...task.subtasks];

    setTasks((prev) =>
      prev.map((t) =>
        t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t
      )
    );

    if (selectedTask && selectedTask._id === taskId) {
      setSelectedTask({ ...selectedTask, subtasks: updatedSubtasks });
    }

    try {
      await taskApi.updateTask(taskId, { subtasks: updatedSubtasks });
      const subtask = updatedSubtasks.find((st) => st.id === subtaskId);
      toast.success(
        subtask?.completed
          ? `✓ Subtask "${subtask.title}" completed`
          : `Subtask "${subtask?.title}" reopened`
      );
    } catch (error: any) {
      console.error('Error toggling subtask:', error);
      toast.error(error.response?.data?.message || 'Failed to update subtask');

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, subtasks: originalSubtasks } : t
        )
      );
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask({ ...selectedTask, subtasks: originalSubtasks });
      }
    }
  };

  const handleSaveTask = async (taskData: any) => {
    const loadingToastId = toast.loading(
      editingTask ? 'Updating task...' : 'Creating task...'
    );

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const payload: CreateTaskDTO = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo || undefined,
        dueDate: taskData.dueDate,
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
        createdBy: user.name || 'Current User',
        status: editingTask?.status || 'TODO',
      };

      if (editingTask) {
        const updatePayload = {
          title: payload.title,
          description: payload.description,
          priority: payload.priority,
          assignedTo: payload.assignedTo,
          dueDate: payload.dueDate,
          tags: payload.tags,
          subtasks: payload.subtasks,
        };

        const updatedTask = await taskApi.updateTask(editingTask._id, updatePayload);
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? updatedTask : t))
        );
        toast.update(loadingToastId, {
          render: 'Task updated successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        const newTask = await taskApi.createTask(payload);
        
        setTasks((prev) => [...prev, newTask]);
        toast.update(loadingToastId, {
          render: 'Task created successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        });
      }

      setIsCreateEditModalOpen(false);
      setEditingTask(null);
    } catch (error: any) {
      toast.update(loadingToastId, {
        render: error.response?.data?.message || 'Failed to save task. Please try again.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);

    try {
      await taskApi.deleteTask(taskToDelete._id);
      setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTaskToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setUserFilter('');
    toast.success('Filters cleared');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Main container - Full height, single scroll */}
      <div className="fixed inset-0 top-16 flex flex-col bg-gray-50">
        
        {/* Fixed Header - Compact like Jira */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-3">Task Board</h1>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            uniqueUsers={uniqueUsers}
            filteredCount={filteredTasks.length}
            totalCount={tasks.length}
            onClearFilters={handleClearFilters}
            onNewTask={handleNewTask}
          />
        </div>

        {/* Board Area - Single unified scroll */}
        <div className="flex-1 overflow-y-auto p-4 pt-0">
          <div className="flex gap-3">
            {columns.map((column) => {
              const columnTasks = filteredTasks.filter((t) => t.status === column.id);

              return (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  tasks={columnTasks}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                  onTaskEdit={handleEditTask}
                  onTaskDelete={handleDeleteTask}
                  onTaskView={handleViewTask}
                  onDragStart={handleDragStart}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCreateEditModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setIsCreateEditModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {isDetailsModalOpen && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedTask(null);
          }}
          onToggleSubtask={handleToggleSubtask}
          onStatusChange={handleStatusChange}
        />
      )}

      <TaskDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This will also delete all subtasks associated with this task.`}
        isDeleting={isDeleting}
      />
    </DashboardLayout>
  );
};

export default TaskManagementPage;