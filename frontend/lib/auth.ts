// Authentication utilities

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getUserFromStorage(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('auth_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function setUserInStorage(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }
}

export function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
