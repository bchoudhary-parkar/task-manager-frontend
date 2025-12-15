import React from 'react';
import { FaTimes } from 'react-icons/fa';

interface DeleteConfirmationModalProps {
  roleNames: string[];
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  roleNames,
  onClose,
  onConfirm
}) => {
  const count = roleNames.length;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Delete {count === 1 ? 'Role' : 'Roles'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            title="Close"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="mb-8 text-center">
          <p className="text-gray-700 text-lg">
            Are you sure you want to delete {count} {count === 1 ? 'role' : 'roles'}?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium min-w-[100px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium min-w-[120px]"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
