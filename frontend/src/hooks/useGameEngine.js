import { useEffect } from 'react';
import { initializeBlockyMetroEngine } from '../game/BlockyMetroEngine';

export function useGameEngine() {
  useEffect(() => {
    initializeBlockyMetroEngine();
  }, []);
}
