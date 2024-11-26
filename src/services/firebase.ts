import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Session, Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function createSession(pmName: string): Promise<{ sessionId: string; pmId: string }> {
  const sessionId = uuidv4();
  const pmId = uuidv4();

  const pmParticipant: Participant = {
    id: pmId,
    name: pmName,
    isPM: true,
    currentVote: null,
    connected: true
  };

  const sessionData: Session = {
    id: sessionId,
    pmId,
    pmName,
    stories: [],
    participants: [pmParticipant],
    currentStoryId: null,
    isVotingRevealed: false,
    createdAt: Date.now()
  };

  await setDoc(doc(db, 'sessions', sessionId), sessionData);

  return { sessionId, pmId };
} 