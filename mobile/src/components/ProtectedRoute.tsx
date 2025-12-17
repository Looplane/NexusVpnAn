import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <LoginScreen navigation={{ replace: () => {} }} />;
  }

  return <>{children}</>;
};

