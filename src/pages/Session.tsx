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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';

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
      // Extract JIRA link if title contains URL
      const urlMatch = newStoryTitle.match(/https?:\/\/[^\s]+/);
      const link = urlMatch ? urlMatch[0] : undefined;
      
      // Extract title from URL or use provided title
      let title = newStoryTitle.trim();
      if (link) {
        // Remove the link from the manual title
        title = title.replace(link, '').trim();
        
        // Extract story name from JIRA URL
        const urlParts = link.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        
        // If we found a URL slug, use it as title, otherwise keep manual title
        if (lastPart && lastPart.length > 0) {
          title = lastPart; // Use the exact name from URL without transformation
        }
        
        // Fallback if no title could be extracted
        if (!title) {
          title = 'Untitled Story';
        }
      }

      const newStory: UserStory = {
        id: crypto.randomUUID(),
        title,
        ...(link && { link }),
        votes: {},
        status: 'pending' as const,
      };

      const updates: Partial<Session> = {
        stories: [...session.stories, newStory]
      };

      // If no current story is selected, set this as current
      if (!session.currentStoryId) {
        updates.currentStoryId = newStory.id;
      }

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
      const numericValue = value === '?' ? -1 : Number(value);
      
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

      // Update story with votes and average
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
      <div className="session-wrapper">
        <header className="session-header">
          <h1>Easy Poker Planning</h1>
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
                  <ContentCopyIcon fontSize="small" />
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
                  {session!.isVotingRevealed ? (
                    <>
                      <NavigateNextIcon />
                      <span>Next Story</span>
                    </>
                  ) : (
                    <>
                      <VisibilityIcon />
                      <span>Reveal Votes</span>
                    </>
                  )}
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
                    <button type="submit">
                      <AddIcon fontSize="small" />
                      <span>Add Story</span>
                    </button>
                  </form>
                )}
              </div>
              <div className="stories-content">
                <UserStoryList
                  stories={session!.stories}
                  currentStoryId={session!.currentStoryId || undefined}
                  isPM={currentParticipant?.isPM || false}
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
      </div>
    </motion.div>
  );
} 