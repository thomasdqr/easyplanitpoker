import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createSession } from '../services/firebase';
import '../styles/pages/Home.css';

export default function Home() {
  const [pmName, setPmName] = useState('');
  const [loading, setLoading] = useState(false);
  const cursorGlowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = `${e.clientX}px`;
        cursorGlowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      <div className="background-dots">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
      
      <div className="hero-section">
        <h1 className="hero-title">Planning Poker</h1>
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
        <h1>Start a Session</h1>
        <form onSubmit={handleCreateSession}>
          <input
            type="text"
            value={pmName}
            onChange={(e) => setPmName(e.target.value)}
            placeholder="Enter your name (PM)"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Session...' : 'Create Session'}
          </button>
        </form>
      </motion.div>
    </div>
  );
} 