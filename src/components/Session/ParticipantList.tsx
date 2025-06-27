import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '../../types';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import './ParticipantList.css';
import { useEffect } from 'react';

interface Props {
  participants: Participant[];
  isVotingRevealed: boolean;
  isPM?: boolean;
  onKickParticipant?: (participantId: string) => void;
  onSendWizz?: (participantId: string) => void;
  currentParticipantId?: string;
  isParticipantWizzDisabled?: (participantId: string) => boolean;
}

export default function ParticipantList({ 
  participants, 
  isVotingRevealed, 
  isPM = false,
  onKickParticipant,
  onSendWizz,
  currentParticipantId,
  isParticipantWizzDisabled = () => false
}: Props) {
  // Debug log to check if the component is receiving updates about disabled participants
  useEffect(() => {
    if (isPM || onSendWizz) {
      participants.forEach(participant => {
        if (participant.id !== currentParticipantId && participant.currentVote === null) {
          const isDisabled = isParticipantWizzDisabled(participant.id);
          console.log(`[UI] Participant ${participant.id} (${participant.name}) wizz button disabled: ${isDisabled}`);
        }
      });
    }
  }, [participants, isPM, currentParticipantId, isParticipantWizzDisabled, onSendWizz]);

  const canShowActionsForParticipant = (participant: Participant) => {
    // Don't show actions for yourself
    if (participant.id === currentParticipantId) return false;

    // If you're the PM, show actions for non-PM participants
    if (isPM) return !participant.isPM;

    // In secret mode (when onSendWizz is available), show actions for everyone except yourself
    if (onSendWizz) return true;

    return false;
  };

  const handleNameHover = (element: HTMLElement) => {
    const text = element.getAttribute('data-text') || element.textContent || '';
    const containerWidth = element.offsetWidth;
    
    // Use canvas to measure actual text width with exact font
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const computedStyle = window.getComputedStyle(element);
    context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    
    const actualTextWidth = context.measureText(text).width;
    
    if (actualTextWidth > containerWidth) {
      // Create infinite scrolling effect with repeated text
      const separator = ' • '; // Visual separator between repetitions
      const textWithSeparator = text + separator;
      const repeatedText = textWithSeparator.repeat(20); // Repeat enough times for smooth loop
      
      element.setAttribute('data-repeated-text', repeatedText);
      element.classList.add('infinite-scroll');
      
      // Stop animation after 10 seconds and show original text
      setTimeout(() => {
        element.classList.remove('infinite-scroll');
        element.removeAttribute('data-repeated-text');
        // Force show original static text
        element.style.setProperty('--scroll-distance', '0%');
      }, 10000);
    } else {
      element.style.setProperty('--scroll-distance', '0%');
    }
  };

  const handleNameLeave = (element: HTMLElement) => {
    element.classList.remove('infinite-scroll');
    element.removeAttribute('data-repeated-text');
  };

  return (
    <div className="participant-list">
      <AnimatePresence>
        {participants.map((participant) => {
          const isDisabled = isParticipantWizzDisabled(participant.id);
          const showActions = canShowActionsForParticipant(participant);
          
          return (
            <motion.div
              key={participant.id}
              className={`participant-card ${!participant.connected ? 'disconnected' : ''}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="participant-info">
                <div className="participant-name">
                  <span 
                    className="participant-name-text" 
                    data-text={participant.name}
                    onMouseEnter={(e) => handleNameHover(e.currentTarget)}
                    onMouseLeave={(e) => handleNameLeave(e.currentTarget)}
                  >
                    {participant.name}
                  </span>
                  <div className="participant-badges">
                    {participant.isPM && <span className="pm-badge">PM</span>}
                    {participant.id === currentParticipantId && (
                      <span className="you-badge">YOU</span>
                    )}
                  </div>
                </div>
                {showActions && (
                  <div className="participant-action-buttons">
                    {/* Only show kick button for PM and only for non-PM participants */}
                    {isPM && !participant.isPM && (
                      <button 
                        className="kick-button"
                        onClick={() => onKickParticipant?.(participant.id)}
                        title="Kick participant"
                      >
                        <PersonRemoveIcon fontSize="small" />
                      </button>
                    )}
                    
                    {/* Show wizz button if participant hasn't voted and we have a wizz handler */}
                    {participant.currentVote === null && onSendWizz && (
                      <button 
                        className={`wizz-button ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          console.log(`[UI] Clicked wizz button for ${participant.id} (${participant.name}), disabled: ${isDisabled}`);
                          if (!isDisabled) {
                            onSendWizz(participant.id);
                          }
                        }}
                        title={isDisabled 
                          ? "Wizz is on cooldown for this participant (anti-spam)" 
                          : "Send wizz to participant"}
                        disabled={isDisabled}
                      >
                        <NotificationsActiveIcon fontSize="small" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="vote-status">
                {participant.currentVote !== null ? (
                  isVotingRevealed ? (
                    <span className="vote-value">
                      {participant.currentVote === -1 ? '?' : participant.currentVote}
                    </span>
                  ) : (
                    <span className="vote-ready">✓ Voted</span>
                  )
                ) : (
                  <span className="vote-pending">Waiting...</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
} 