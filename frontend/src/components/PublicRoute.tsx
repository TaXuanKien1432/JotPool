import React, { useContext } from 'react'
import { UserContext } from '../contexts/UserContext';
import { Navigate } from 'react-router-dom';

const PublicRoute:React.FC<{children: React.ReactNode}> = ({children}) => {
    const { user, authChecked } = useContext(UserContext)!;
    const token = localStorage.getItem("accessToken");
    if (!authChecked) return <></>
    if (user && token) return <Navigate to="/home" replace />
    return <>{children}</>
}

export default PublicRoute