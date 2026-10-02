import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialUsers, initialRolesPermissions } from '../data/mock/usersData';
import { getStored, setStored, KEYS, initializeStorage } from '../services/storageService';
import { apiClient } from '../services/apiClient';
import { apiFetch, setAuthToken } from '../services/apiConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usersList, setUsersList] = useState(() => {
    initializeStorage();
    return getStored(KEYS.USERS, initialUsers);
  });

  const syncUsers = useCallback(async () => {
    try {
      const res = await apiClient.get('users');
      if (res && res.data) {
        const backendUsers = Array.isArray(res.data) ? res.data : (res.data.items || res.data.users || []);
        if (backendUsers.length > 0) {
          setUsersList(backendUsers);
          return;
        }
      }
    } catch {
      // Fallback to storage or initial
    }
    setUsersList(getStored(KEYS.USERS, initialUsers));
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kers_active_user');
    return saved ? JSON.parse(saved) : (getStored(KEYS.USERS, initialUsers)[0] || initialUsers[0]);
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const hasToken = !!localStorage.getItem('kers_token') || !!localStorage.getItem('kers_jwt_token');
    const wasAuth = localStorage.getItem('kers_is_authenticated') === 'true';
    return hasToken || wasAuth;
  });

  const persistToken = (token) => {
    if (token) {
      localStorage.setItem('kers_token', token);
      localStorage.setItem('kers_jwt_token', token);
      apiClient.setToken(token);
      setAuthToken(token);
    } else {
      localStorage.removeItem('kers_token');
      localStorage.removeItem('kers_jwt_token');
      apiClient.setToken(null);
      setAuthToken(null);
    }
  };

  // Validate server session on initial mount
  useEffect(() => {
    const checkServerSession = async () => {
      const token = apiClient.getToken() || localStorage.getItem('kers_token') || localStorage.getItem('kers_jwt_token');
      if (!token) return;

      persistToken(token);

      try {
        const res = await apiClient.get('auth/me');
        if (res && res.data) {
          setCurrentUser(res.data);
          setIsAuthenticated(true);
          localStorage.setItem('kers_active_user', JSON.stringify(res.data));
          localStorage.setItem('kers_is_authenticated', 'true');
        }
      } catch (err) {
        if (err.status === 401) {
          console.warn('[AuthContext] Stored token is invalid or expired. Resetting session.');
          persistToken(null);
          localStorage.removeItem('kers_is_authenticated');
          setIsAuthenticated(false);
        }
      }
    };

    checkServerSession();
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kers_active_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const fetchJwtToken = async (userObj) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userObj?.email || 'carlos.m@vicustoms.com',
          password: 'Password123!'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const token = data?.data?.token || data?.token;
        if (token) {
          persistToken(token);
        }
      }
    } catch (err) {
      console.warn('JWT login token notice:', err.message);
    }
  };

  const login = async (emailOrId, password = 'password123') => {
    const allUsers = getStored(KEYS.USERS, initialUsers);
    let targetUser = allUsers.find(
      u => u.id === emailOrId || u.email.toLowerCase() === String(emailOrId).toLowerCase()
    );

    const email = targetUser ? targetUser.email : emailOrId;
    const pwd = password || 'password123';

    try {
      const res = await apiClient.post('auth/login', { email, password: pwd });
      if (res && res.data && res.data.token) {
        persistToken(res.data.token);
        const loggedUser = res.data.user;
        setCurrentUser(loggedUser);
        setIsAuthenticated(true);
        localStorage.setItem('kers_is_authenticated', 'true');
        localStorage.setItem('kers_active_user', JSON.stringify(loggedUser));
        return loggedUser;
      }
    } catch (err) {
      console.warn('[AuthContext] Backend login call failed, falling back to local session:', err.message);
    }

    // Local fallback for offline/demo resilience
    const fallbackUser = targetUser || allUsers[0] || initialUsers[0];
    setCurrentUser(fallbackUser);
    setIsAuthenticated(true);
    localStorage.setItem('kers_is_authenticated', 'true');
    fetchJwtToken(fallbackUser);
    return fallbackUser;
  };

  const logout = async () => {
    try {
      if (apiClient.getToken()) {
        await apiClient.post('auth/logout');
      }
    } catch (err) {
      console.warn('[AuthContext] Server logout warning:', err.message);
    } finally {
      persistToken(null);
      localStorage.removeItem('kers_is_authenticated');
      localStorage.removeItem('kers_active_user');
      setIsAuthenticated(false);
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
    }
  };

  const switchUser = async (userId) => {
    const allUsers = getStored(KEYS.USERS, initialUsers);
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('kers_is_authenticated', 'true');
      localStorage.setItem('kers_active_user', JSON.stringify(found));
      await fetchJwtToken(found);
    }
  };

  const isAgent = currentUser?.roleKey === 'agent';
  const isSuperAdmin = currentUser?.roleKey === 'super_admin';
  const isOps = currentUser?.roleKey === 'operations' || isSuperAdmin;
  const isWarehouse = currentUser?.roleKey === 'warehouse';
  const isDocs = currentUser?.roleKey === 'documentation';

  const getRolePermissions = () => {
    const role = initialRolesPermissions.find(r => r.roleKey === currentUser?.roleKey);
    return role ? role.permissions : null;
  };

  const hasPermission = (module, action) => {
    if (isSuperAdmin) return true;
    const permissions = getRolePermissions();
    if (!permissions || !permissions[module]) return false;
    return !!permissions[module][action];
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole: currentUser?.roleKey || 'super_admin',
      isAuthenticated,
      isAgent,
      isSuperAdmin,
      isOps,
      isWarehouse,
      isDocs,
      usersList,
      rolesList: initialRolesPermissions,
      syncUsers,
      login,
      logout,
      switchUser,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
