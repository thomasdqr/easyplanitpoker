import { motion } from 'framer-motion';
import { VOTING_VALUES } from '../../constants/voting';
import './VotingCards.css';

interface Props {
  onVote: (value: number | string) => void;
  selectedValue?: number | string;
  disabled?: boolean;
}

export default function VotingCards({ onVote, selectedValue, disabled }: Props) {
  const isSelected = (value: number | string) => {
    if (selectedValue === null || selectedValue === undefined) return false;
    if (selectedValue === -1 && value === '?') return true;
    return selectedValue === value;
  };

  return (
    <div className="voting-cards">
      {VOTING_VALUES.map((value) => (
        <motion.div
          key={value}
          className={`card ${isSelected(value) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
          onClick={() => !disabled && onVote(value)}
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
        >
          <span>{value}</span>
        </motion.div>
      ))}
    </div>
  );
} 