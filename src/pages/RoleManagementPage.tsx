import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roleApi';
import RoleModal from '../components/role/RoleModal';
import RoleInfoModal from '../components/role/RoleInfoModal';
import RoleList from '../components/role/RoleList';
import SearchFilterBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { permissionsMap } from './../utils/permissions';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { FaTrash } from 'react-icons/fa';
import { useDebounce } from '../hooks/useDebounce';
import DashboardLayout from '../layouts/DashboardLayout';

const RoleManagementPage: React.FC = () => {
  // Role data
  const [roles, setRoles] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Delete states
  const [roleToDelete, setRoleToDelete] = useState<string[]>([]);
  const [roleNamesToDelete, setRoleNamesToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Info modal state
  const [selectedRoleForInfo, setSelectedRoleForInfo] = useState<any>(null);

  // Checkbox selection
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [loading, setLoading] = useState(false);

  // Debounce search term
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch roles when debounced search or page changes
  useEffect(() => {
    fetchRoles();
  }, [debouncedSearch, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // API Calls
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await getRoles({
        search: debouncedSearch,
        page: currentPage,
        limit: limit,
        sortBy: 'createdAt',
        sortOrder: 'asc'
      });

      if (data) {
        setRoles(data.data || []);
        setPagination(data.pagination);
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
      setSelectedRoleIds([]);
    }
  };

  // Form Handlers
  const resetFormState = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsEditMode(false);
    setEditRoleId(null);
    setErrorMessage('');
  };

  const handleCreateOrUpdateRole = async () => {
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
      setDescription(role.description || '');
      setSelectedPermissions(role.permissions);
      setIsEditMode(true);
      setEditRoleId(role._id);
      setShowModal(true);
    }
  };

  const handleInfoClick = (roleId: string) => {
    const role = roles.find(r => r._id === roleId);
    if (role) {
      setSelectedRoleForInfo(role);
      setShowInfoModal(true);
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
    if (roleToDelete.length === 0) return;

    setIsDeleting(true);

    try {
      const deletePromises = roleToDelete.map(id => deleteRole(id));
      const results = await Promise.all(deletePromises);
      
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        toast.error(`Failed to delete ${errors.length} role(s)`);
      } else {
        toast.success(
          roleToDelete.length === 1 
            ? 'Role deleted successfully' 
            : `${roleToDelete.length} roles deleted successfully`
        );
      }
      
      // Calculate if we need to go to previous page
      const remainingRolesOnCurrentPage = roles.length - roleToDelete.length;
      const shouldGoToPreviousPage = (remainingRolesOnCurrentPage === 0 && currentPage > 1);
      
      // Update page before fetching
      if (shouldGoToPreviousPage) {
        setCurrentPage(currentPage - 1);
      } else {
        // Just refresh current page
        fetchRoles();
      }
      
      setShowDeleteModal(false);
      setRoleToDelete([]);
      setRoleNamesToDelete([]);
      setSelectedRoleIds([]);
    } catch (error: any) {
      console.error('Error deleting roles:', error);
      toast.error(error.response?.data?.message || 'Failed to delete roles');
    } finally {
      setIsDeleting(false);
    }
  };

  // Selection Handlers
  const handleSelectRole = (roleId: string) => {
    setSelectedRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSelectAll = () => {
    const allSelected = roles.length > 0 && selectedRoleIds.length === roles.length;
    
    if (allSelected) {
      setSelectedRoleIds([]);
    } else {
      setSelectedRoleIds(roles.map(role => role._id));
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
    setCurrentPage(1);
    toast.success('Filters cleared');
  };

  // Pagination Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
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
      <div className="bg-gray-50 ">
        {/* Header */}
        <div className="flex justify-between items-center m-2">
          <h2 className="text-2xl font-bold text-gray-800">Role Management</h2>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleAddRoleClick}
          >
            + Add Role
          </button>
        </div>

        {/* Search Bar */}
        <SearchFilterBar
          searchTerm={searchTerm}
          resultCount={pagination.totalItems}
          onSearchChange={setSearchTerm}
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
            onClose={() => {
              setShowInfoModal(false);
              setSelectedRoleForInfo(null);
            }}
          />
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title={roleNamesToDelete.length > 1 ? 'Delete Multiple Roles?' : 'Delete Role?'}
          message={
            roleNamesToDelete.length > 1
              ? `Are you sure you want to delete ${roleNamesToDelete.length} roles? This action cannot be undone.`
              : 'Are you sure you want to delete this role? This action cannot be undone.'
          }
          itemNames={roleNamesToDelete}
          isDeleting={isDeleting}
          entityType="role"
        />

        {/* Roles List */}
        {roles.length > 0 ? (
          <>
            <RoleList
              roles={roles}
              selectedRoleIds={selectedRoleIds}
              onEdit={handleEditClick}
              onSelectRole={handleSelectRole}
              onSelectAll={handleSelectAll}
              onInfo={handleInfoClick}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No roles found matching your search' : 'No roles available'}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RoleManagementPage;