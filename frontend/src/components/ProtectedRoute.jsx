import React from 'react'
import { Navigate } from 'react-router-dom'
import { useGlobalContext } from '../context/AppContext';

const ProtectedRoute = ({children}) => {
     const { userData } = useGlobalContext();
     console.log("the user data in protected route is",userData);
     return userData ? children : <Navigate to="/"/>
}

export default ProtectedRoute
