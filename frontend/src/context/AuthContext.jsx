import React, { createContext, useContext, useState } from 'react';
import { loginPilot } from '../services/authService';
import { syncCloudProgress } from '../services/progressService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ username: 'MetroPilot' });
  const [cloudStatus, setCloudStatus] = useState('Ready');

  async function loginAndSync(username, stats = {}) {
    try {
      setCloudStatus('Syncing...');
      const res = await loginPilot(username);
      setUser({ username });
      await syncCloudProgress({ username, ...stats });
      setCloudStatus('Synced');
      return res;
    } catch (err) {
      setCloudStatus('Local Backup');
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, cloudStatus, loginAndSync }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
