import { apiRequest } from './apiClient';

export async function syncCloudProgress(progressData) {
  return apiRequest('/progress/save', {
    method: 'POST',
    body: JSON.stringify(progressData)
  });
}

export async function fetchCloudProgress(username) {
  return apiRequest(`/progress/${encodeURIComponent(username)}`);
}
