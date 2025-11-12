import { AnimatePresence, motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import Button from './Button';
import './ConfirmModal.css';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="confirm-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="confirm-modal-content"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="confirm-modal-close" onClick={onCancel} aria-label="Close">
            <CloseIcon fontSize="small" />
          </button>

          <div className="confirm-modal-body">
            <h3 className="confirm-modal-title">{title}</h3>
            {description && <p className="confirm-modal-description">{description}</p>}
          </div>

          <div className="confirm-modal-actions">
            <Button variant="secondary" onClick={onCancel} className="confirm-modal-action">
              {cancelText}
            </Button>
            <Button
              variant={danger ? 'danger' : 'primary'}
              onClick={onConfirm}
              className="confirm-modal-action"
            >
              {confirmText}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}



