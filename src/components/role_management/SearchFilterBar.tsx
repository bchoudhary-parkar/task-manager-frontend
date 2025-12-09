import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchFilterBarProps {
  searchTerm: string;
  filterColumn: 'all' | 'role' | 'permissions';
  resultCount: number;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'role' | 'permissions') => void;
  onClear: () => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  filterColumn,
  resultCount,
  totalCount,
  onSearchChange,
  onFilterChange,
  onClear
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="md:w-48">
          <select
            value={filterColumn}
            onChange={(e) => onFilterChange(e.target.value as 'all' | 'role' | 'permissions')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Columns</option>
            <option value="role">Role Name</option>
            <option value="permissions">Permissions</option>
          </select>
        </div>

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={onClear}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results Count */}
      {searchTerm && (
        <p className="text-sm text-gray-600 mt-3">
          Found {resultCount} of {totalCount} role{resultCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

export default SearchFilterBar;