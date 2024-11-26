import { useState, useEffect, useCallback } from 'react';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Button from './Button';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  const handleAnimationProgress = useCallback(() => {
    // Set a timeout for 60% of the animation duration (1.2s * 0.6 = 0.72s)
    setTimeout(() => {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      }
    }, 720); // 0.72 seconds
  }, [isDarkMode]);

  useEffect(() => {
    const overlay = document.querySelector('.theme-transition-circle');
    overlay?.addEventListener('animationend', handleTransitionEnd as EventListener);
    overlay?.addEventListener('animationstart', handleAnimationProgress as EventListener);

    return () => {
      overlay?.removeEventListener('animationend', handleTransitionEnd as EventListener);
      overlay?.removeEventListener('animationstart', handleAnimationProgress as EventListener);
    };
  }, [handleTransitionEnd, handleAnimationProgress]);

  useEffect(() => {
    if (!isTransitioning) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode, isTransitioning]);

  const toggleTheme = () => {
    setIsTransitioning(true);
    setIsDarkMode(!isDarkMode);
  };

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div key={i} className="particle" />
  ));

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={toggleTheme}
        icon={isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
        className="theme-toggle"
        disabled={isTransitioning}
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </Button>

      <div className={`theme-transition-overlay ${isTransitioning ? 'active' : ''} ${isDarkMode ? 'to-dark' : 'to-light'}`}>
        <div className="theme-transition-circle" />
        <div className="theme-particles">
          {particles}
        </div>
      </div>
    </>
  );
} 