import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '../../types';
import './ParticipantList.css';

interface Props {
  participants: Participant[];
  isVotingRevealed: boolean;
}

export default function ParticipantList({ participants, isVotingRevealed }: Props) {
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
              </span>
              <span className="connection-status" />
            </div>
            <div className="vote-status">
              {participant.currentVote !== undefined ? (
                isVotingRevealed ? (
                  <span className="vote-value">{participant.currentVote}</span>
                ) : (
                  <span className="vote-ready">Ready</span>
                )
              ) : (
                <span className="vote-pending">Thinking...</span>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
} 