import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Session, Participant } from '../types';
import { v4 as uuidv4 } from 'uuid';

const firebaseConfig = {
  apiKey: "AIzaSyAC7i1ZCM1I6GCGTca12GKhP_mTogRS30c",
  authDomain: "simplepokerplanning.firebaseapp.com",
  projectId: "simplepokerplanning",
  storageBucket: "simplepokerplanning.firebasestorage.app",
  messagingSenderId: "349015261368",
  appId: "1:349015261368:web:7cdcbf9a744c2d289c344d"
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