import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Session, Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';
import Button from '../components/common/Button';
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
    <div className="join-container">
      <div className="background-dots">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`dot dot-${i + 1}`} />
        ))}
      </div>
      
      <div className="hero-section">
        <h1 className="hero-title">Easy Planning Poker</h1>
        <p className="hero-subtitle">
          Streamline your agile estimation process with our intuitive and collaborative planning poker tool
        </p>
      </div>

      <motion.div 
        className="content-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1>Join a Session</h1>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
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
      </motion.div>
    </div>
  );
} 