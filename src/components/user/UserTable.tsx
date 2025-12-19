import React, { useState, useEffect, useMemo } from 'react';
import { type User } from '../../types/user.types';
import { getAllRoles } from '../../api/roleApi';
import type { Role } from '../../types/role.types';
import { FaEdit, FaInfoCircle, FaUserCircle } from 'react-icons/fa';
import RoleUpdateModal from './RoleUpdateModal';


const UserAvatar = React.memo(({ name, picture }: { name: string; picture?: string }) => {
  const fallbackUrl = useMemo(
    () => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`,
    [name]
  );

  const [imgSrc, setImgSrc] = useState<string>(picture || fallbackUrl);
  const [useIconFallback, setUseIconFallback] = useState<boolean>(false);

  // Sync state if picture or name changes
  useEffect(() => {
    setImgSrc(picture || fallbackUrl);
    setUseIconFallback(false);
  }, [picture, fallbackUrl]);

  if (useIconFallback) {
    return <FaUserCircle className="w-10 h-10 text-gray-300" aria-label={`${name} avatar fallback icon`} />;
  }

  return (
    <img
      src={imgSrc}
      alt={name}
      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
      onError={() => {
        // First try the fallback URL; if that also errors, show icon
        if (imgSrc !== fallbackUrl) {
          setImgSrc(fallbackUrl);
        } else {
          setUseIconFallback(true);
        }
      }}
    />
  );
});

interface UserTableProps {
  users: User[];
  deleteUser: (id: string) => void; // Kept in props for compatibility, but not used anymore
  openDetails: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  selectedUserIds: string[];
  onSelectUser: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
}

function UserTable({
  users,
  deleteUser, // NOTE: not used after removing per-row delete column
  openDetails,
  updateUser,
  selectedUserIds,
  onSelectUser,
  onSelectAll
}: UserTableProps) {
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

  const isAllSelected = users.length > 0 && selectedUserIds.length === users.length;

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3 w-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3 text-center">Info</th>
              <th className="px-6 py-3 text-center">Edit</th>
              {/* Deleted the per-row Delete column */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                {/* Adjusted colSpan from 7 to 6 after removing the Delete column */}
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className={`transition ${selectedUserIds.includes(user._id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      checked={selectedUserIds.includes(user._id)}
                      onChange={() => onSelectUser(user._id)}
                    />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} picture={user.picture} />
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

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openDetails(user)}
                      className="text-gray-600 hover:text-blue-800 transition p-1"
                    >
                      <FaInfoCircle size={18} />
                    </button>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => openDetails(user)}
                      className="text-blue-600 hover:text-blue-800 transition p-1"
                    >
                      <FaEdit size={16} />
                    </button>
                  </td>

                  {/* Deleted per-row Delete action cell */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
