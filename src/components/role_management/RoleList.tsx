
import React from 'react';
import RoleCard from './RoleCard';

interface RoleListProps {
  roles: { _id: string; name: string; permissions: number[] }[];
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
}

const RoleList: React.FC<RoleListProps> = ({ roles, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-700 font-semibold">
          <tr>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Permissions</th>
            <th className="px-6 py-3 text-center">Edit</th>
            <th className="px-6 py-3 text-center">Delete</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roles.map(role => (
            <RoleCard
              key={role._id}
              role={role}
              onEdit={() => onEdit(role._id)}
              onDelete={() => onDelete(role._id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleList;
