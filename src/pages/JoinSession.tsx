import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { v4 as uuidv4 } from 'uuid';
import type { Session } from '../types';

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

      await updateDoc(sessionRef, {
        participants: [
          ...sessionData.participants,
          {
            id: newParticipantId,
            name: name.trim(),
            isPM: false,
            currentVote: null,
            connected: true
          }
        ]
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
      <div className="background-dots">
        <div className="dot dot-1" />
        <div className="dot dot-2" />
        <div className="dot dot-3" />
      </div>
      <div className="join-dialog">
        <h2>Join Session</h2>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Joining...' : 'Join Session'}
          </button>
        </form>
      </div>
    </div>
  );
} 