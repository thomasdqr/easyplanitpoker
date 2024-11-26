import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import './StoryIframeModal.css';

interface Props {
  url: string;
  onClose: () => void;
}

export default function StoryIframeModal({ url, onClose }: Props) {
  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
          <iframe 
            src={url} 
            title="JIRA Story"
            className="story-iframe"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 