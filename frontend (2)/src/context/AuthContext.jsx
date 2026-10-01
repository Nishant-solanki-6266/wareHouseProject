import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initialUsers, initialRolesPermissions } from '../data/mock/usersData';
import { getStored, setStored, KEYS, initializeStorage } from '../services/storageService';

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

  const login = (emailOrId, password = '') => {
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

  const logout = () => {
    localStorage.removeItem('kers_is_authenticated');
    setIsAuthenticated(false);
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.history.replaceState(null, '', '/login');
    }
  };

  const switchUser = (userId) => {
    const allUsers = getStored(KEYS.USERS, initialUsers);
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthenticated(true);
      localStorage.setItem('kers_is_authenticated', 'true');
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
