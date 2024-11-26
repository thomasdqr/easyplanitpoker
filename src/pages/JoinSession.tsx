import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Session, Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/common/Button';
import Hero from '../components/common/Hero';
import '../styles/pages/JoinSession.css';

export default function JoinSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !name.trim() || loading) return;

    try {
      setLoading(true);
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      const sessionData = sessionSnap.data() as Session;
      const newParticipantId = uuidv4();

      const newParticipant: Participant = {
        id: newParticipantId,
        name: name.trim(),
        isPM: false,
        currentVote: null,
        connected: true
      };

      await updateDoc(sessionRef, {
        participants: [...sessionData.participants, newParticipant]
      });

      navigate(`/session/${sessionId}`, { state: { participantId: newParticipantId } });
    } catch (error) {
      console.error('Failed to join session:', error);
      setError('Failed to join session');
      setLoading(false);
    }
  };

  return (
    <div className="join-session-container">
      <Hero />
      <div className="content-wrapper">
        <h1>Join Planning Session</h1>
        <p className="subtitle">Enter your name to join the planning poker session</p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleJoin}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            disabled={loading}
          />
          <Button 
            type="submit"
            size="lg"
            variant="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Joining Session...' : 'Join Session'}
          </Button>
        </form>
      </div>
    </div>
  );
} 