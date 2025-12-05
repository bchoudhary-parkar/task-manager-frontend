
import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { permissionsMap } from '../../utils/permissions';

interface RoleCardProps {
  role: { _id: string; name: string; permissions: number[] };
  onEdit: () => void;
  onDelete: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  const permissionNames = role.permissions
    .filter(code => code !== permissionsMap.all)
    .map(code => Object.keys(permissionsMap).find(key => permissionsMap[key] === code))
    .join(', ');

  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-6 py-4 text-gray-800">{role.name}</td>
      <td className="px-6 py-4 text-gray-600">{permissionNames}</td>
      <td className="px-6 py-4 text-center">
        <button onClick={onEdit} className="text-gray-500 hover:text-gray-700">
          <FaEdit />
        </button>
      </td>
      <td className="px-6 py-4 text-center">
        <button onClick={onDelete} className="text-red-500 hover:text-red-700">
          <FaTrash />
        </button>
      </td>
    </tr>
  );
};

export default RoleCard;
