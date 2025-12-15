import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { toast } from 'react-toastify';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: 'available' | 'not available';
    photoUrl?: string;
}


interface AddUserModalProps {
    onClose: () => void;
    addUser: (userData: Omit<User, '_id'> & { password: string }) => void;
}

function AddUserModal({ onClose, addUser }: AddUserModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as string,
        status: 'available' as 'available' | 'not available',
        photoUrl: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        password: '',
        photoUrl: '',
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    /**
     * Validates form data against a set of rules and updates the errors state.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', email: '', password: '', photoUrl: '' };

        // ## Name Validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required.';
            isValid = false;
        } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
            newErrors.name = 'Name must be between 2 and 50 characters.';
            isValid = false;
        }

        // ## Email Validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required.';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format.';
            isValid = false;
        }

        // ## Password Validation (Strong requirements)
        if (!formData.password) {
            newErrors.password = 'Password is required.';
            isValid = false;
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters.';
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = 'Must contain uppercase, lowercase, number, and special character.';
            isValid = false;
        }

        // ## Photo URL Validation (Optional field, validate only if present)
        if (formData.photoUrl.trim() && !/^https?:\/\/.+/.test(formData.photoUrl)) {
             newErrors.photoUrl = 'Invalid URL format (must start with http:// or https://).';
             isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // Only call the parent's addUser function if validation passes
        if (validateForm()) {
            addUser(formData);
            toast.success("Member added successfully");
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New User</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none hover:cursor-pointer">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className={`border p-2 w-full rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    
                    {/* Email Input Group */}
                    <div>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className={`border p-2 w-full rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Password Input Group */}
                    <div>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required className={`border p-2 w-full rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    
                    {/* Photo URL Input Group */}
                    <div>
                        <input name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="Photo URL (Optional)" className={`border p-2 w-full rounded ${errors.photoUrl ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.photoUrl && <p className="text-red-500 text-xs mt-1">{errors.photoUrl}</p>}
                    </div>

                    {/* Role Selection */}
                    <select name="role" value={formData.role} onChange={handleChange} className="border p-2 w-full rounded border-gray-300">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    {/* Status Selection */}
                    <select name="status" value={formData.status} onChange={handleChange} className="border p-2 w-full rounded border-gray-300">
                        <option value="available">Available</option>
                        <option value="not available">Not Available</option>
                    </select>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancel</button>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add User</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUserModal;