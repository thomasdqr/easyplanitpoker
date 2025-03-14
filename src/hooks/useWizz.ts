import { useState, useEffect, useRef, useCallback } from 'react';

interface WizzState {
  isWizzing: boolean;
  targetParticipantId: string | null;
}

interface ParticipantClickTracker {
  [participantId: string]: {
    timestamps: number[];
    isDisabled: boolean;
  };
}

export default function useWizz() {
  const [wizzState, setWizzState] = useState<WizzState>({
    isWizzing: false,
    targetParticipantId: null
  });
  const [wizzAudio, setWizzAudio] = useState<HTMLAudioElement | null>(null);
  const [disabledParticipants, setDisabledParticipants] = useState<Record<string, boolean>>({});
  const participantClicksRef = useRef<ParticipantClickTracker>({});
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    // Create the audio element for the wizz sound
    const audio = new Audio('/wizz.mp3');
    setWizzAudio(audio);

    return () => {
      if (wizzAudio) {
        wizzAudio.pause();
        wizzAudio.currentTime = 0;
      }
      
      // Clear any pending timeouts
      Object.values(timeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

  const checkSpamForParticipant = useCallback((participantId: string) => {
    const now = Date.now();
    
    // Initialize tracking for this participant if it doesn't exist
    if (!participantClicksRef.current[participantId]) {
      participantClicksRef.current[participantId] = {
        timestamps: [],
        isDisabled: false
      };
    }
    
    const participantTracker = participantClicksRef.current[participantId];
    
    // Add current timestamp
    participantTracker.timestamps.push(now);
    
    // Only keep timestamps from the last 3 seconds
    participantTracker.timestamps = participantTracker.timestamps.filter(
      timestamp => now - timestamp < 3000
    );
    
    console.log(`[PM] Participant ${participantId} has ${participantTracker.timestamps.length} clicks in the last 3 seconds`);
    
    // If we have more than 3 clicks in the last 3 seconds, disable the button for this participant
    if (participantTracker.timestamps.length >= 3) {
      participantTracker.isDisabled = true;
      
      // Update the state to reflect the disabled status
      setDisabledParticipants(prev => {
        const updated = { ...prev };
        updated[participantId] = true;
        return updated;
      });
      
      console.log(`[PM] DISABLED wizz button for participant ${participantId} due to spam (${participantTracker.timestamps.length} clicks in 3s)`);
      
      // Clear any existing timeout for this participant
      if (timeoutsRef.current[participantId]) {
        clearTimeout(timeoutsRef.current[participantId]);
      }
      
      // Re-enable after 5 seconds
      timeoutsRef.current[participantId] = setTimeout(() => {
        // Reset the tracker
        if (participantClicksRef.current[participantId]) {
          participantClicksRef.current[participantId].isDisabled = false;
          participantClicksRef.current[participantId].timestamps = [];
        }
        
        // Update the state
        setDisabledParticipants(prev => {
          const updated = { ...prev };
          delete updated[participantId];
          return updated;
        });
        
        console.log(`[PM] RE-ENABLED wizz button for participant ${participantId} after 5s cooldown`);
        
        // Clear the timeout reference
        delete timeoutsRef.current[participantId];
      }, 5000);

      return true; // Return true to indicate the participant is now disabled
    }
    
    return false; // Return false to indicate the participant is not disabled
  }, []);

  const sendWizz = useCallback((participantId: string) => {
    // Check if wizz is disabled for this participant
    if (disabledParticipants[participantId]) {
      console.log(`[Client] Wizz attempt BLOCKED for participant ${participantId} - button is disabled`);
      return;
    }
    
    // Check for spam for this specific participant
    const isNowDisabled = checkSpamForParticipant(participantId);
    
    // If the participant is now disabled after the check, don't proceed
    if (isNowDisabled) {
      console.log(`[Client] Wizz attempt BLOCKED for participant ${participantId} - just disabled due to spam check`);
      return;
    }
    
    console.log(`[Client] Playing wizz animation and sound for participant ${participantId}`);
    
    // Play the sound
    if (wizzAudio) {
      wizzAudio.pause();
      wizzAudio.currentTime = 0;
      wizzAudio.play().catch(e => console.error('Error playing wizz sound:', e));
    }

    // Start the animation
    setWizzState({
      isWizzing: true,
      targetParticipantId: participantId
    });

    // Add the animation class to the body for the screen shake effect
    document.body.classList.add('wizz-effect');

    // Reset after animation finishes
    setTimeout(() => {
      setWizzState({
        isWizzing: false,
        targetParticipantId: null
      });
      document.body.classList.remove('wizz-effect');
    }, 800); // Match the animation duration
  }, [wizzAudio, disabledParticipants, checkSpamForParticipant]);

  const isParticipantWizzDisabled = useCallback((participantId: string) => {
    const isDisabled = !!disabledParticipants[participantId];
    if (isDisabled) {
      console.log(`[PM] Checking if participant ${participantId} is disabled: YES`);
    }
    return isDisabled;
  }, [disabledParticipants]);

  return { 
    sendWizz,
    isWizzing: wizzState.isWizzing,
    targetParticipantId: wizzState.targetParticipantId,
    isParticipantWizzDisabled,
    checkSpamForParticipant
  };
} 