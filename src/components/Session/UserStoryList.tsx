import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { UserStory } from '../../types';
import './UserStoryList.css';

interface Props {
  stories: UserStory[];
  currentStoryId?: string;
  isPM: boolean;
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
  const handleDelete = (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation(); // Prevent story selection when clicking delete
    onDeleteStory(storyId);
  };

  const handleClick = (story: UserStory) => {
    if (isPM) {
      onSelectStory(story.id);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, link?: string) => {
    e.stopPropagation(); // Prevent story selection
    if (link) {
      window.open(link, '_blank');
    }
  };

  // If no stories, show empty state message
  if (stories.length === 0) {
    return (
      <div className="user-story-list empty">
        <p>No stories have been added yet.</p>
      </div>
    );
  }

  // Otherwise render the story list
  return (
    <div className="user-story-list">
      <AnimatePresence>
        {stories.map((story) => (
          <motion.div
            key={story.id}
            className={`story-card ${currentStoryId === story.id ? 'selected' : ''} ${story.status === 'completed' ? 'completed' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => handleClick(story)}
          >
            <div className="story-content">
              <div className="story-title-container">
                <h3 className="story-title">{story.title}</h3>
                {story.link && (
                  <button 
                    className="story-link-button"
                    onClick={(e) => handleLinkClick(e, story.link)}
                    title="Open in new tab"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </button>
                )}
              </div>
              {story.averagePoints !== undefined && (
                <div className="story-points">
                  {story.averagePoints} points
                </div>
              )}
            </div>
            <div className="story-actions">
              <div className="story-status">{story.status}</div>
              {isPM && (
                <button 
                  className="delete-story-button"
                  onClick={(e) => handleDelete(e, story.id)}
                  title="Delete Story"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 