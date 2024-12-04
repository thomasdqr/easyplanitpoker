import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserStory } from '../../types';
import StoryIframeModal from './StoryIframeModal';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import './UserStoryList.css';

interface Props {
  stories: UserStory[];
  currentStoryId?: string;
  isPM: boolean;
  sessionId: string;
  onSelectStory: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export default function UserStoryList({ 
  stories, 
  currentStoryId, 
  isPM, 
  onSelectStory, 
  onDeleteStory 
}: Props) {
  const [selectedStoryUrl, setSelectedStoryUrl] = useState<string | null>(null);
  const [isFirefox, setIsFirefox] = useState(false);

  useEffect(() => {
    // Detect Firefox browser
    setIsFirefox(navigator.userAgent.toLowerCase().includes('firefox'));
  }, []);

  const handleDelete = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    onDeleteStory(storyId);
  };

  const handleClick = (story: UserStory) => {
    if (isPM) {
      onSelectStory(story.id);
    }
  };

  const handleStoryLinkClick = (url: string) => {
    if (isFirefox) {
      // Open in new tab for Firefox
      window.open(url, '_blank');
    } else {
      // Show modal for other browsers
      setSelectedStoryUrl(url);
    }
  };

  if (stories.length === 0) {
    return (
      <div className="user-story-list empty">
        <p>No stories have been added yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="user-story-list">
        <AnimatePresence>
          {stories.map((story) => (
            <motion.div
              key={story.id}
              className={`story-item ${story.id === currentStoryId ? 'selected' : ''}`}
              onClick={() => handleClick(story)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="story-content">
                <h3 className="story-title">{story.title}</h3>
                {story.averagePoints !== undefined && (
                  <span className="story-points">{story.averagePoints} points</span>
                )}
                <span className="story-status" data-status={story.status}>
                  {story.status}
                </span>
              </div>
              <div className="story-actions">
                {story.link && (
                  <button 
                    className="story-action-button"
                    onClick={() => story.link && handleStoryLinkClick(story.link)}
                    title="Open story details"
                  >
                    <LinkIcon />
                  </button>
                )}
                {isPM && (
                  <button
                    className="delete-button"
                    onClick={(e) => handleDelete(e, story.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isFirefox && selectedStoryUrl && (
        <StoryIframeModal 
          url={selectedStoryUrl} 
          onClose={() => setSelectedStoryUrl(null)} 
        />
      )}
    </>
  );
} 