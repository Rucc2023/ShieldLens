import React, { useState } from 'react';
import { UserContext } from './UserContext';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName')); // <--- Agregado
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail')); // <--- Agregado

  const loginUser = (id: string, role: string, name: string, email: string) => {
    setUserId(id);
    setUserRole(role);
    setUserName(name)
    setUserEmail(email)
    localStorage.setItem('userId', id);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name); // <--- Agregado
    localStorage.setItem('userEmail', email); // <--- Agregado
  };

  const logout = () => {
    setUserId(null);
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);

    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName'); // <--- Agregado
    localStorage.removeItem('userEmail'); // <--- Agregado
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ userId, userRole, userName, userEmail, loginUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};