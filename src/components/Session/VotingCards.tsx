import { motion } from 'framer-motion';
import './VotingCards.css';

const VOTING_VALUES = [1, 2, 3, 5, 8, 13, 21, '?'];

interface Props {
  onVote: (value: number | string) => void;
  selectedValue?: number | string;
  disabled?: boolean;
}

export default function VotingCards({ onVote, selectedValue, disabled }: Props) {
  return (
    <div className="voting-cards">
      {VOTING_VALUES.map((value) => (
        <motion.div
          key={value}
          className={`card ${selectedValue === value ? 'selected' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !disabled && onVote(value)}
        >
          <span>{value}</span>
        </motion.div>
      ))}
    </div>
  );
} 