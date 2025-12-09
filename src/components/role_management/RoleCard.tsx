import React from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { permissionsMap, formatPermissionName } from '../../utils/permissions';

interface RoleCardProps {
  role: { _id: string; name: string; permissions: number[] };
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSelect: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  isSelected, 
  onEdit, 
  onDelete, 
  onSelect 
}) => {
  const permissionNames = role.permissions
    .filter(code => code !== permissionsMap.all)
    .map(code => {
      const key = Object.keys(permissionsMap).find(k => permissionsMap[k] === code);
      return key ? formatPermissionName(key) : '';
    })
    .filter(Boolean)
    .join(', ');

  return (
    <tr className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
      </td>
      <td className="px-6 py-4 text-gray-800">{role.name}</td>
      <td className="px-6 py-4 text-gray-600">{permissionNames}</td>
      <td className="px-6 py-4 text-center">
        <button 
          onClick={onEdit} 
          className="text-blue-600 hover:text-blue-800 transition p-1"
          title="Edit role"
        >
          <FaEdit size={16} />
        </button>
      </td>
      <td className="px-6 py-4 text-center">
        <button 
          onClick={onDelete} 
          className="text-gray-500 hover:text-red-600 transition p-1"
          title="Delete role"
        >
          <FaTrash size={16} />
        </button>
      </td>
    </tr>
  );
};

export default RoleCard;