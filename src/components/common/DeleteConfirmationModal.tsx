// src/components/common/DeleteConfirmationModal.tsx
import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemNames?: string[];
  isDeleting?: boolean;
  entityType?: 'user' | 'task' | 'role' | 'item';
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemNames = [],
  isDeleting = false,
  entityType = 'item',
}) => {
  if (!isOpen) return null;

  const isBulkDelete = itemNames.length > 1;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-4">
            <p className="text-gray-600 leading-relaxed mb-3">{message}</p>

            {/* Show item names if provided */}
            {itemNames.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto border border-gray-200">
                <ul className="space-y-1">
                  {itemNames.map((name, index) => (
                    <li
                      key={index}
                      className="text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></span>
                      <span className="truncate">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Warning Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ This action cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <span>{isBulkDelete ? 'Delete All' : 'Delete'}</span>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;