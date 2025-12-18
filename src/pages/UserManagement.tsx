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

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetchUsers(currentPage, limit, searchTerm); 
      
      setUsers(response.data);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      
    } catch (error) {
      toast.error("Failed to fetch users.");
      console.error("Error loading users:", error);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    loadUsers(); 
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => user._id !== currentUser?._id);
  }, [users, currentUser]);

  const handleDeleteUser = async (id: string) => {
    const user = users.find(u => u._id === id);
    if (user) {
      setUserToDelete(user);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      await deleteUserApi(userToDelete._id);
      toast.success("User deleted successfully");
      setUserToDelete(null);
      loadUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const handleAddUser = async (userData: any) => {
    const loadingToastId = toast.loading('Creating user...');

    try {
      await addUserApi(userData);
      setIsAddModalOpen(false);
      
      toast.update(loadingToastId, {
        render: 'User created successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });

      loadUsers();
    } catch (error: any) {
      toast.update(loadingToastId, {
        render: error.response?.data?.message || 'Failed to create user',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    const loadingToastId = toast.loading('Updating user...');

    try {
      const updatedUserFromServer = await updateUserApi(id, updates);
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === id ? updatedUserFromServer : user
        )
      );

      if (selectedUser && selectedUser._id === id) {
        setSelectedUser(updatedUserFromServer); 
      }

      toast.update(loadingToastId, {
        render: 'User updated successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error: any) {
      console.error("Failed to update user:", error);
      
      toast.update(loadingToastId, {
        render: error.response?.data?.message || 'Failed to update user',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });

      loadUsers();
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Add User
          </button>
        </header>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="border p-2 w-full rounded shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
          />
        </div>

        <UserTable 
          users={filteredUsers} 
          deleteUser={handleDeleteUser} 
          openDetails={setSelectedUser} 
          updateUser={handleUpdateUser} 
        />
        
        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>

        {/* Modals */}
        {selectedUser && (
          <UserDetailsModal 
            user={selectedUser} 
            onClose={() => setSelectedUser(null)} 
            updateUser={handleUpdateUser} 
          />
        )}
        
        {isAddModalOpen && (
          <AddUserModal 
            onClose={() => setIsAddModalOpen(false)} 
            addUser={handleAddUser} 
          />
        )}

        <DeleteConfirmationModal
          isOpen={!!userToDelete}
          onClose={handleCancelDelete}
          onConfirm={confirmDelete}
          title="Delete User?"
          message={`Are you sure you want to delete the user "${userToDelete?.name}"? This action cannot be undone.`}
          itemNames={userToDelete ? [userToDelete.name] : []}
          isDeleting={isDeleting}
          entityType="user"
        />
      </div>
    </DashboardLayout>
  );
}

export default UserManagementPage;