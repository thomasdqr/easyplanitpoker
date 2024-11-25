import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Participant, Session } from '../types';
import '../styles/pages/Session.css';

export default function JoinSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !participantName.trim() || loading) return;

    try {
      setLoading(true);
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        throw new Error('Session not found');
      }

      const newParticipant: Participant = {
        id: crypto.randomUUID(),
        name: participantName.trim(),
        isPM: false,
        currentVote: null,
        connected: true
      };

      const session = sessionSnap.data() as Session;
      await updateDoc(sessionRef, {
        participants: [...session.participants, newParticipant]
      });

      localStorage.setItem('participant_id', newParticipant.id);
      localStorage.setItem('participant_name', participantName.trim());
      
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Join session error:', error);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="join-dialog"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h2>Join Planning Session</h2>
      <form onSubmit={handleJoinSession}>
        <input
          type="text"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          placeholder="Enter your name"
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Join Session'}
        </button>
      </form>
    </motion.div>
  );
} 