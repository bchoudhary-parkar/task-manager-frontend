import React, { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from './../services/api';
import RoleModal from './../components/role_management/RoleModal';
import RoleList from './../components/role_management/RoleList';
import SearchFilterBar from './../components/role_management/SearchFilterBar';
import { permissionsMap } from './../utils/permissions';
import DeleteConfirmationModal from '../components/role_management/DeleteConfirmationModal';
import { FaTrash } from 'react-icons/fa';

const RoleManagementPage: React.FC = () => {
  // Role data
  const [roles, setRoles] = useState<any[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<any[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete states
  const [roleToDelete, setRoleToDelete] = useState<string[]>([]);
  const [roleNamesToDelete, setRoleNamesToDelete] = useState<string[]>([]);

  // Checkbox selection
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterColumn, setFilterColumn] = useState<'all' | 'role' | 'permissions'>('all');

  // Effects
  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    applySearchAndFilter();
  }, [roles, searchTerm, filterColumn]);

  // API Calls
  const fetchRoles = async () => {
    const { data, error } = await getRoles();
    if (data) {
      setRoles(data);
    } else {
      console.error(error);
    }
    setSelectedRoleIds([]);
  };

  // Search and Filter
  const applySearchAndFilter = () => {
    if (!searchTerm.trim()) {
      setFilteredRoles(roles);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();

    const filtered = roles.filter(role => {
      const permissionNames = role.permissions
        .filter((code: number) => code !== permissionsMap.all)
        .map((code: number) => {
          const key = Object.keys(permissionsMap).find(k => permissionsMap[k] === code);
          return key ? key.replace(/_/g, ' ') : '';
        })
        .join(', ')
        .toLowerCase();

      switch (filterColumn) {
        case 'role':
          return role.name.toLowerCase().includes(lowerSearch);
        case 'permissions':
          return permissionNames.includes(lowerSearch);
        case 'all':
        default:
          return (
            role.name.toLowerCase().includes(lowerSearch) ||
            permissionNames.includes(lowerSearch)
          );
      }
    });

    setFilteredRoles(filtered);
  };

  // Form Handlers
  const resetFormState = () => {
    setName('');
    setSelectedPermissions([]);
    setIsEditMode(false);
    setEditRoleId(null);
    setErrorMessage('');
  };

  const handleCreateOrUpdateRole = async () => {
    if (!name || selectedPermissions.length === 0) {
      setErrorMessage('Please enter role name and select permissions');
      return;
    }

    const permissionsToSave = selectedPermissions.filter(p => p !== permissionsMap.all);

    const { error } = isEditMode && editRoleId
      ? await updateRole(editRoleId, name, permissionsToSave)
      : await createRole(name, permissionsToSave);

    if (error) {
      setErrorMessage(error);
      return;
    }

    resetFormState();
    setShowModal(false);
    fetchRoles();
  };

  const togglePermission = (code: number) => {
    setSelectedPermissions(prev => {
      let updated = [...prev];

      if (code === permissionsMap.all) {
        updated = prev.includes(code) ? [] : Object.values(permissionsMap);
      } else {
        updated = updated.includes(code)
          ? updated.filter(p => p !== code)
          : [...updated, code];

        const individualPermissions = Object.entries(permissionsMap)
          .filter(([key]) => key !== 'all')
          .map(([, value]) => value);

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

  // Role Actions
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

  const handleDeleteClick = (roleIds: string[]) => {
    const rolesToDelete = roles.filter(r => roleIds.includes(r._id));
    if (rolesToDelete.length > 0) {
      setRoleToDelete(roleIds);
      setRoleNamesToDelete(rolesToDelete.map(r => r.name));
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (roleToDelete.length > 0) {
      // Delete each role one by one using the existing DELETE endpoint
      const deletePromises = roleToDelete.map(id => deleteRole(id));
      const results = await Promise.all(deletePromises);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        setErrorMessage(`Failed to delete ${errors.length} role(s)`);
      }
      
      fetchRoles();
      setShowDeleteModal(false);
      setRoleToDelete([]);
      setRoleNamesToDelete([]);
      setSelectedRoleIds([]);
    }
  };

  // Selection Handlers
  const handleSelectRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    const allSelected = filteredRoles.length > 0 && selectedRoleIds.length === filteredRoles.length;
    if (allSelected) {
      // If all are selected, uncheck all
      setSelectedRoleIds([]);
    } else {
      // If not all selected, select all filtered roles
      setSelectedRoleIds(filteredRoles.map(role => role._id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedRoleIds.length > 0) {
      handleDeleteClick(selectedRoleIds);
    }
  };

  // Modal Handlers
  const handleModalClose = () => {
    resetFormState();
    setShowModal(false);
  };

  const handleAddRoleClick = () => {
    resetFormState();
    setShowModal(true);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setFilterColumn('all');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Role Management</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={handleAddRoleClick}
        >
          + Add Role
        </button>
      </div>

      {/* Search and Filter */}
      <SearchFilterBar
        searchTerm={searchTerm}
        filterColumn={filterColumn}
        resultCount={filteredRoles.length}
        totalCount={roles.length}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterColumn}
        onClear={handleSearchClear}
      />

      {/* Bulk Delete Button */}
      {selectedRoleIds.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 border border-red-300 transition font-medium flex items-center gap-2"
          >
            <FaTrash size={14} />
            Delete Selected ({selectedRoleIds.length})
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <RoleModal
          isEditMode={isEditMode}
          name={name}
          selectedPermissions={selectedPermissions}
          errorMessage={errorMessage}
          onClose={handleModalClose}
          onSave={handleCreateOrUpdateRole}
          onNameChange={setName}
          onTogglePermission={togglePermission}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmationModal
          roleNames={roleNamesToDelete}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Role List or Empty State */}
      {filteredRoles.length > 0 ? (
        <RoleList
          roles={filteredRoles}
          selectedRoleIds={selectedRoleIds}
          onEdit={handleEditClick}
          onDelete={(id) => handleDeleteClick([id])}
          onSelectRole={handleSelectRole}
          onSelectAll={handleSelectAll}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No roles found matching your search' : 'No roles available'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleManagementPage;