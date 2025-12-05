
import React from 'react';
import { permissionsMap } from '../../utils/permissions';
import { FaTimes } from 'react-icons/fa';

interface RoleModalProps {
  isEditMode: boolean;
  name: string;
  selectedPermissions: number[];
  errorMessage: string;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onTogglePermission: (code: number) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  isEditMode,
  name,
  selectedPermissions,
  errorMessage,
  onClose,
  onSave,
  onNameChange,
  onTogglePermission
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/30 backdrop-blur-md z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8"> {/* Bigger modal */}
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            {isEditMode ? 'Edit Role' : 'Add New Role'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            <FaTimes />
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        {/* Role Name Input */}
        <input
          type="text"
          placeholder="Role Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Permissions */}
        <div>
          <h4 className="text-gray-700 font-medium mb-3">Select Permissions:</h4>
          <div className="flex flex-col gap-3"> {/* Vertical layout */}
            {Object.entries(permissionsMap).map(([key, value]) => (
              <label key={value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(value)}
                  onChange={() => onTogglePermission(value)}
                  className="w-4 h-4" // Default checkbox size
                />
                <span className="text-gray-700">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;
