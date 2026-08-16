import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Permanent Deletion',
  itemName = '',
  itemType = 'account',
  requiredWord = 'confirm',
  loading = false,
}) => {
  const [typedWord, setTypedWord] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTypedWord('');
      setError('');
    }
  }, [isOpen]);

  const isMatch = typedWord.trim().toLowerCase() === requiredWord.toLowerCase();

  const handleFormSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isMatch) {
      setError(`Please type "${requiredWord}" to confirm.`);
      return;
    }
    setError('');
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleFormSubmit}
            disabled={!isMatch || loading}
            loading={loading}
            leftIcon={Trash2}
          >
            Delete Permanently
          </Button>
        </div>
      }
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Warning banner */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-red-900">Warning: Irreversible Action</h4>
            <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
              This action cannot be undone. All database records, profile info, and related data for{' '}
              <span className="font-semibold">{itemName || `this ${itemType}`}</span> will be permanently removed.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            To confirm deletion, please type <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded font-mono font-bold text-xs">{requiredWord}</code> below:
          </label>
          <input
            type="text"
            value={typedWord}
            onChange={(e) => {
              setTypedWord(e.target.value);
              if (error) setError('');
            }}
            placeholder={`Type "${requiredWord}" to confirm`}
            disabled={loading}
            autoFocus
            className="w-full px-3.5 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400 font-medium"
          />
          {error && (
            <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default DeleteConfirmModal;
