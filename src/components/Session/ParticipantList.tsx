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
                <span className="participant-name">
                  {participant.name}
                  {participant.isPM && <span className="pm-badge">PM</span>}
                  {participant.id === currentParticipantId && (
                    <span className="you-badge">YOU</span>
                  )}
                </span>
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