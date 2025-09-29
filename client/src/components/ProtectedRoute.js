import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useStore();
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;