import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGameContext } from '../../context/GameContext';

export default function PlayerProfileModal() {
  useAuth();
  useGameContext();
  return null;
}
