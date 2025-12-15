import React, { useEffect, useState } from 'react';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roleApi';
import RoleModal from '../components/role/RoleModal';
import RoleInfoModal from '../components/role/RoleInfoModal';
import RoleList from '../components/role/RoleList';
import SearchFilterBar from '../components/common/SearchBar';
import Pagination from '../components/common/Pagination';
import { permissionsMap } from './../utils/permissions';
import DeleteConfirmationModal from '../components/role/DeleteConfirmationModal';
import { FaTrash } from 'react-icons/fa';
import { useDebounce } from '../hooks/useDebounce';

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

  // Info modal state
  const [selectedRoleForInfo, setSelectedRoleForInfo] = useState<any>(null);

  // Checkbox selection
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  // Search and pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
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
    setLoading(true);
    const { data, error } = await getRoles({
      search: debouncedSearch,
      page: currentPage,
      limit: limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (data) {
      setRoles(data.data || []);
      setPagination(data.pagination);
    } else {
      console.error(error);
    }
    setLoading(false);
    setSelectedRoleIds([]);
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
      return;
    }

    const permissionsToSave = selectedPermissions.filter(p => p !== permissionsMap.all);

    const { error } = isEditMode && editRoleId
      ? await updateRole(editRoleId, name, description, permissionsToSave)
      : await createRole(name, description, permissionsToSave);

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
  if (roleToDelete.length > 0) {
    const deletePromises = roleToDelete.map(id => deleteRole(id));
    const results = await Promise.all(deletePromises);
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      setErrorMessage(`Failed to delete ${errors.length} role(s)`);
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
  };

  // Pagination Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

      {showDeleteModal && (
        <DeleteConfirmationModal
          roleNames={roleNamesToDelete}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-500 text-lg">Loading...</p>
        </div>
      ) : roles.length > 0 ? (
        <>
          <RoleList
            roles={roles}
            selectedRoleIds={selectedRoleIds}
            onEdit={handleEditClick}
            onDelete={(id) => handleDeleteClick([id])}
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
  );
};

export default RoleManagementPage;