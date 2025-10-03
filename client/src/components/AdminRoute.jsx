import React from 'react';
import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminRoute;