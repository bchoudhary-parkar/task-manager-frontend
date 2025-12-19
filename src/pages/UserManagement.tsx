import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type User } from '../types/user.types.ts';
import { fetchUsers, deleteUserApi, addUserApi, updateUserApi } from '../api/userApi.js';
import UserTable from '../components/user/UserTable';
import UserDetailsModal from '../components/user/UserDetailsModal';
import AddUserModal from '../components/user/AddUserModal.js';
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout.tsx';
import { Trash2 } from 'lucide-react';

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  
  // Changed from single user to array to support bulk delete
  const [usersToDelete, setUsersToDelete] = useState<User[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetchUsers(currentPage, limit, searchTerm); 
      setUsers(response.data);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error("Failed to fetch users.");
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    loadUsers(); 
    setSelectedUserIds([]); // Clear selection when page or search changes
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => user._id !== currentUser?._id);
  }, [users, currentUser]);

  // Selection handlers
  const handleSelectUser = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(filteredUsers.map(u => u._id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleDeleteUser = (id: string) => {
    const user = users.find(u => u._id === id);
    if (user) {
      setUsersToDelete([user]);
    }
  };

  const handleBulkDeleteTrigger = () => {
    const selectedUsers = users.filter(u => selectedUserIds.includes(u._id));
    setUsersToDelete(selectedUsers);
  };

  const confirmDelete = async () => {
    if (usersToDelete.length === 0) return;
    setIsDeleting(true);
    const loadingToastId = toast.loading(`Deleting ${usersToDelete.length} user(s)...`);

    try {
      // Execute all deletions (single or bulk)
      await Promise.all(usersToDelete.map(u => deleteUserApi(u._id)));
      
      toast.update(loadingToastId, {
        render: `${usersToDelete.length > 1 ? 'Users' : 'User'} deleted successfully`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      setUsersToDelete([]);
      setSelectedUserIds([]);
      loadUsers();
    } catch (error: any) {
      toast.update(loadingToastId, {
        render: error.response?.data?.message || 'Failed to delete user(s)',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const loadingToastId = toast.loading('Updating user...');
    try {
      const updatedUserFromServer = await updateUserApi(id, updates);
      setUsers(prevUsers => prevUsers.map(user => user._id === id ? updatedUserFromServer : user));
      if (selectedUser?._id === id) setSelectedUser(updatedUserFromServer);
      toast.update(loadingToastId, { render: 'User updated successfully', type: 'success', isLoading: false, autoClose: 3000 });
    } catch (error: any) {
      toast.update(loadingToastId, { render: 'Failed to update user', type: 'error', isLoading: false, autoClose: 3000 });
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <div className="">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition shadow-md"
          >
            Add User
          </button>
        </header>
        
        <div className="flex gap-4 mb-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="border p-2.5 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); 
              }}
            />
          </div>

          {/* Bulk Delete Button appears on right of search bar */}
          {selectedUserIds.length > 0 && (
            <button
              onClick={handleBulkDeleteTrigger}
              className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg hover:bg-red-100 transition font-semibold"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedUserIds.length})
            </button>
          )}
        </div>

        <UserTable 
          users={filteredUsers} 
          deleteUser={handleDeleteUser} 
          openDetails={setSelectedUser} 
          updateUser={handleUpdateUser}
          selectedUserIds={selectedUserIds}
          onSelectUser={handleSelectUser}
          onSelectAll={handleSelectAll}
        />
        
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>

        {selectedUser && (
          <UserDetailsModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            updateUser={handleUpdateUser} 
          />
        )}
        
        {isAddModalOpen && (
          <AddUserModal onClose={() => setIsAddModalOpen(false)} addUser={async (u) => { await addUserApi(u); setIsAddModalOpen(false); loadUsers(); }} />
        )}

        <DeleteConfirmationModal
          isOpen={usersToDelete.length > 0}
          onClose={() => setUsersToDelete([])}
          onConfirm={confirmDelete}
          title={usersToDelete.length > 1 ? "Bulk Delete Users" : "Delete User"}
          message={usersToDelete.length > 1 
            ? `Are you sure you want to delete these ${usersToDelete.length} users? This action cannot be undone.` 
            : `Are you sure you want to delete the user "${usersToDelete[0]?.name}"? This action cannot be undone.`}
          itemNames={usersToDelete.map(u => u.name)}
          isDeleting={isDeleting}
          entityType="user"
        />
      </div>
    </DashboardLayout>
  );
}

export default UserManagementPage;