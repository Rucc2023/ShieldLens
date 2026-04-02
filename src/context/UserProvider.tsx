import React, { useState } from 'react';
import { UserContext } from './UserContext';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

  const loginUser = (id: string, role: string) => {
    setUserId(id);
    setUserRole(role);
    localStorage.setItem('userId', id);
    localStorage.setItem('userRole', role);
  };

  const logout = () => {
    setUserId(null);
    setUserRole(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ userId, userRole, loginUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};