// src/pages/TaskManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { taskApi } from '../api/taskApi';
import type { Task, TaskStatus, CreateTaskDTO } from '../types/task.types';
import SearchBar from '../components/taskboard/SearchBar';
import KanbanColumn from '../components/taskboard/KanbanColumn';
import TaskModal from '../components/taskboard/TaskModal';
import TaskDetailsModal from '../components/taskboard/TaskDetailsModal';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import DashboardLayout from '../layouts/DashboardLayout';
const TaskManagementPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalTasksCount, setTotalTasksCount] = useState(0); 
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

  // Fetch tasks function (only for initial load with loading state)
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskApi.getTasks({});
      setTasks(data);
      setTotalTasksCount(data.length); 
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch tasks');
      setTasks([]);
      setTotalTasksCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const performSearch = async () => {
        try {

          const data = await taskApi.getTasks({
            search: searchQuery || undefined,
            assignedTo: userFilter || undefined,
          });

          setTasks(data);
          
          if (!searchQuery && !userFilter) {
            setTotalTasksCount(data.length);
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Failed to fetch tasks');
          setTasks([]);
        }
      };
      
      performSearch();
    }, 500); 

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, userFilter]);

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
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    const originalStatus = task.status;

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
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
        prev.map((t) => (t._id === taskId ? { ...t, status: originalStatus } : t))
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
      prev.map((t) => (t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t))
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
        prev.map((t) => (t._id === taskId ? { ...t, subtasks: originalSubtasks } : t))
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
      const payload: CreateTaskDTO = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        assignedTo: taskData.assignedTo || undefined,
        dueDate: taskData.dueDate,
        tags: taskData.tags || [],
        subtasks: taskData.subtasks || [],
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
    fetchTasks();
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
      <div className="flex flex-col h-138 bg-gray-50">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-2 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Task Board</h1>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userFilter={userFilter}
            setUserFilter={setUserFilter}
            uniqueUsers={[]}
            filteredCount={tasks.length}
            totalCount={totalTasksCount}
            onClearFilters={handleClearFilters}
            onNewTask={handleNewTask}
          />
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 pt-0 pb-0">
          <div className="flex gap-3">
            {columns.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.id);

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

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This will also delete all subtasks associated with this task."
        itemNames={taskToDelete ? [taskToDelete.title] : []}
        isDeleting={isDeleting}
        entityType="task"
      />
    </DashboardLayout>
  );
};

export default TaskManagementPage;