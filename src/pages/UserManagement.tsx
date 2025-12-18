// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { type User } from '../types/user.types.ts';
// import { fetchUsers, deleteUserApi, addUserApi, updateUserApi } from '../api/userApi.js';
// import UserTable from '../components/user/UserTable';
// import UserDetailsModal from '../components/user/UserDetailsModal';
// import AddUserModal from '../components/user/AddUserModal.js';
// import DeleteConfirmModal from '../components//user/DeleteConfirmModal';
// import { useAuth } from '../context/AuthContext';
// import { toast } from 'react-toastify';
// import DashboardLayout from '../layouts/DashboardLayout.tsx';
// function UserManagementPage() {
  
//   const [users, setUsers] = useState<User[]>([]);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const { user: currentUser } = useAuth();
//   const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
//   // State for pagination
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [limit] = useState(10); // Users per page (fixed limit for simplicity)

//   // Make loadUsers a useCallback so it can be used within useEffect dependencies easily
//   const loadUsers = useCallback(async () => {
//     try {
//         // Pass pagination and search terms to the API call
//         const response = await fetchUsers(currentPage, limit, searchTerm); 
        
//         setUsers(response.data);
//         setCurrentPage(response.currentPage);
//         setTotalPages(response.totalPages);
        
//     } catch (error) {
//         toast.error("Failed to fetch users.");
//         console.error("Error loading users:", error);
//     }
//   }, [currentPage, limit, searchTerm]); // Depend on pagination state and search term

//   // Effect hook runs whenever loadUsers callback changes (which happens when dependencies change)
//   useEffect(() => {
//     loadUsers(); 
//   }, [loadUsers]);

//   // We only filter the current user out on the client side, backend handles search now.
//   const filteredUsers = useMemo(() => {
//     return users.filter(user => user._id !== currentUser?._id);
//   }, [users, currentUser]);

//   const handleDeleteUser = async (id: string) => {
//     setUserToDelete(id);
//   };

//   const confirmDelete = async () => {
//     if (userToDelete) {
//         await deleteUserApi(userToDelete);
//         toast.success("User deleted successfully.");
//         setUserToDelete(null);
//         // After deletion, reload users to refresh pagination count/display
//         loadUsers(); 
//     }
//   };

//   const handleAddUser = async (userData: any) => {
//     await addUserApi(userData);
//     setIsAddModalOpen(false);
//     loadUsers(); 
//   };

//   const handleUpdateUser = async (id: string, updates: Partial<User>) => {
//     try {
//         const updatedUserFromServer = await updateUserApi(id, updates);
        
//         setUsers(prevUsers => 
//           prevUsers.map(user => 
//             user._id === id ? updatedUserFromServer : user
//           )
//         );

//         if (selectedUser && selectedUser._id === id) {
//             setSelectedUser(updatedUserFromServer); 
//         }
//         toast.success("User updated successfully.");

//     } catch (error) {
//         console.error("Failed to update user:", error);
//         toast.error("Failed to update user.");
//         loadUsers(); 
//     }
//   };

//   // Pagination Handler
//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//         setCurrentPage(page);
//     }
//   };

//   return (
//     <DashboardLayout>
//     <div className="p-8">
//       <header className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">User Management</h1>
//         <button
//           onClick={() => setIsAddModalOpen(true)}
//           className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Add User
//         </button>
//       </header>
      
//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search users by name or email..."
//           className="border p-2 w-full rounded shadow-sm"
//           value={searchTerm}
//           // When search term changes, reset to page 1
//           onChange={(e) => {
//             setSearchTerm(e.target.value);
//             setCurrentPage(1); 
//           }}
//         />
//       </div>

//       <UserTable 
//         users={filteredUsers} 
//         deleteUser={handleDeleteUser} 
//         openDetails={setSelectedUser} 
//         updateUser={handleUpdateUser} 
//       />
      
//       {/* Pagination Controls UI (Minimal Tailwind implementation) */}
//       <div className="flex justify-between items-center mt-6">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
//         >
//           Previous
//         </button>
//         <span>Page {currentPage} of {totalPages}</span>
//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>


//       {/* Modals remain below */}
//       {selectedUser && (
//         <UserDetailsModal 
//           user={selectedUser} 
//           onClose={() => setSelectedUser(null)} 
//           updateUser={handleUpdateUser} 
//         />
//       )}
      
