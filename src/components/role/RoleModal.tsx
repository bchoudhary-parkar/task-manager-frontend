import React from 'react';
import { permissionsMap, formatPermissionName } from '../../utils/permissions';
import { FaTimes } from 'react-icons/fa';

interface RoleModalProps {
  isEditMode: boolean;
  name: string;
  description: string;
  selectedPermissions: number[];
  errorMessage: string;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTogglePermission: (code: number) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  isEditMode,
  name,
  description,
  selectedPermissions,
  errorMessage,
  onClose,
  onSave,
  onNameChange,
  onDescriptionChange,
  onTogglePermission
}) => {
  const [fieldErrors, setFieldErrors] = React.useState({
    name: '',
    permissions: ''
  });

  const validateAndSave = () => {
    const errors = {
      name: '',
      permissions: ''
    };

    let hasError = false;

    if (!name || !name.trim()) {
      errors.name = 'Role name is required';
      hasError = true;
    }
    if(name && name.trim().length < 4){
      errors.name = 'Role name must be at least 4 characters long';
      hasError = true;
    }

    if (selectedPermissions.length === 0) {
      errors.permissions = 'Please select at least one permission';
      hasError = true;
    }

    setFieldErrors(errors);

    if (!hasError) {
      onSave();
    }
  };

  const handleNameChange = (value: string) => {
    onNameChange(value);
    if (fieldErrors.name && value.trim()) {
      setFieldErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handlePermissionToggle = (code: number) => {
    onTogglePermission(code);
    if (fieldErrors.permissions) {
      setFieldErrors(prev => ({ ...prev, permissions: '' }));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/30 backdrop-blur-md z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
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

        {/* Role Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Role Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter role name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full border ${
              fieldErrors.name ? 'border-gray-500' : 'border-gray-300'
            } rounded px-3 py-2 focus:outline-none focus:ring-2 ${
              fieldErrors.name ? 'focus:ring-blue-500' : 'focus:ring-blue-500'
            }`}
          />
          {fieldErrors.name && (
            <p className="text-red-500 text-sm mt-1">{fieldErrors.name}</p>
          )}
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter role description (optional)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Permissions */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3">
            Select Permissions: <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col gap-3">
            {Object.entries(permissionsMap).map(([key, value]) => (
              <label key={value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(value)}
                  onChange={() => handlePermissionToggle(value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="text-gray-700">{formatPermissionName(key)}</span>
              </label>
            ))}
          </div>
          {fieldErrors.permissions && (
            <p className="text-red-500 text-sm mt-2">{fieldErrors.permissions}</p>
          )}
        </div>

        {/* General Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={validateAndSave}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleModal;