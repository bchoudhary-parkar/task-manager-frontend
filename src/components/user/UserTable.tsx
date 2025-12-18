import React, { useState, useEffect } from 'react';
import { type User } from '../../types/user.types';
import { getAllRoles } from '../../api/roleApi';
import type { Role } from '../../types/role.types';
import { FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import RoleUpdateModal from './RoleUpdateModal';

interface UserTableProps {
    users: User[];
    deleteUser: (id: string) => void;
    openDetails: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
}

function UserTable({ users, deleteUser, openDetails, updateUser }: UserTableProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleUpdateModal, setRoleUpdateModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentRole: string | null;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    currentRole: null
  });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    const { data } = await getAllRoles();
    if (data) {
      setRoles(data);
    }
  };

  const handleRoleClick = (user: User) => {
    setRoleUpdateModal({
      isOpen: true,
      userId: user._id,
      userName: user.name,
      currentRole: user.role?._id || null
    });
  };

  const handleRoleUpdate = (newRoleId: string | null) => {
    updateUser(roleUpdateModal.userId, { role: newRoleId });
    setRoleUpdateModal({ isOpen: false, userId: '', userName: '', currentRole: null });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-center">Info</th>
              <th className="px-6 py-3 text-center">Edit</th>
              <th className="px-6 py-3 text-center">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition"
                >
                  {/* User Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {truncateText(user.name, 25)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {truncateText(user.email, 30)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => updateUser(user._id, { status: e.target.value as 'available' | 'not available' })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        user.status === 'available'
                          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:ring-green-300'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 focus:ring-red-300'
                      }`}
                    >
                      <option value="available">Active</option>
                      <option value="not available">In Active</option>
                    </select>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRoleClick(user)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all duration-200 hover:opacity-80 ${
                        user.role
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}
                    >
                      {user.role ? truncateText(user.role.name, 20) : 'No Role'}
                    </button>
                  </td>

                  {/* Info */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openDetails(user)}
                      className="text-gray-600 hover:text-blue-800 transition p-1"
                      title="View details"
                    >
                      <FaInfoCircle size={18} />
                    </button>
                  </td>

                  {/* Edit */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openDetails(user)}
                      className="text-blue-600 hover:text-blue-800 transition p-1"
                      title="Edit user"
                    >
                      <FaEdit size={16} />
                    </button>
                  </td>

                  {/* Delete */}
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="text-gray-500 hover:text-red-600 transition p-1"
                      title="Delete user"
                    >
                      <FaTrash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Role Update Modal */}
      {roleUpdateModal.isOpen && (
        <RoleUpdateModal
          userName={roleUpdateModal.userName}
          currentRole={roleUpdateModal.currentRole}
          roles={roles}
          onClose={() => setRoleUpdateModal({ isOpen: false, userId: '', userName: '', currentRole: null })}
          onConfirm={handleRoleUpdate}
        />
      )}
    </>
  );
}

export default UserTable;