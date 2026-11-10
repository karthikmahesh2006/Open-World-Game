import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGameContext } from '../../context/GameContext';

export default function CloudSaveStatusPill() {
  const { cloudStatus } = useAuth();
  const { activeTab, setActiveTab } = useGameContext();

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-auto hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/70 text-[10px] text-slate-300">
      <span className="text-emerald-400 font-bold">● Cloud: {cloudStatus}</span>
      <button
        type="button"
        onClick={() => setActiveTab(activeTab === 'dashboard' ? 'world' : 'dashboard')}
        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-600"
      >
        {activeTab === 'dashboard' ? 'Back to 3D World' : 'City Directory'}
      </button>
    </div>
  );
}
