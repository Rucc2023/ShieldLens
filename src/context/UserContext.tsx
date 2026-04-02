import { createContext } from 'react';

export interface UserContextType {
  userId: string | null;
  userRole: string | null;
  loginUser: (id: string, role: string) => void;
  logout: () => void;
}

// Solo exportamos el contexto aquí
export const UserContext = createContext<UserContextType | undefined>(undefined);