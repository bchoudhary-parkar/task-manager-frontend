// src/components/task/SearchBar.tsx
import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { taskApi } from '../../api/taskApi';
import type { TaskUser } from '../../types/task.types'; // Changed from User to TaskUser
 
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userFilter: string;
  setUserFilter: (user: string) => void;
  uniqueUsers: string[];
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
  onNewTask: () => void;
}
 
const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  userFilter,
  setUserFilter,
  filteredCount,
  totalCount,
  onClearFilters,
  onNewTask,
}) => {
  const [allUsers, setAllUsers] = useState<TaskUser[]>([]); // Changed from User to TaskUser
 
  useEffect(() => {
    fetchUsers();
  }, []);
 
  const fetchUsers = async () => {
    try {
      const data = await taskApi.getUsersForAssignment({ page: 1, limit: 100 });
      setAllUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
 
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
 
        <div className="w-64">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="w-full px-2 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Users</option>
            {allUsers.map((user) => (
              <option key={user._id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
 
        <button
          onClick={onNewTask}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          Create Task
        </button>
      </div>
 
      {(searchQuery || userFilter) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>
            Showing {filteredCount} of {totalCount} tasks
          </span>
          <button
            onClick={onClearFilters}
            className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
 
export default SearchBar;
 