import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type User } from '../types/user.types.ts';
import { fetchUsers, deleteUserApi, addUserApi, updateUserApi } from '../api/userApi.js';
import UserTable from '../components/user/UserTable';
import UserDetailsModal from '../components/user/UserDetailsModal';
import AddUserModal from '../components/user/AddUserModal.js';
import DeleteConfirmModal from '../components//user/DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout.tsx';
function UserManagementPage() {
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10); // Users per page (fixed limit for simplicity)

  // Make loadUsers a useCallback so it can be used within useEffect dependencies easily
  const loadUsers = useCallback(async () => {
    try {
        // Pass pagination and search terms to the API call
        const response = await fetchUsers(currentPage, limit, searchTerm); 
        
        setUsers(response.data);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        
    } catch (error) {
        toast.error("Failed to fetch users.");
        console.error("Error loading users:", error);
    }
  }, [currentPage, limit, searchTerm]); // Depend on pagination state and search term

  // Effect hook runs whenever loadUsers callback changes (which happens when dependencies change)
  useEffect(() => {
    loadUsers(); 
  }, [loadUsers]);

  // We only filter the current user out on the client side, backend handles search now.
  const filteredUsers = useMemo(() => {
    return users.filter(user => user._id !== currentUser?._id);
  }, [users, currentUser]);

  const handleDeleteUser = async (id: string) => {
    setUserToDelete(id);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
        await deleteUserApi(userToDelete);
        toast.success("User deleted successfully.");
        setUserToDelete(null);
        // After deletion, reload users to refresh pagination count/display
        loadUsers(); 
    }
  };

  const handleAddUser = async (userData: any) => {
    // const newUser = await addUserApi(userData); // Removed direct state manipulation
    await addUserApi(userData);
    toast.success("Member added successfully");
    setIsAddModalOpen(false);
    // After adding a user, reload users to integrate the new user into the list/pagination
    loadUsers(); 
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
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
        toast.success("User updated successfully.");

    } catch (error) {
        console.error("Failed to update user:", error);
        toast.error("Failed to update user.");
        loadUsers(); 
    }
  };

  // Pagination Handler
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
          // When search term changes, reset to page 1
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
      
      {/* Pagination Controls UI (Minimal Tailwind implementation) */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>


      {/* Modals remain below */}
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

      {userToDelete && (
        <DeleteConfirmModal
          onClose={() => setUserToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
    </DashboardLayout>
  );
}

export default UserManagementPage;