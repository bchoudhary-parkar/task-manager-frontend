import React from 'react';
import { type User } from '../../types/user.types'; // Assuming 'User' interface is imported

interface UserTableProps {
    users: User[];
    deleteUser: (id: string) => void;
    openDetails: (user: User) => void;
    updateUser: (id: string, updates: Partial<User>) => void;
}

// Functionally component, no React.FC
function UserTable({ users, deleteUser, openDetails, updateUser }: UserTableProps) {
  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-100">
              <td className="px-6 py-4 whitespace-nowrap" >{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={user.status}
                    onChange={(e) => updateUser(user._id, { status: e.target.value as 'available' | 'not available' })}
                    className={`p-2  rounded cursor-pointer ${user.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                >
                    <option value="available">Available</option>
                    <option value="not available">Not Available</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {/* FIX: Use optional chaining (?.) to safely access 'name' */}
                <select
                    value={user.role?.name || ''} 
                    onChange={(e) => updateUser(user._id, { role: e.target.value as string })}
                    className="p-2 rounded bg-gray-100 cursor-pointer"
                >
                    {/* Ensure option values match the backend seeded names (lowercase) */}
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => openDetails(user)} className='text-blue-600 hover:text-blue-900 ml cursor-pointer'>Edit</button>
                <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:text-red-900 ml-4 cursor-pointer">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;