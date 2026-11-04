import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';

export default function DashboardPage() {
  const { player, progress } = useAuth();
  const { landmarks, vehicles, missions, setActiveTab } = useGameContext();

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/95 overflow-y-auto p-6 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-cyan-400">
              Full-Stack Command Center
            </div>
            <h1 className="text-2xl font-black text-white">
              Blocky Metro City Directory &amp; Player Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('world')}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
          >
            ▶ Return to 3D World
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-bold uppercase">Pilot Status</div>
            <div className="text-lg font-black text-white mt-1">
              {player ? player.username : 'Guest Player'} (Level {progress.level || 1})
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">
              {progress.xp || 0} XP • {progress.coins || 250} Metro Coins
            </div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-bold uppercase">Operational Fleet</div>
            <div className="text-lg font-black text-amber-300 mt-1">
              {vehicles.length} Vehicles Active
            </div>
            <div className="text-xs text-slate-300 mt-1">
              2 Taxis, Police Cruiser, Fire Engine, Ambulance &amp; Sky-Hawk Helicopter
            </div>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="text-xs text-slate-400 font-bold uppercase">Active Missions</div>
            <div className="text-lg font-black text-fuchsia-300 mt-1">
              {missions.length} City &amp; Arena Contracts
            </div>
            <div className="text-xs text-slate-300 mt-1">
              Synced via Express REST API &amp; MongoDB
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-2xl">
            <h2 className="text-sm font-black uppercase tracking-wider text-cyan-300 mb-3">
              Key Multi-Floor City Landmarks
            </h2>
            <div className="space-y-2 text-xs">
              {landmarks.map((lm) => (
                <div key={lm.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between">
                  <span className="font-bold text-white">{lm.name}</span>
                  <span className="text-slate-400 font-mono">
                    {lm.floors} Floors • ({lm.coords.x}, {lm.coords.z})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-300 mb-3">
              Operational Vehicles &amp; Spawn Coordinates
            </h2>
            <div className="space-y-2 text-xs">
              {vehicles.map((v) => (
                <div key={v.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between">
                  <span className="font-bold text-white">{v.name}</span>
                  <span className="text-emerald-300 font-mono">{v.location}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
