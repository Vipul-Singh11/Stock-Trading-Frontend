import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { TOKEN_KEY } from '../constants/storage.js';
import { getCurrentUser, loginUser, registerUser } from '../services/authService.js';
import { getApiErrorMessage } from '../utils/formatters.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(Boolean(token));
  const [authError, setAuthError] = useState('');

  const storeToken = (jwtToken) => {
    localStorage.setItem(TOKEN_KEY, jwtToken);
    setToken(jwtToken);
  };

  const login = async (credentials) => {
    setAuthError('');

    try {
      const authResponse = await loginUser(credentials);
      storeToken(authResponse.token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to sign in');
      setAuthError(message);
      throw new Error(message);
    }
  };

  const register = async (payload) => {
    setAuthError('');

    try {
      const authResponse = await registerUser(payload);
      storeToken(authResponse.token);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to create account');
      setAuthError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    let mounted = true;

    async function hydrateUser() {
      if (!token) {
        setIsInitializing(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (mounted) {
          setUser(currentUser);
        }
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
  }, [token]);

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
    }),
    [authError, isInitializing, token, user],
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
