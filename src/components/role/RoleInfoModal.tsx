import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { permissionsMap, formatPermissionName } from '../../utils/permissions';

interface RoleInfoModalProps {
  role: {
    _id: string;
    name: string;
    description: string;
    permissions: number[];
    createdAt?: string;
    updatedAt?: string;
  };
  onClose: () => void;
}

const RoleInfoModal: React.FC<RoleInfoModalProps> = ({ role, onClose }) => {
  const permissionNames = role.permissions
    .filter(code => code !== permissionsMap.all)
    .map(code => {
      const key = Object.keys(permissionsMap).find(k => permissionsMap[k] === code);
      return key ? formatPermissionName(key) : '';
    })
    .filter(Boolean);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/30 backdrop-blur-md z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-gray-800">Role Information</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Role Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role Name
            </label>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-gray-900 font-medium">{role.name}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 min-h-[80px]">
              <p className="text-gray-900 whitespace-pre-wrap break-words">
                {role.description || 'No description provided'}
              </p>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Permissions ({permissionNames.length})
            </label>
            <div className="bg-gray-50 rounded-lg px-4 py-4 border border-gray-200">
              {permissionNames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {permissionNames.map((perm, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No permissions assigned</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          {(role.createdAt || role.updatedAt) && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {role.createdAt && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-sm text-gray-600">{formatDate(role.createdAt)}</p>
                </div>
              )}
              {role.updatedAt && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-600">{formatDate(role.updatedAt)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoModal;