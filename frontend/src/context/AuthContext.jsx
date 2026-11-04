import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUserProfile, loginUser, registerUser, logoutUser } from '../services/authService';
import { syncGameProgress } from '../services/progressService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [player, setPlayer] = useState(null);
  const [progress, setProgress] = useState({
    level: 1,
    xp: 0,
    coins: 250,
    stats: {
      paintballMatchesPlayed: 0,
      paintballMatchesWon: 0,
      totalPaintballSplats: 0,
      rooftopFootballGoals: 0,
      arcadeHighScore: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('blocky_metro_jwt');
    if (!token) {
      setLoading(false);
      return;
    }
    fetchUserProfile()
      .then((data) => {
        if (data.player) setPlayer(data.player);
        if (data.progress) setProgress(data.progress);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (usernameOrEmail, password) => {
    const data = await loginUser(usernameOrEmail, password);
    setPlayer(data.player);
    if (data.progress) setProgress(data.progress);
    return data;
  };

  const handleRegister = async (username, email, password) => {
    const data = await registerUser(username, email, password);
    setPlayer(data.player);
    if (data.progress) setProgress(data.progress);
    return data;
  };

  const handleLogout = () => {
    logoutUser();
    setPlayer(null);
  };

  const handleSaveCloudProgress = async (payload) => {
    const res = await syncGameProgress(payload);
    if (res && res.progress) setProgress(res.progress);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        player,
        progress,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        saveCloudProgress: handleSaveCloudProgress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
