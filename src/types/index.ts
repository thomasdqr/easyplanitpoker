export interface UserStory {
  id: string;
  title: string;
  votes: Record<string, number>;
  status: 'pending' | 'voting' | 'completed';
  averagePoints?: number;
}

export interface Participant {
  id: string;
  name: string;
  isPM: boolean;
  currentVote: number | null;
  connected: boolean;
}

export interface Session {
  id: string;
  pmId: string;
  pmName: string;
  stories: UserStory[];
  participants: Participant[];
  currentStoryId: string | null;
  isVotingRevealed: boolean;
  createdAt: number;
} 