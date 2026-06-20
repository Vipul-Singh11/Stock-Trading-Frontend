import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../constants/storage.js';
import { loginUser, registerUser } from '../services/authService.js';
import { getCurrentUser } from '../services/userService.js';
import { getApiErrorMessage } from '../utils/formatters.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(token));
  const [authError, setAuthError] = useState('');

  const storeToken = useCallback((jwtToken) => {
    localStorage.setItem(TOKEN_KEY, jwtToken);
    setToken(jwtToken);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthError('');

    try {
      const authResponse = await loginUser(credentials);
      storeToken(authResponse.token);
      return await refreshCurrentUser();
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to sign in');
      setAuthError(message);
      throw new Error(message);
    }
  }, [refreshCurrentUser, storeToken]);

  const register = useCallback(async (payload) => {
    setAuthError('');

    try {
      const authResponse = await registerUser(payload);
      storeToken(authResponse.token);
      return await refreshCurrentUser();
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create account');
      setAuthError(message);
      throw new Error(message);
    }
  }, [refreshCurrentUser, storeToken]);

  useEffect(() => {
    let mounted = true;

    async function hydrateUser() {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        await refreshCurrentUser();
      } catch {
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    }

    hydrateUser();

    return () => {
      mounted = false;
    };
  }, [logout, refreshCurrentUser, token]);

  const value = useMemo(
    () => ({
      token,
      user,
      authError,
      isInitializing,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
      refreshCurrentUser,
    }),
    [authError, isInitializing, login, logout, refreshCurrentUser, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
