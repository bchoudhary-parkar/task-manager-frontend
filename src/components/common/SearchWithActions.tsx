// src/components/common/SearchWithActions.tsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchWithActionsProps {
  searchTerm: string;
  placeholder?: string;
  onSearchChange: (value: string) => void;
  bulkActionButton?: React.ReactNode; // Optional bulk action button
}

/**
 * Unified search component with optional bulk action button
 * Used across User, Role, and Task management pages
 */
const SearchWithActions: React.FC<SearchWithActionsProps> = ({
  searchTerm,
  placeholder = 'Search...',
  onSearchChange,
  bulkActionButton
}) => {
  return (
    <div className="flex gap-4 mb-4 items-center">
      {/* Search Input */}
      <div className="flex-1 relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bulk Action Button (if provided) */}
      {bulkActionButton}
    </div>
  );
};

export default SearchWithActions;