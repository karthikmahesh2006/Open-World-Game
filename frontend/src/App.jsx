import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import GameWorldPage from './pages/GameWorldPage';

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <GameWorldPage />
      </GameProvider>
    </AuthProvider>
  );
}
