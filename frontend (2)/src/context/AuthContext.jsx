import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialUsers, initialRolesPermissions } from '../data/mock/usersData';
import { getStored, setStored, KEYS, initializeStorage } from '../services/storageService';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usersList, setUsersList] = useState(() => {
    initializeStorage();
    return getStored(KEYS.USERS, initialUsers);
  });

  const syncUsers = useCallback(() => {
    setUsersList(getStored(KEYS.USERS, initialUsers));
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('kers_active_user');
    return saved ? JSON.parse(saved) : (getStored(KEYS.USERS, initialUsers)[0] || initialUsers[0]);
  });

  // Persist authentication so refreshing a route keeps the user session
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('kers_is_authenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('kers_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Validate or initialize backend token on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res?.data?.user) {
            setCurrentUser(res.data.user);
            setIsAuthenticated(true);
            return;
          }
        } catch {
          // Token expired or invalid
        }
      }

      // Auto-authenticate with backend in dev if needed
      try {
        const loginRes = await apiClient.post('/auth/login', {
          email: currentUser?.email || 'carlos.m@vicustoms.com',
          password: 'Password123!',
        });
        if (loginRes?.data?.token) {
          apiClient.setToken(loginRes.data.token);
        }
      } catch (err) {
        console.warn('Backend auto-login notice:', err.message);
      }
    };

    initAuth();
  }, [currentUser?.email]);

  const login = async (emailOrId, password = 'Password123!') => {
    try {
      let email = emailOrId;
      if (!email.includes('@')) {
        const allUsers = getStored(KEYS.USERS, initialUsers);
        const match = allUsers.find(u => u.id === emailOrId);
        if (match?.email) email = match.email;
      }

      const res = await apiClient.post('/auth/login', {
        email: email,
        password: password || 'Password123!',
      });

      if (res?.data?.token) {
        apiClient.setToken(res.data.token);
        const authedUser = res.data.user;
        setCurrentUser(authedUser);
        setIsAuthenticated(true);
        localStorage.setItem('kers_is_authenticated', 'true');
        return authedUser;
      }
    } catch (err) {
      console.warn('Backend login fallback:', err.message);
    }

    const allUsers = getStored(KEYS.USERS, initialUsers);
    let found = allUsers.find(u => u.id === emailOrId || u.email.toLowerCase() === emailOrId.toLowerCase());
    if (!found) {
      found = allUsers[0] || initialUsers[0];
    }
    setCurrentUser(found);
    setIsAuthenticated(true);
    localStorage.setItem('kers_is_authenticated', 'true');
    return found;
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignored
    }
    apiClient.setToken(null);
    localStorage.removeItem('kers_is_authenticated');
    setIsAuthenticated(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState(null, '', '/login');
    }
  };

  const switchUser = async (userId) => {
    const allUsers = getStored(KEYS.USERS, initialUsers);
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      await login(found.email, 'Password123!');
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
