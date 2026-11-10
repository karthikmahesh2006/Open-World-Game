import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { districts, setActiveTab } = useGameContext();

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl p-6 max-w-lg w-full border border-cyan-500/40 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase font-black text-cyan-400 tracking-widest">
              Pilot: {user.username}
            </div>
            <h2 className="text-xl font-black text-white">Blocky Metro District Directory</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('world')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-600"
          >
            ✕ Close
          </button>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
          {districts.map((d) => (
            <div key={d.id} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700 flex justify-between">
              <span className="font-bold text-white">{d.name}</span>
              <span className="font-mono text-cyan-300">({d.coords})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
