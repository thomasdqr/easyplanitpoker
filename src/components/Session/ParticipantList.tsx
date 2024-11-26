import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '../../types';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import './ParticipantList.css';

interface Props {
  participants: Participant[];
  isVotingRevealed: boolean;
  isPM?: boolean;
  onKickParticipant?: (participantId: string) => void;
  currentParticipantId?: string;
}

export default function ParticipantList({ 
  participants, 
  isVotingRevealed, 
  isPM = false,
  onKickParticipant,
  currentParticipantId
}: Props) {
  return (
    <div className="participant-list">
      <AnimatePresence>
        {participants.map((participant) => (
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
              {isPM && !participant.isPM && participant.id !== currentParticipantId && (
                <button 
                  className="kick-button"
                  onClick={() => onKickParticipant?.(participant.id)}
                  title="Kick participant"
                >
                  <PersonRemoveIcon fontSize="small" />
                </button>
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
        ))}
      </AnimatePresence>
    </div>
  );
} 