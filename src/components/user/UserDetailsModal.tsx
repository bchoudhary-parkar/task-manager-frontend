import React, { useState, useEffect } from 'react';
import  { type User } from '../../types/user.types';

interface UserDetailsModalProps {
    user: User;
    onClose: () => void;
    updateUser: (id: string, updates: Partial<User>) => void;
}

function UserDetailsModal({ user, onClose, updateUser }: UserDetailsModalProps) {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({ name: user.name, email: user.email });

    useEffect(() => {
        setFormData({ name: user.name, email: user.email });
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        updateUser(user._id, formData);
        setEditMode(false);
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">User Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl hover:cursor-pointer">&times;</button>
                </div>
                <div className="flex flex-col items-center">
                    <img src={user.photoUrl || `ui-avatars.com{user.name}&background=random`} alt={user.name} className="w-32 h-32 rounded-full mb-4 object-cover" />                    
                    {editMode ? (
                        <>
                            <input name="name" value={formData.name} onChange={handleChange} className="border p-2 mb-2 w-full" />
                            <input name="email" value={formData.email} onChange={handleChange} className="border p-2 mb-4 w-full" />
                        </>
                    ) : (
                        <>
                            <p className="text-lg font-semibold">{user.name}</p>
                            <p className="text-gray-600 mb-4">{user.email}</p>
                        </>
                    )}
                    {/* FIX: Access the name property of the role object */}
                    <p className="text-sm">Role: **{user.role?.name}**</p> 
                    <p className={`text-sm mb-4 ${user.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>Status: **{user.status}**</p>
                    {editMode ? (
                        <button onClick={handleSave} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">Save Changes</button>
                    ) : (
                        <button onClick={() => setEditMode(true)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Edit Details</button>
                    )}
                </div>
            </div>
        </div>
    );
}
export default UserDetailsModal;