import { apiRequest } from './apiClient';

export async function registerUser(username, email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
  if (data.token) {
    localStorage.setItem('blocky_metro_jwt', data.token);
  }
  return data;
}

export async function loginUser(usernameOrEmail, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ usernameOrEmail, password })
  });
  if (data.token) {
    localStorage.setItem('blocky_metro_jwt', data.token);
  }
  return data;
}

export async function fetchUserProfile() {
  return apiRequest('/auth/profile');
}

export async function saveUserSettings(settings, lastKnownPosition) {
  return apiRequest('/auth/settings', {
    method: 'PUT',
    body: JSON.stringify({ settings, lastKnownPosition })
  });
}

export function logoutUser() {
  localStorage.removeItem('blocky_metro_jwt');
}
