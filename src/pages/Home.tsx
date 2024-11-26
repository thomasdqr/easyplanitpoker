import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createSession } from '../services/firebase';
import '../styles/pages/Home.css';

export default function Home() {
  const [pmName, setPmName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });

      // Update each dot's position based on distance from cursor
      dotsRef.current.forEach((dot, index) => {
        if (!dot) return;

        const rect = dot.getBoundingClientRect();
        const dotCenterX = rect.left + rect.width / 2;
        const dotCenterY = rect.top + rect.height / 2;

        // Calculate distance between dot and cursor
        const distanceX = clientX - dotCenterX;
        const distanceY = clientY - dotCenterY;
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

        // Maximum distance for interaction
        const maxDistance = 400;
        
        if (distance < maxDistance) {
          // Calculate movement strength (stronger when closer)
          const strength = (maxDistance - distance) / maxDistance;
          const moveX = (distanceX / distance) * strength * 30;
          const moveY = (distanceY / distance) * strength * 30;

          // Apply transform with both the floating animation and mouse interaction
          dot.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          // Reset position if cursor is too far
          dot.style.transform = 'translate(0, 0)';
        }
      });
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
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            ref={el => dotsRef.current[i] = el}
            className={`dot dot-${i + 1}`}
          />
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