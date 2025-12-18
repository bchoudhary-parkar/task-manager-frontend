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
        picture: '',
    });

    useEffect(() => { loadRoles(); }, []);

    const loadRoles = async () => {
        try {
            setIsLoadingRoles(true);
            const { data } = await getAllRoles();
            if (data) setRoles(data);
        } catch (err) {
            toast.error('Failed to load roles');
        } finally { setIsLoadingRoles(false); }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { name: '', email: '', picture: '' };
        if (!formData.name.trim()) { newErrors.name = 'Name is required.'; isValid = false; }
        if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Valid email is required.';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                status: formData.status,
                role: formData.role === '' ? null : formData.role,
                picture: formData.picture.trim() || undefined,
            };
            await addUser(userData);
            toast.success("User added. Credentials sent to their email.");
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add user');
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New User</h2>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name *</label>
                        <input name="name" value={formData.name} onChange={handleChange} className="border p-2 w-full rounded border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="border p-2 w-full rounded border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none" />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="border p-2 w-full rounded border-gray-300">
                            <option value="">No Role</option>
                            {roles.map((role) => <option key={role._id} value={role._id}>{role.name}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white py-2 px-4 rounded">
                            {isSubmitting ? 'Adding...' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default AddUserModal;