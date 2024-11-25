import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { Session, Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
    apiKey: "AIzaSyCcGWH637uwJ_XgLIgLsR8UPVOTnClOir4",
    authDomain: "easypokerplaning.firebaseapp.com",
    projectId: "easypokerplaning",
    storageBucket: "easypokerplaning.firebasestorage.app",
    messagingSenderId: "443448604604",
    appId: "1:443448604604:web:68ebc8ae8cf69ad9aa5db9"
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