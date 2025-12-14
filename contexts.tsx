
import { createContext, useContext } from 'react';
import { User, ToastType } from './types';

// --- Theme Context ---
export interface ThemeContextType { isDark: boolean; toggleTheme: () => void; }
export const ThemeContext = createContext<ThemeContextType | null>(null);
export const useTheme = () => { 
    const context = useContext(ThemeContext); 
    if (!context) throw new Error("useTheme error"); 
    return context; 
};

// --- Toast Context ---
export interface ToastContextType { addToast: (type: ToastType, message: string) => void; }
export const ToastContext = createContext<ToastContextType | null>(null);
export const useToast = () => { 
    const context = useContext(ToastContext); 
    if (!context) throw new Error("useToast error"); 
    return context; 
};

// --- Auth Context ---
export interface AuthContextType {
  user: User | null;
  login: (e: string, p: string, c?: string) => Promise<{requires2fa?: boolean} | void>;
  register: (e: string, p: string) => Promise<void>;
  logout: () => void;
  updateUser: (u: User) => void;
  isLoading: boolean;
}
export const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => { 
    const context = useContext(AuthContext); 
    if (!context) throw new Error('useAuth error'); 
    return context; 
};
