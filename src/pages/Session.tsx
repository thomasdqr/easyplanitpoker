import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import VotingCards from '../components/Session/VotingCards';
import UserStoryList from '../components/Session/UserStoryList';
import ParticipantList from '../components/Session/ParticipantList';
import type { UserStory, Participant, Session } from '../types';
import '../styles/pages/Session.css';

export default function SessionPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(
    location.state?.participantId || null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');

  const currentParticipant = session?.participants.find(p => p.id === participantId);

  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'sessions', sessionId),
      (docSnap) => {
        if (docSnap.exists()) {
          const sessionData = docSnap.data() as Session;
          setSession(sessionData);
          setLoading(false);
        } else {
          setError('Session not found');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Session subscription error:', err);
        setError('Failed to load session');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [sessionId]);

  // If no participant info, redirect to join page
  useEffect(() => {
    if (!participantId && sessionId && !loading) {
      navigate(`/session/${sessionId}/join`);
    }
  }, [participantId, sessionId, loading, navigate]);

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !currentParticipant?.isPM || !session || !newStoryTitle.trim()) return;

    try {
      const newStory: UserStory = {
        id: crypto.randomUUID(),
        title: newStoryTitle.trim(),
        votes: {},
        status: 'pending'
      };

      const updates: Partial<Session> = {
        stories: [...session.stories, newStory]
      };

      // If no current story is selected, set this as current
      if (!session.currentStoryId) {
        updates.currentStoryId = newStory.id;
      }

      // Single update for both changes if needed
      await updateDoc(doc(db, 'sessions', sessionId), updates);
      setNewStoryTitle(''); // Clear input after successful add
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };

  const handleSelectStory = async (storyId: string) => {
    if (!sessionId || !currentParticipant?.isPM || !session) return;

    try {
      // Only update if selecting a different story
      if (storyId === session.currentStoryId) return;

      // Reset votes when selecting a new story
      const resetParticipants = session.participants.map(p => ({
        ...p,
        currentVote: null
      }));

      // Batch update story selection and reset votes
      await updateDoc(doc(db, 'sessions', sessionId), {
        currentStoryId: storyId,
        isVotingRevealed: false,
        participants: resetParticipants
      });
    } catch (error) {
      console.error('Error selecting story:', error);
    }
  };

  const handleVote = async (value: number | string) => {
    if (!sessionId || !session?.currentStoryId || !participantId || session.isVotingRevealed) return;

    try {
      const numericValue = typeof value === 'string' ? -1 : value;
      
      // Only update if the vote has changed
      const currentVote = session.participants.find(p => p.id === participantId)?.currentVote;
      if (currentVote === numericValue) return;

      const updatedParticipants = session.participants.map(p => 
        p.id === participantId ? { ...p, currentVote: numericValue } : p
      );

      await updateDoc(doc(db, 'sessions', sessionId), {
        participants: updatedParticipants,
      });
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleRevealVotes = async () => {
    if (!sessionId || !currentParticipant?.isPM || !session?.currentStoryId) return;

    try {
      const currentStory = session.stories.find(s => s.id === session.currentStoryId);
      if (!currentStory) return;

      // Calculate average points
      const votes = session.participants
        .map(p => p.currentVote)
        .filter((vote): vote is number => vote !== null && vote >= 0);
      
      const averagePoints = votes.length > 0 
        ? Math.round(votes.reduce((a, b) => a + b, 0) / votes.length) 
        : 0;

      // Batch update story and voting state
      const updatedStories = session.stories.map(s => 
        s.id === currentStory.id 
          ? { 
              ...s, 
              status: 'completed',
              averagePoints,
              votes: session.participants.reduce((acc, p) => ({
                ...acc,
                [p.id]: p.currentVote
              }), {})
            } 
          : s
      );

      // Single update for both stories and voting state
      await updateDoc(doc(db, 'sessions', sessionId), {
        stories: updatedStories,
        isVotingRevealed: true
      });
    } catch (error) {
      console.error('Error revealing votes:', error);
    }
  };

  const handleNextStory = async () => {
    if (!sessionId || !currentParticipant?.isPM || !session) return;

    try {
      const currentIndex = session.stories.findIndex(s => s.id === session.currentStoryId);
      const nextStory = session.stories[currentIndex + 1];
      
      if (nextStory) {
        // Batch update next story, voting state, and reset votes
        const resetParticipants = session.participants.map(p => ({
          ...p,
          currentVote: null
        }));

        // Single update for all changes
        await updateDoc(doc(db, 'sessions', sessionId), {
          currentStoryId: nextStory.id,
          isVotingRevealed: false,
          participants: resetParticipants
        });
      }
    } catch (error) {
      console.error('Error moving to next story:', error);
    }
  };

  const canRevealVotes = session?.participants.every(p => 
    p.currentVote !== null || p.currentVote === -1
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!sessionId || !currentParticipant?.isPM || !session) return;

    try {
      const updatedStories = session.stories.filter(story => story.id !== storyId);
      const updates: Partial<Session> = {
        stories: updatedStories
      };

      // If deleting current story, select the next available one or clear selection
      if (session.currentStoryId === storyId) {
        const currentIndex = session.stories.findIndex(s => s.id === storyId);
        const nextStory = session.stories[currentIndex + 1] || session.stories[currentIndex - 1];
        updates.currentStoryId = nextStory?.id || null;
        
        if (!nextStory) {
          // Reset all votes if no next story
          updates.participants = session.participants.map(p => ({
            ...p,
            currentVote: null
          }));
        }
      }

      await updateDoc(doc(db, 'sessions', sessionId), updates);
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  if (loading) {
    return <div>Loading session...</div>;
  }

  return (
    <motion.div 
      className="session-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="session-header">
        <h1>Planning Session</h1>
        <div className="copy-link-container">
          <span className="session-link">
            {window.location.href.slice(0, 40)}...
          </span>
          <button 
            className={`copy-link-button ${copied ? 'copied' : ''}`}
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <span>✓ Copied!</span>
              </>
            ) : (
              <>
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </header>

      <div className="session-content">
        <div className="left-panel">
          <section className="participants-section">
            <h2>Participants</h2>
            <ParticipantList
              participants={session!.participants}
              isVotingRevealed={session!.isVotingRevealed}
            />
            {currentParticipant?.isPM && (
              <button 
                className="reveal-votes-button"
                onClick={session!.isVotingRevealed ? handleNextStory : handleRevealVotes}
                disabled={
                  session!.isVotingRevealed 
                    ? !session!.stories.find((s, i) => 
                        i > session!.stories.findIndex(story => story.id === session!.currentStoryId)
                      )
                    : !canRevealVotes
                }
              >
                {session!.isVotingRevealed ? 'Next Story' : 'Reveal Votes'}
              </button>
            )}
          </section>
        </div>

        <div className="right-panel">
          <section className="stories-section">
            <div className="stories-header">
              <h2>User Stories</h2>
              {currentParticipant?.isPM && (
                <form onSubmit={handleAddStory} className="add-story-form">
                  <input
                    type="text"
                    value={newStoryTitle}
                    onChange={(e) => setNewStoryTitle(e.target.value)}
                    placeholder="Add a new user story"
                    required
                  />
                  <button type="submit">Add Story</button>
                </form>
              )}
            </div>
            <div className="stories-content">
              <UserStoryList
                stories={session!.stories}
                currentStoryId={session!.currentStoryId || undefined}
                isPM={currentParticipant?.isPM || false}
                onAddStory={handleAddStory}
                onSelectStory={handleSelectStory}
                onDeleteStory={handleDeleteStory}
              />
            </div>
          </section>

          <section className="voting-section">
            <VotingCards 
              onVote={handleVote}
              selectedValue={currentParticipant?.currentVote || undefined}
              disabled={!session!.currentStoryId || session!.isVotingRevealed}
            />
          </section>
        </div>
      </div>
    </motion.div>
  );
} 