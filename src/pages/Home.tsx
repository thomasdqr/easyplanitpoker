import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createSession } from '../services/firebase';
import '../styles/pages/Home.css';

export default function Home() {
  const [pmName, setPmName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pmName.trim() || loading) return;

    try {
      setLoading(true);
      const { sessionId, pmId } = await createSession(pmName.trim());
      navigate(`/session/${sessionId}`, { state: { participantId: pmId } });
    } catch (error) {
      console.error('Failed to create session:', error);
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="floating-cards">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="floating-card" />
        ))}
      </div>
      <motion.div 
        className="content-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1>Planning Poker</h1>
        <form onSubmit={handleCreateSession}>
          <input
            type="text"
            value={pmName}
            onChange={(e) => setPmName(e.target.value)}
            placeholder="Enter your name (PM)"
            required
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Creating Session...' : 'Create Session'}
          </button>
        </form>
      </motion.div>
    </div>
  );
} 