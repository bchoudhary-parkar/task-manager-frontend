// src/pages/RoleManagementPage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roleApi';
import RoleModal from '../components/role/RoleModal';
import RoleInfoModal from '../components/role/RoleInfoModal';
import RoleList from '../components/role/RoleList';
import SearchWithActions from '../components/common/SearchWithActions';
import SimplePagination from '../components/common/SimplePagination';
import { permissionsMap } from './../utils/permissions';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { useDebounce } from '../hooks/useDebounce';
import { Trash2 } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const RoleManagementPage: React.FC = () => {
  // Role data
  const [roles, setRoles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete states
  const [rolesToDelete, setRolesToDelete] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Info modal state
  const [selectedRoleForInfo, setSelectedRoleForInfo] = useState<any>(null);

  // Checkbox selection
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term to reduce API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch roles - using useCallback like UserManagement
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getRoles({
        search: debouncedSearchTerm,
        page: currentPage,
        limit: limit,
        sortBy: 'createdAt',
        sortOrder: 'asc'
      });

      if (data) {
        setRoles(data.data || []);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error(error);
        toast.error(error || 'Failed to fetch roles');
        setRoles([]);
      }
    } catch (error: any) {
      console.error('Error fetching roles:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, debouncedSearchTerm]);

  // Fetch when dependencies change
  useEffect(() => {
    fetchRoles();
    setSelectedRoleIds([]); // Clear selection when page or search changes
  }, [fetchRoles]);

  // Form Handlers
  const resetFormState = useCallback(() => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsEditMode(false);
    setEditRoleId(null);
    setErrorMessage('');
  }, []);

  const handleCreateOrUpdateRole = useCallback(async () => {
    if (!name || selectedPermissions.length === 0) {
      setErrorMessage('Please enter role name and select permissions');
      toast.error('Please enter role name and select permissions');
      return;
    }

    const permissionsToSave = selectedPermissions.filter(p => p !== permissionsMap.all);

    const loadingToastId = toast.loading(
      isEditMode ? 'Updating role...' : 'Creating role...'
    );

    try {
      const { error } = isEditMode && editRoleId
        ? await updateRole(editRoleId, name, description, permissionsToSave)
        : await createRole(name, description, permissionsToSave);

      if (error) {
        setErrorMessage(error);
        toast.update(loadingToastId, {
          render: error,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      resetFormState();
      setShowModal(false);
      
      toast.update(loadingToastId, {
        render: isEditMode ? 'Role updated successfully' : 'Role created successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      fetchRoles();
    } catch (error: any) {
      toast.update(loadingToastId, {
        render: error.response?.data?.message || 'Failed to save role',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [name, selectedPermissions, isEditMode, editRoleId, description, resetFormState, fetchRoles]);

  const togglePermission = useCallback((code: number) => {
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
  }, []);

  // Role Actions
  const handleEditClick = useCallback((roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions);
      setIsEditMode(true);
      setEditRoleId(role._id);
      setShowModal(true);
    }
  }, [roles]);

  const handleInfoClick = useCallback((roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setSelectedRoleForInfo(role);
      setShowInfoModal(true);
    }
  }, [roles]);

  const handleDeleteRole = useCallback((roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setRolesToDelete([role]);
    }
  }, [roles]);

  const handleBulkDeleteTrigger = useCallback(() => {
    const selectedRoles = roles.filter(r => selectedRoleIds.includes(r._id));
    setRolesToDelete(selectedRoles);
  }, [roles, selectedRoleIds]);

  const confirmDelete = useCallback(async () => {
    if (rolesToDelete.length === 0) return;

    setIsDeleting(true);
    const loadingToastId = toast.loading(`Deleting ${rolesToDelete.length} role(s)...`);

    try {
      await Promise.all(rolesToDelete.map(r => deleteRole(r._id)));
      
      toast.update(loadingToastId, {
        render: `${rolesToDelete.length > 1 ? 'Roles' : 'Role'} deleted successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      setRolesToDelete([]);
      setSelectedRoleIds([]);
      fetchRoles();
    } catch (error: any) {
      toast.update(loadingToastId, {
        render: error.response?.data?.message || 'Failed to delete role(s)',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  }, [rolesToDelete, fetchRoles]);

  // Selection Handlers
  const handleSelectRole = useCallback((roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRoleIds(roles.map(role => role._id));
    } else {
      setSelectedRoleIds([]);
    }
  }, [roles]);

  // Modal Handlers
  const handleModalClose = useCallback(() => {
    resetFormState();
    setShowModal(false);
  }, [resetFormState]);

  const handleAddRoleClick = useCallback(() => {
    resetFormState();
    setShowModal(true);
  }, [resetFormState]);

  const handleInfoModalClose = useCallback(() => {
    setShowInfoModal(false);
    setSelectedRoleForInfo(null);
  }, []);

  // Pagination Handlers
  const handlePageChange = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Loading State
  if (loading && roles.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading roles...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Role Management</h1>
          <button
            onClick={handleAddRoleClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
          >
            Add Role
          </button>
        </header>

        {/* Search with Bulk Actions */}
        <SearchWithActions
          searchTerm={searchTerm}
          placeholder="Search roles by name..."
          onSearchChange={handleSearchChange}
          bulkActionButton={
            selectedRoleIds.length > 0 ? (
              <button
                onClick={handleBulkDeleteTrigger}
                className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                <Trash2 size={18} />
                Delete Selected ({selectedRoleIds.length})
              </button>
            ) : undefined
          }
        />

        {/* Roles List */}
        {roles.length > 0 ? (
          <RoleList
            roles={roles}
            selectedRoleIds={selectedRoleIds}
            onEdit={handleEditClick}
            onDelete={handleDeleteRole}
            onSelectRole={handleSelectRole}
            onSelectAll={handleSelectAll}
            onInfo={handleInfoClick}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No roles found matching your search' : 'No roles available'}
            </p>
          </div>
        )}

        {/* Pagination */}
        <SimplePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Modals */}
        {showModal && (
          <RoleModal
            isEditMode={isEditMode}
            name={name}
            description={description}
            selectedPermissions={selectedPermissions}
            errorMessage={errorMessage}
            onClose={handleModalClose}
            onSave={handleCreateOrUpdateRole}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTogglePermission={togglePermission}
          />
        )}

        {showInfoModal && selectedRoleForInfo && (
          <RoleInfoModal
            role={selectedRoleForInfo}
            onClose={handleInfoModalClose}
          />
        )}

        <DeleteConfirmationModal
          isOpen={rolesToDelete.length > 0}
          onClose={() => setRolesToDelete([])}
          onConfirm={confirmDelete}
          title={rolesToDelete.length > 1 ? "Bulk Delete Roles" : "Delete Role"}
          message={
            rolesToDelete.length > 1
              ? `Are you sure you want to delete these ${rolesToDelete.length} roles? This action cannot be undone.`
              : `Are you sure you want to delete the role "${rolesToDelete[0]?.name}"? This action cannot be undone.`
          }
          itemNames={rolesToDelete.map(r => r.name)}
          isDeleting={isDeleting}
          entityType="role"
        />
      </div>
    </DashboardLayout>
  );
};

export default RoleManagementPage;