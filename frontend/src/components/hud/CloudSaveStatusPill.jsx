import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGameContext } from '../../context/GameContext';

export default function CloudSaveStatusPill() {
  const { player, progress } = useAuth();
  const { setProfileModalOpen } = useGameContext();

  return (
    <button
      type="button"
      onClick={() => setProfileModalOpen(true)}
      className="fixed bottom-28 right-3 z-30 glass-panel px-3.5 py-2 rounded-2xl border border-cyan-400/50 shadow-xl flex items-center gap-2.5 hover:bg-slate-800/90 transition"
      title="Open Player Profile, Missions, Inventory & MongoDB Cloud Save"
    >
      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
      <div className="text-left">
        <div className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
          {player ? player.username : 'Guest Pilot'} • Lv.{progress.level || 1}
        </div>
        <div className="text-[11px] font-bold text-slate-200">
          💾 Profile, Missions &amp; Save ({progress.coins || 250}c)
        </div>
      </div>
    </button>
  );
}
