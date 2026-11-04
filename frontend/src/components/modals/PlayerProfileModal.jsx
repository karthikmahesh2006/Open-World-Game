import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGameContext } from '../../context/GameContext';

export default function PlayerProfileModal() {
  const { player, progress, login, register, logout, saveCloudProgress } = useAuth();
  const { profileModalOpen, setProfileModalOpen, missions } = useGameContext();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  if (!profileModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      if (isRegistering) {
        await register(username, email, password);
        setStatusMsg('Account created & synced with MongoDB!');
      } else {
        await login(username || email, password);
        setStatusMsg('Logged in & progress loaded!');
      }
    } catch (err) {
      setStatusMsg(err.message);
    }
  };

  const handleQuickSave = async () => {
    const splatsEl = document.getElementById('player-splats');
    const splats = splatsEl ? parseInt(splatsEl.textContent || '0', 10) : 0;
    await saveCloudProgress({ xpDelta: 50, coinsDelta: 25, stats: { totalPaintballSplats: splats } });
    setStatusMsg('Cloud progress synced to backend!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl p-6 max-w-lg w-full border border-cyan-500/40 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              Full-Stack Account &amp; Cloud Save
            </div>
            <h3 className="text-xl font-black text-white">
              {player ? ` Pilot ${player.username}` : 'Player Profile & Missions'}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setProfileModalOpen(false)}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-600"
          >
            ✕ Close
          </button>
        </div>

        {/* Player Level, XP & Coins Summary */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Level</div>
            <div className="text-2xl font-black text-cyan-300">{progress.level || 1}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total XP</div>
            <div className="text-2xl font-black text-emerald-400">{progress.xp || 0}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">Metro Coins</div>
            <div className="text-2xl font-black text-amber-300">{progress.coins || 250}</div>
          </div>
        </div>

        {/* Active City Missions */}
        <div className="mb-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
            Active City &amp; Arena Missions
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {missions.map((m) => (
              <div
                key={m.missionId}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{m.title}</div>
                  <div className="text-[11px] text-slate-400">{m.description}</div>
                </div>
                <div className="text-right font-mono font-bold text-amber-300 whitespace-nowrap ml-2">
                  +{m.rewardXp} XP / +{m.rewardCoins}c
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auth / Cloud Sync Section */}
        {!player ? (
          <form onSubmit={handleSubmit} className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-cyan-300">
              {isRegistering ? 'Register New Player Account (MongoDB)' : 'Sign In to Sync Progress'}
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              required
            />
            {isRegistering && (
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                required
              />
            )}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs"
              >
                {isRegistering ? 'Create Account' : 'Sign In'}
              </button>
              <button
                type="button"
                onClick={handleQuickSave}
                className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs"
              >
                💾 Save Progress Now
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Register'}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleQuickSave}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
            >
              💾 Sync Progress to MongoDB
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Sign Out
            </button>
          </div>
        )}

        {statusMsg && (
          <div className="mt-2.5 text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/40">
            {statusMsg}
          </div>
        )}
      </div>
    </div>
  );
}