//       {isAddModalOpen && (
//         <AddUserModal 
//           onClose={() => setIsAddModalOpen(false)} 
//           addUser={handleAddUser} 
//         />
//       )}
//       {userToDelete && (
//         <DeleteConfirmModal
//           onClose={() => setUserToDelete(null)}
//           onConfirm={confirmDelete}
//         />
//       )}
//     </div>
//     </DashboardLayout>
//   );
// }

// export default UserManagementPage;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { type User } from '../types/user.types.ts';
import { fetchUsers, deleteUserApi, addUserApi, updateUserApi } from '../api/userApi.js';
import UserTable from '../components/user/UserTable';
import UserDetailsModal from '../components/user/UserDetailsModal';
import AddUserModal from '../components/user/AddUserModal.js';
import DeleteConfirmModal from '../components/user/DeleteConfirmModal';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout.tsx';
import { FaTrash } from 'react-icons/fa';

function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user: currentUser } = useAuth();
  
  // Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const loadUsers = useCallback(async () => {
    try {
        const response = await fetchUsers(currentPage, limit, searchTerm); 
        setUsers(response.data);
        setCurrentPage(response.currentPage);
        setTotalPages(response.totalPages);
        // Clear selection when data reloads (optional, but safer)
        setSelectedUserIds([]);
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

  // Checkbox Handlers
  const handleToggleSelect = (id: string) => {
    setSelectedUserIds(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (currentPageIds: string[]) => {
    const allOnPageAreSelected = currentPageIds.every(id => selectedUserIds.includes(id));
    if (allOnPageAreSelected) {
      setSelectedUserIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedUserIds(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
    setIsBulkDeleteMode(false);
  };

  const handleBulkDeleteTrigger = () => {
    setIsBulkDeleteMode(true);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    try {
        if (isBulkDeleteMode) {
            // Bulk Delete
            await Promise.all(selectedUserIds.map(id => deleteUserApi(id)));
            toast.success(`${selectedUserIds.length} users deleted successfully.`);
            setSelectedUserIds([]);
        } else if (userToDelete) {
            // Single Delete
            await deleteUserApi(userToDelete);
            toast.success("User deleted successfully.");
            setSelectedUserIds(prev => prev.filter(id => id !== userToDelete));
        }
        
        setUserToDelete(null);
        setIsBulkDeleteMode(false);
        loadUsers(); 
    } catch (error) {
        toast.error("An error occurred during deletion.");
    }
  };

  const handleAddUser = async (userData: any) => {
    await addUserApi(userData);
    setIsAddModalOpen(false);
    loadUsers(); 
  };

  const handleUpdateUser = async (id: string, updates: Partial<User>) => {
    try {
        const updatedUserFromServer = await updateUserApi(id, updates);
        setUsers(prevUsers => prevUsers.map(user => user._id === id ? updatedUserFromServer : user));
        if (selectedUser && selectedUser._id === id) setSelectedUser(updatedUserFromServer);
        toast.success("User updated successfully.");
    } catch (error) {
        toast.error("Failed to update user.");
        loadUsers(); 
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <DashboardLayout>
    <div className="p-8">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">User Management</h1>
            {selectedUserIds.length > 0 && (
                <button
                    onClick={handleBulkDeleteTrigger}
                    className="bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-md font-semibold flex items-center gap-2 transition"
                >
                    <FaTrash size={14} /> Delete ({selectedUserIds.length})
                </button>
            )}
        </div>
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
          className="border p-2 w-full rounded shadow-sm focus:ring-2 focus:ring-blue-300 outline-none"
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
        selectedUserIds={selectedUserIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
      />
      
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded disabled:opacity-50 transition"
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
        <AddUserModal 
          onClose={() => setIsAddModalOpen(false)} 
          addUser={handleAddUser} 
        />
      )}

      {(userToDelete || isBulkDeleteMode) && (
        <DeleteConfirmModal
          onClose={() => {
              setUserToDelete(null);
              setIsBulkDeleteMode(false);
          }}
          onConfirm={confirmDelete}
          title={isBulkDeleteMode ? "Confirm Bulk Deletion" : "Confirm Deletion"}
          message={isBulkDeleteMode 
            ? `Are you sure you want to delete ${selectedUserIds.length} users? This action cannot be undone.` 
            : undefined
          }
        />
      )}
    </div>
    </DashboardLayout>
  );
}

export default UserManagementPage;
