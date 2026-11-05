import { useEffect } from 'react';
import { initializeBlockyMetroEngine } from '../game/BlockyMetroEngine';

export function useGameEngine() {
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      window.__BLOCKY_API_BASE = String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, '');
    }
    initializeBlockyMetroEngine();
  }, []);
}
