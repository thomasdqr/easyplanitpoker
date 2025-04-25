import { motion } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';
import { VOTING_VALUES } from '../../constants/voting';
import './VotingCards.css';

interface Props {
  onVote: (value: number | string) => void;
  selectedValue?: number | string;
  disabled?: boolean;
  onSecretWizz?: (word: string) => void;
  questionMarkColor?: string;
  showNotification?: (message: string) => void;
}

// Function to get the corresponding letter for a number (1-based index in alphabet)
const getLetterForNumber = (value: number | string): string => {
  if (value === '?') return ''; // No special character for '?' card
  const num = Number(value);
  if (num < 1 || num > 26) return '';
  return String.fromCharCode(64 + num); // A is 65 in ASCII
};

// Word-based sequences where numbers represent letter positions in the alphabet
const WORD_SEQUENCES = {
  CUBE: [3, 21, 2, 5],
  BEAM: [2, 5, 1, 13],
  CAME: [3, 1, 13, 5],
  BEACH: [2, 5, 1, 3, 8],
  MAMA: [13, 1, 13, 1],
  EMMA: [5, 13, 13, 1],
  BABE: [2, 1, 2, 5],
  MECH: [13, 5, 3, 8],
  MUCH: [13, 21, 3, 8],
  HUE: [8, 21, 5],
};

// Hints for each secret word
const WORD_HINTS = {
  CUBE: "🧊 Hint: A 3D shape... (4 letter word) ",
  BEAM: "💡 Hint: A ray of light... (4 letter word)",
  CAME: "🕗 Hint: Past tense of come... (4 letter word)",
  BEACH: "🏖️ Hint: Sand and waves... (5 letter word)",
  MAMA: "🤱 Hint: She gave birth to you... (4 letter word)",
  EMMA: "🪄 Hint: She played Hermione in Harry Potter... (4 letter word)",
  BABE: "👶 Hint: A cute girl you like... (4 letter word)",
  MECH: "🤖 Hint: A machine... (4 letter word)",
  MUCH: "➕ Hint: A lot... (4 letter word)",
  HUE: "🎨 Hint: A tint of color... (3 letter word)"
};

const SEQUENCE_TIMEOUT = 2500; // 2.5 seconds to give more time

export default function VotingCards({ onVote, selectedValue, disabled, onSecretWizz, questionMarkColor, showNotification }: Props) {
  const [secretSequence, setSecretSequence] = useState<(number | string)[]>([]);
  const [lastInputTime, setLastInputTime] = useState<number>(0);
  const [currentSecretWord, setCurrentSecretWord] = useState<keyof typeof WORD_SEQUENCES>('CUBE');
  const [hintShown, setHintShown] = useState(false);

  // Set a random word sequence on component mount
  useEffect(() => {
    const words = Object.keys(WORD_SEQUENCES) as Array<keyof typeof WORD_SEQUENCES>;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setCurrentSecretWord(randomWord);
    // console.log('🎮 Secret word set to:', randomWord);
  }, []);

  const isSelected = (value: number | string) => {
    if (selectedValue === null || selectedValue === undefined) return false;
    if (selectedValue === -1 && value === '?') return true;
    return selectedValue === value;
  };

  const checkSecretSequence = useCallback((newSequence: (number | string)[]) => {
    const currentSequence = WORD_SEQUENCES[currentSecretWord];
    const sequenceLength = currentSequence.length;

    if (newSequence.length >= sequenceLength) {
      const lastElements = newSequence.slice(-sequenceLength);
      
      const matches = lastElements.every((value, index) => {
        // Convert string values to numbers for comparison
        const inputValue = value === '?' ? -1 : Number(value);
        return inputValue === currentSequence[index];
      });

      if (matches) {
        console.log(`🎮 Secret sequence matched! Word: ${currentSecretWord}`);
        if (onSecretWizz) {
          onSecretWizz(currentSecretWord);
        }
        return true;
      }
    }
    return false;
  }, [currentSecretWord, onSecretWizz]);

  const handleCardClick = (value: number | string) => {
    if (disabled) return;

    const now = Date.now();
    
    // Show hint when clicking '?' with matching colors instead of unlocking
    if (value === '?' && questionMarkColor && showNotification) {
      showNotification(WORD_HINTS[currentSecretWord]);
      setHintShown(true);
    }

    // Secret sequence handling
    if (now - lastInputTime > SEQUENCE_TIMEOUT) {
      setSecretSequence([value]);
    } else {
      const newSequence = [...secretSequence, value];
      setSecretSequence(newSequence);
      checkSecretSequence(newSequence);
    }
    setLastInputTime(now);

    // Regular voting functionality
    onVote(value);
  };

  return (
    <div className="voting-cards">
      {VOTING_VALUES.map((value) => (
        <motion.div
          key={value}
          className={`card ${isSelected(value) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
          whileHover={{ scale: 1.05 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
          onClick={() => handleCardClick(value)}
          initial={{ scale: 1 }}
          animate={{ scale: 1 }}
        >
          <div className="card-content">
            <span 
              className="card-value"
              style={value === '?' && questionMarkColor ? { color: questionMarkColor } : undefined}
            >
              {value}
            </span>
            {hintShown && (
              <span className="card-letter">
                {getLetterForNumber(value)}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
} 