import React, { useState, useEffect } from 'react';
import { type User } from '../../types/user.types';
import { getAllRoles } from '../../api/roleApi';
import type { Role } from '../../types/role.types';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
  updateUser: (id: string, updates: Partial<User>) => void;
}

const STATUS_LABELS: Record<'available' | 'not available', 'Active' | 'In Active'> = {
  available: 'Active',
  'not available': 'In Active',
};

function UserDetailsModal({ user, onClose, updateUser }: UserDetailsModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    status: (user.status as 'available' | 'not available') ?? 'available',
    role: user.role?._id || '',
  });

  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      status: (user.status as 'available' | 'not available') ?? 'available',
      role: user.role?._id || '',
    });
    loadRoles();
  }, [user]);

  const loadRoles = async () => {
    const { data } = await getAllRoles();
    if (data) {
      setRoles(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateUser(user._id, {
      name: formData.name,
      email: formData.email,
      status: formData.status,
      role: formData.role === '' ? null : formData.role,
    });
    setEditMode(false);
  };

  const getStatusLabel = (backendStatus?: string) =>
    backendStatus && (STATUS_LABELS as any)[backendStatus] ? (STATUS_LABELS as any)[backendStatus] : backendStatus ?? '—';

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border-2 border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none hover:cursor-pointer transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={
              user.picture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`
            }
            alt={user.name}
            className="w-32 h-32 rounded-full mb-4 object-cover border-4 border-gray-200 shadow-lg"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.name
              )}&background=random&color=fff`;
            }}
          />

          {editMode ? (
            <div className="w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                >
                  <option value="available">Active</option>
                  <option value="not available">In Active</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300"
                >
                  <option value="">No Role</option>
                  {roles.map((role) => (
                    <option key={role._id} value={role._id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-3 text-center">
              <p className="text-xl font-bold text-gray-900">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>

              <div className="flex justify-center items-center gap-2 pt-2">
                <span className="text-sm font-medium text-gray-600">Role:</span>
                {user.role ? (
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border-2 border-purple-200">
                    {user.role.name}
                  </span>
                ) : (
                  <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-500 border-2 border-gray-200">
                    No Role
                  </span>
                )}
              </div>

              <div className="flex justify-center items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 ${
                    user.status === 'available'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {getStatusLabel(user.status)}
                </span>
              </div>
            </div>
          )}

          <div className="w-full mt-6 flex gap-3">
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-200"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserDetailsModal;