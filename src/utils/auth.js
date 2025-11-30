// Simple authentication utility
export const AUTH_KEY = 'ai_concierges_auth';

export const login = (username, password) => {
  // Hardcoded credentials
  if (username === 'admin' && password === 'admin') {
    const authData = {
      isAuthenticated: true,
      username: username,
      timestamp: Date.now()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

export const isAuthenticated = () => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return false;
  
  try {
    const parsed = JSON.parse(authData);
    return parsed.isAuthenticated === true;
  } catch {
    return false;
  }
};

export const getAuthData = () => {
  const authData = localStorage.getItem(AUTH_KEY);
  if (!authData) return null;
  
  try {
    return JSON.parse(authData);
  } catch {
    return null;
  }
};

