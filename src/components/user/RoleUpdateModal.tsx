import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Role } from '../../types/role.types';

interface RoleUpdateModalProps {
  userName: string;
  currentRole: string | null;
  roles: Role[];
  onClose: () => void;
  onConfirm: (newRoleId: string | null) => void;
}

const RoleUpdateModal: React.FC<RoleUpdateModalProps> = ({
  userName,
  currentRole,
  roles,
  onClose,
  onConfirm
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(currentRole || '');

  const handleConfirm = () => {
    onConfirm(selectedRole === '' ? null : selectedRole);
  };

  const currentRoleName = roles.find(r => r._id === currentRole)?.name || 'No Role';
  const newRoleName = selectedRole === '' ? 'No Role' : roles.find(r => r._id === selectedRole)?.name || 'No Role';
  const hasChanged = selectedRole !== (currentRole || '');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/30 backdrop-blur-md z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Update User Role
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">User</p>
            <p className="font-medium text-gray-900">{userName}</p>
          </div>

          {/* Current Role */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-600 mb-1">Current Role</p>
            <p className="font-medium text-blue-900">{currentRoleName}</p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select New Role <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">No Role</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Change Preview */}
          {hasChanged && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                ⚠️ You are about to change the role:
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-medium">{currentRoleName}</span>
                </span>
                <span className="text-gray-400 mx-2">→</span>
                <span className="text-gray-700">
                  <span className="font-medium text-yellow-700">{newRoleName}</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        {hasChanged && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 text-center">
              Are you sure you want to update the role?
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasChanged}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Update Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleUpdateModal; 