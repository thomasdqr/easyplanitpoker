# Easy Planning Poker

A modern, real-time Planning Poker application built with React, TypeScript, and Firebase. Perfect for Agile teams to estimate user stories collaboratively.

## ✨ Features

- **Real-time Collaboration**: Live voting sessions with instant updates
- **User Story Management**: Add, edit, and organize user stories with external links
- **Flexible Voting**: Support for Fibonacci and T-shirt sizing scales
- **Session Management**: Create sessions as a Product Manager or join existing ones
- **Participant Management**: Track connected participants and their voting status
- **Results Visualization**: Automatic calculation of average points and consensus
- **Dark/Light Theme**: Toggle between themes for better user experience
- **Sound Effects**: Audio feedback for interactive moments
- **Firebase Integration**: Real-time database and hosting

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd easyplanitpoker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase configuration:
   - Create a Firebase project
   - Add your Firebase config to `src/services/firebase.ts`
   - Set up Firestore database rules

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy to Firebase

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Material-UI (MUI)
- **Styling**: CSS Modules, Emotion
- **Animation**: Framer Motion
- **Routing**: React Router v7
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Peer-to-Peer**: PeerJS (for real-time features)

## 📁 Project Structure

```
src/
├── components/
│   ├── Session/          # Session-related components
│   │   ├── ParticipantList.tsx
│   │   ├── UserStoryList.tsx
│   │   ├── VotingCards.tsx
│   │   └── StoryIframeModal.tsx
│   └── common/           # Reusable components
│       ├── Button.tsx
│       ├── Hero.tsx
│       └── ThemeToggle.tsx
├── pages/                # Main application pages
│   ├── Home.tsx
│   ├── Session.tsx
│   └── JoinSession.tsx
├── hooks/                # Custom React hooks
│   ├── useSession.ts
│   └── useWizz.ts
├── services/             # External service integrations
│   └── firebase.ts
├── types/                # TypeScript type definitions
│   └── index.ts
├── constants/            # Application constants
│   └── voting.ts
└── styles/              # CSS and styling files
```

## 🎮 How to Use

### As a Product Manager:
1. Create a new session from the home page
2. Add user stories with titles and optional external links
3. Start voting on stories and reveal results when ready
4. Track participant votes and manage the session

### As a Team Member:
1. Join a session using the session ID
2. Enter your name to participate
3. Vote on active user stories using the card interface
4. View results when the PM reveals votes

## 🔧 Configuration

### Firebase Setup
Update `src/services/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

### Voting Scales
Modify voting options in `src/constants/voting.ts`:

```typescript
export const VOTING_OPTIONS = [0, 1, 2, 3, 5, 8, 13, 21];
```

## 🚀 Deployment

Deploy to Firebase:

```bash
npm run deploy
```

This command builds the project and deploys to Firebase Hosting using the configuration in `firebase.json`.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and not licensed for public use.
