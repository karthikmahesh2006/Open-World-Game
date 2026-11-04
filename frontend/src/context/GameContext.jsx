import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_MISSIONS, OPERATIONAL_VEHICLES, CITY_LANDMARKS } from '../assets/gameCatalog';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [activeTab, setActiveTab] = useState('world'); // 'world' | 'dashboard'
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [missions] = useState(DEFAULT_MISSIONS);

  return (
    <GameContext.Provider
      value={{
        activeTab,
        setActiveTab,
        profileModalOpen,
        setProfileModalOpen,
        missions,
        vehicles: OPERATIONAL_VEHICLES,
        landmarks: CITY_LANDMARKS
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
