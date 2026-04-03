import React, { useContext } from 'react'
import { UserContext } from '../contexts/UserContext'
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactNode}> = ({ children }) => {
    const { user, authChecked } = useContext(UserContext)!;
    const token = localStorage.getItem("accessToken");
    const location = useLocation();

    if (!authChecked) return <></>
    if (!token || !user) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
    return <>{children}</>
}

export default ProtectedRoute