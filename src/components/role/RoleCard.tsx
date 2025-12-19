import React from 'react';
import { FaEdit, FaInfoCircle } from 'react-icons/fa';
import { permissionsMap, formatPermissionName } from '../../utils/permissions';

interface RoleCardProps {
  role: { _id: string; name: string; description: string; permissions: number[] };
  isSelected: boolean;
  onEdit: () => void;
  onSelect: () => void;
  onInfo: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  isSelected, 
  onEdit, 
  onSelect,
  onInfo
}) => {
  const permissionNames = role.permissions
    .filter(code => code !== permissionsMap.all)
    .map(code => {
      const key = Object.keys(permissionsMap).find(k => permissionsMap[k] === code);
      return key ? formatPermissionName(key) : '';
    })
    .filter(Boolean)
    .join(', ');

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <tr className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
      {/* Checkbox */}
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-4 h-4 cursor-pointer accent-blue-600"
        />
      </td>

      {/* Role Name */}
      <td className="px-6 py-4">
        <span className="text-gray-800 font-medium">
          {truncateText(role.name, 30)}
        </span>
      </td>

      {/* Description */}
      <td className="px-6 py-4">
        <span className="text-gray-600">
          {role.description ? truncateText(role.description, 50) : '-'}
        </span>
      </td>

      {/* Permissions */}
      <td className="px-6 py-4">
        <span className="text-gray-600">
          {truncateText(permissionNames, 60)}
        </span>
      </td>

      {/* Info */}
      <td className="px-6 py-4 text-center">
        <button 
          onClick={onInfo} 
          className="text-gray-600 hover:text-blue-800 transition p-1"
          title="View details"
        >
          <FaInfoCircle size={18} />
        </button>
      </td>

      {/* Edit */}
      <td className="px-6 py-4 text-center">
        <button 
          onClick={onEdit} 
          className="text-blue-600 hover:text-blue-800 transition p-1"
          title="Edit role"
        >
          <FaEdit size={16} />
        </button>
      </td>

      {/* Delete */}
      {/* <td className="px-6 py-4 text-center">
        <button 
          onClick={onDelete} 
          className="text-gray-500 hover:text-red-600 transition p-1"
          title="Delete role"
        >
          <FaTrash size={16} />
        </button>
      </td> */}
    </tr>
  );
};

export default RoleCard;