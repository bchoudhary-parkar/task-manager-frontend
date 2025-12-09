import React from 'react';
import RoleCard from './RoleCard';

interface RoleListProps {
  roles: { _id: string; name: string; permissions: number[] }[];
  selectedRoleIds: string[];
  onEdit: (roleId: string) => void;
  onDelete: (roleId: string) => void;
  onSelectRole: (roleId: string) => void;
  onSelectAll: () => void;
}

const RoleList: React.FC<RoleListProps> = ({ 
  roles, 
  selectedRoleIds,
  onEdit, 
  onDelete,
  onSelectRole,
  onSelectAll
}) => {
  const allSelected = roles.length > 0 && selectedRoleIds.length === roles.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-700 font-semibold">
          <tr>
            <th className="px-6 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onSelectAll}
                className="w-4 h-4 cursor-pointer accent-blue-600"
                title={allSelected ? "Deselect all" : "Select all"}
              />
            </th>
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
              isSelected={selectedRoleIds.includes(role._id)}
              onEdit={() => onEdit(role._id)}
              onDelete={() => onDelete(role._id)}
              onSelect={() => onSelectRole(role._id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleList;