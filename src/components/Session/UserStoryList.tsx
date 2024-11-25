import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserStory } from '../../types';
import './UserStoryList.css';

interface Props {
  stories: UserStory[];
  currentStoryId?: string;
  isPM: boolean;
  onAddStory: (story: Omit<UserStory, 'id'>) => void;
  onSelectStory: (storyId: string) => void;
}

export default function UserStoryList({ 
  stories, 
  currentStoryId, 
  isPM, 
  onAddStory, 
  onSelectStory 
}: Props) {
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDescription, setNewStoryDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    onAddStory({
      title: newStoryTitle.trim(),
      description: newStoryDescription.trim(),
      status: 'pending',
    });

    setNewStoryTitle('');
    setNewStoryDescription('');
  };

  return (
    <div className="user-story-list">
      {isPM && (
        <form onSubmit={handleSubmit} className="add-story-form">
          <input
            type="text"
            value={newStoryTitle}
            onChange={(e) => setNewStoryTitle(e.target.value)}
            placeholder="User Story Title"
            required
          />
          <textarea
            value={newStoryDescription}
            onChange={(e) => setNewStoryDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
          />
          <button type="submit">Add Story</button>
        </form>
      )}

      <AnimatePresence>
        {stories.map((story) => (
          <motion.div
            key={story.id}
            className={`story-card ${currentStoryId === story.id ? 'current' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => isPM && onSelectStory(story.id)}
          >
            <h3>{story.title}</h3>
            {story.description && <p>{story.description}</p>}
            {story.averagePoints !== undefined && (
              <div className="story-points">
                Average: {story.averagePoints} points
              </div>
            )}
            <div className="story-status">{story.status}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 