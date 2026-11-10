import { apiRequest } from './apiClient';

export async function loginPilot(username, password = 'default_password') {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}
