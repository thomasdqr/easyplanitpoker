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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    onAddStory({
      title: newStoryTitle.trim(),
      status: 'pending',
      votes: {},
    });

    setNewStoryTitle('');
  };

  // If no stories provided, only render the form
  if (stories.length === 0) {
    return isPM ? (
      <form onSubmit={handleSubmit} className="add-story-form">
        <input
          type="text"
          value={newStoryTitle}
          onChange={(e) => setNewStoryTitle(e.target.value)}
          placeholder="Add a new user story"
          required
        />
        <button type="submit">Add Story</button>
      </form>
    ) : null;
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
            onClick={() => isPM && onSelectStory(story.id)}
          >
            <div className="story-content">
              <h3 className="story-title">{story.title}</h3>
              {story.averagePoints !== undefined && (
                <div className="story-points">
                  {story.averagePoints} points
                </div>
              )}
            </div>
            <div className="story-status">{story.status}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 