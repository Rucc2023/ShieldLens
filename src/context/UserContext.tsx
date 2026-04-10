import { createContext } from 'react';

export interface UserContextType {
  userId: string | null;
  userRole: string | null;
  userName: string | null;   // <--- Agregado
  userEmail: string | null;
  loginUser: (id: string, role: string, name: string, email: string) => void;
  logout: () => void;
}

// Solo exportamos el contexto aquí
export const UserContext = createContext<UserContextType | undefined>(undefined);