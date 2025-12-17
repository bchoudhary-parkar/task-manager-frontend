import React, { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';
import { getAllRoles } from '../../api/roleApi';
import type { Role } from '../../types/role.types';

interface AddUserModalProps {
    onClose: () => void;
    addUser: (userData: any) => Promise<void>;
}

function AddUserModal({ onClose, addUser }: AddUserModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '', 
        status: 'available' as 'available' | 'not available',
        picture: '',
    });

    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        picture: '',
    });

    // Load roles on component mount
    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            setIsLoadingRoles(true);
            const { data, error } = await getAllRoles();
            
            if (error) {
                console.error('Failed to load roles:', error);
                toast.error('Failed to load roles. You can still create user without role.');
            } else if (data) {
                console.log('Roles loaded:', data);
                setRoles(data);
            }
        } catch (err) {
            console.error('Error loading roles:', err);
            toast.error('Failed to load roles');
        } finally {
            setIsLoadingRoles(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', email: '', password: '', picture: '' };

        // Name Validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
            isValid = false;
        } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
            newErrors.name = 'Name must be between 2 and 50 characters.';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format.';
            isValid = false;
        }

        // Password Validation
        if (!formData.password) {
            newErrors.password = 'Password is required.';
            isValid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        // Photo URL Validation (Optional)
        if (formData.picture.trim() && !/^https?:\/\/.+/.test(formData.picture)) {
            newErrors.picture = 'Invalid URL format (must start with http:// or https://).';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data - send null if no role selected
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                status: formData.status,
                role: formData.role === '' ? null : formData.role, // ✅ Convert empty string to null
                picture: formData.picture.trim() || undefined,
            };

            console.log('Submitting user data:', userData);
            
            await addUser(userData);
            toast.success("User added successfully");
            onClose();
        } catch (error: any) {
            console.error('Error adding user:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to add user');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New User</h2>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700 text-2xl leading-none hover:cursor-pointer"
                    >
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="John Doe" 
                            className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    
                    {/* Email Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            placeholder="john@example.com" 
                            className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Password *</label>
                        <input 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="Min 6 characters" 
                            className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    
                    {/* Photo URL Input */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Photo URL (Optional)</label>
                        <input 
                            name="picture" 
                            value={formData.picture} 
                            onChange={handleChange} 
                            placeholder="https://example.com/photo.jpg" 
                            className={`border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.picture ? 'border-red-500' : 'border-gray-300'}`} 
                        />
                        {errors.picture && <p className="text-red-500 text-xs mt-1">{errors.picture}</p>}
                    </div>

                    {/* Role Selection - ✅ FIXED */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Role {isLoadingRoles && <span className="text-xs text-gray-500">(Loading...)</span>}
                        </label>
                        <select 
                            name="role" 
                            value={formData.role} 
                            onChange={handleChange} 
                            disabled={isLoadingRoles}
                            className="border p-2 w-full rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                            <option value="">No Role</option>
                            {roles.map((role) => (
                                <option key={role._id} value={role._id}>
                                    {role.name}
                                </option>
                            ))}
                        </select>
                        {roles.length === 0 && !isLoadingRoles && (
                            <p className="text-xs text-gray-500 mt-1">
                                No roles available. User will be created without a role.
                            </p>
                        )}
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select 
                            name="status" 
                            value={formData.status} 
                            onChange={handleChange} 
                            className="border p-2 w-full rounded border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="available">Available</option>
                            <option value="not available">Not Available</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || isLoadingRoles}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                        >
                            {isSubmitting ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUserModal;