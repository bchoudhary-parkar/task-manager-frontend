
import React from 'react';

interface DeleteConfirmModalProps {
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ onClose, onConfirm }) => {
    return (
        // Overlay background (using standard tailwind classes that should work now)
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
            {/* Modal content box */}
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
                    {/* ADDED: Close button */}
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none hover:cursor-pointer">&times;</button>
                </div>
                <p className="mb-6 text-gray-600">Are you sure you want to delete this user? This action cannot be undone.</p>
                
                {/* Buttons for action */}
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;