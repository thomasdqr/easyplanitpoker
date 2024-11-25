import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const participantId = localStorage.getItem('participant_id');
  const currentParticipant = session?.participants.find(p => p.id === participantId);

  // If no participant info, redirect to join page
  useEffect(() => {
    if (!participantId && sessionId) {
      navigate(`/session/${sessionId}/join`);
    }
  }, [participantId, sessionId, navigate]);

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

  const handleAddStory = async (story: Omit<UserStory, 'id'>) => {
    if (!sessionId || !currentParticipant?.isPM) return;

    try {
      const newStory: UserStory = {
        ...story,
        id: crypto.randomUUID(),
        votes: {},
      };

      const updatedStories = [...session!.stories, newStory];
      await updateDoc(doc(db, 'sessions', sessionId), {
        stories: updatedStories,
        currentStoryId: session!.currentStoryId || newStory.id,
      });
    } catch (error) {
      console.error('Error adding story:', error);
    }
  };

  const handleSelectStory = async (storyId: string) => {
    if (!sessionId || !currentParticipant?.isPM) return;

    try {
      await updateDoc(doc(db, 'sessions', sessionId), {
        currentStoryId: storyId,
        isVotingRevealed: false,
      });
    } catch (error) {
      console.error('Error selecting story:', error);
    }
  };

  const handleVote = async (value: number | string) => {
    if (!sessionId || !session!.currentStoryId || !participantId) return;

    try {
      const numericValue = typeof value === 'string' ? -1 : value;
      const updatedParticipants = session!.participants.map(p => 
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
    if (!sessionId || !currentParticipant?.isPM) return;

    try {
      const currentStory = session!.stories.find(s => s.id === session!.currentStoryId);
      if (!currentStory) return;

      // Calculate average points
      const votes = session!.participants
        .map(p => p.currentVote)
        .filter((vote): vote is number => vote !== null && vote >= 0);
      
      const averagePoints = votes.length > 0 
        ? Math.round(votes.reduce((a, b) => a + b, 0) / votes.length) 
        : 0;

      // Update story with votes and average
      const updatedStories = session!.stories.map(s => 
        s.id === currentStory.id 
          ? { 
              ...s, 
              status: 'completed',
              averagePoints,
              votes: session!.participants.reduce((acc, p) => ({
                ...acc,
                [p.id]: p.currentVote
              }), {})
            } 
          : s
      );

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
        // Reset all participants' votes
        const resetParticipants = session.participants.map(p => ({
          ...p,
          currentVote: null
        }));

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
        <button 
          className="copy-link-button"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
          }}
        >
          Copy Invitation Link
        </button>
      </header>

      <div className="session-content">
        <div className="left-panel">
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
        </div>

        <div className="right-panel">
          <div className="stories-section">
            <h2>User Stories</h2>
            <UserStoryList
              stories={session!.stories}
              currentStoryId={session!.currentStoryId || undefined}
              isPM={currentParticipant?.isPM || false}
              onAddStory={handleAddStory}
              onSelectStory={handleSelectStory}
            />
          </div>
          
          <footer className="session-footer">
            <VotingCards 
              onVote={handleVote}
              selectedValue={currentParticipant?.currentVote || undefined}
              disabled={!session!.currentStoryId || session!.isVotingRevealed}
            />
          </footer>
        </div>
      </div>
    </motion.div>
  );
} 