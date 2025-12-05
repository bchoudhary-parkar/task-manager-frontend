
import React, { useState } from 'react';

interface DeleteConfirmationModalProps {
  roleName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  roleName,
  onClose,
  onConfirm
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/30 backdrop-blur-md z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Delete Role</h3>
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete the role <span className="font-bold">{roleName}</span>?
        </p>
        <p className="text-gray-500 mb-2">
          Type <span className="font-bold">DELETE</span> to confirm:
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type DELETE"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={inputValue !== 'DELETE'}
            className={`px-4 py-2 rounded text-white ${
              inputValue === 'DELETE'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-red-300 cursor-not-allowed'
            }`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
