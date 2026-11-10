import React, { createContext, useContext, useState } from 'react';
import { CITY_DISTRICTS } from '../assets/gameCatalog';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [activeTab, setActiveTab] = useState('world');

  return (
    <GameContext.Provider value={{ activeTab, setActiveTab, districts: CITY_DISTRICTS }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  return useContext(GameContext);
}
