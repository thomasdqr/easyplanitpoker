import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc } from 'firebase/firestore';
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

// Add constants for cleanup thresholds
const MAX_SESSIONS = 30;
const MAX_SESSION_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Add cleanup function
async function cleanupOldSessions() {
  try {
    const now = Date.now();
    const sessionsRef = collection(db, 'sessions');

    // Delete sessions older than 7 days
    const oldSessionsQuery = query(
      sessionsRef,
      where('createdAt', '<', now - MAX_SESSION_AGE_MS)
    );
    const oldSessionsSnap = await getDocs(oldSessionsQuery);
    
    // First check total number of sessions
    const totalSessionsQuery = query(sessionsRef);
    const totalSessionsSnap = await getDocs(totalSessionsQuery);
    
    let sessionsToDelete = new Set(oldSessionsSnap.docs.map(doc => doc.id));

    // Only check for MAX_SESSIONS limit if we have more than MAX_SESSIONS
    if (totalSessionsSnap.size > MAX_SESSIONS) {
      const excessSessions = query(
        sessionsRef,
        orderBy('createdAt', 'asc'),
        limit(totalSessionsSnap.size - MAX_SESSIONS)
      );
      const excessSessionsSnap = await getDocs(excessSessions);
      
      excessSessionsSnap.docs.forEach(doc => {
        sessionsToDelete.add(doc.id);
      });
    }

    if (sessionsToDelete.size > 0) {
      // Delete all identified sessions
      const deletePromises = Array.from(sessionsToDelete).map(sessionId =>
        deleteDoc(doc(db, 'sessions', sessionId))
      );
      
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${sessionsToDelete.size} old sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up old sessions:', error);
  }
}

export async function createSession(pmName: string): Promise<{ sessionId: string; pmId: string }> {
  // Clean up old sessions before creating a new one
  await cleanupOldSessions();

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