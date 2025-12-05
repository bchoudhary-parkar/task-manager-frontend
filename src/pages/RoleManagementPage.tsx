
import React, { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from './../services/api';
import RoleModal from './../components/role_management/RoleModal';
import RoleList from './../components/role_management/RoleList';
import { permissionsMap } from './../utils/permissions';
import DeleteConfirmationModal from '../components/role_management/DeleteConfirmationModal';

const RoleManagementPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [roleNameToDelete, setRoleNameToDelete] = useState<string>('');

  useEffect(() => {
    fetchRoles();
    setShowModal(false);
    setShowDeleteModal(false);
  }, []);

  const fetchRoles = async () => {
    const data = await getRoles();
    setRoles(data);
  };

  const handleCreateOrUpdateRole = async () => {
    if (!name || selectedPermissions.length === 0) {
      setErrorMessage('Please enter role name and select permissions');
      return;
    }

    const permissionsToSave = selectedPermissions.filter(
      p => p !== permissionsMap.all
    );

    try {
      if (isEditMode && editRoleId) {
        await updateRole(editRoleId, name, permissionsToSave);
      } else {
        await createRole(name, permissionsToSave);
      }
      setName('');
      setSelectedPermissions([]);
      setShowModal(false);
      setIsEditMode(false);
      setEditRoleId(null);
      setErrorMessage('');
      fetchRoles();
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  const handleEditClick = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setName(role.name);
      setSelectedPermissions(role.permissions);
      setIsEditMode(true);
      setEditRoleId(role._id);
      setShowModal(true);
    }
  };

  const handleDeleteClick = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setRoleToDelete(roleId);
      setRoleNameToDelete(role.name);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      await deleteRole(roleToDelete);
      fetchRoles();
      setShowDeleteModal(false);
      setRoleToDelete(null);
    }
  };

  const togglePermission = (code: number) => {
    setSelectedPermissions(prev => {
      let updated = [...prev];

      if (code === permissionsMap.all) {
        if (prev.includes(code)) {
          updated = [];
        } else {
          updated = [
            permissionsMap.user_management,
            permissionsMap.task_management,
            permissionsMap.role_management,
            permissionsMap.all
          ];
        }
      } else {
        if (updated.includes(code)) {
          updated = updated.filter(p => p !== code);
        } else {
          updated.push(code);
        }

        const individualPermissions = [
          permissionsMap.user_management,
          permissionsMap.task_management,
          permissionsMap.role_management
        ];
        const allSelected = individualPermissions.every(p => updated.includes(p));

        if (allSelected && !updated.includes(permissionsMap.all)) {
          updated.push(permissionsMap.all);
        } else if (!allSelected) {
          updated = updated.filter(p => p !== permissionsMap.all);
        }
      }

      return updated;
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Role Management</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Add Role
        </button>
      </div>

      {/* Modals */}
      {showModal && (
        <RoleModal
          isEditMode={isEditMode}
          name={name}
          selectedPermissions={selectedPermissions}
          errorMessage={errorMessage}
          onClose={() => setShowModal(false)}
          onSave={handleCreateOrUpdateRole}
          onNameChange={setName}
          onTogglePermission={togglePermission}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          roleName={roleNameToDelete}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Role List */}
      <RoleList roles={roles} onEdit={handleEditClick} onDelete={handleDeleteClick} />
    </div>
  );
};

export default RoleManagementPage;
