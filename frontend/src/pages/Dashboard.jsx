import React from 'react'
import { useGlobalContext } from '../context/AppContext'
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
   const {userData}=useGlobalContext();
   console.log("the user data in dashboard is",userData);
   
   if (!userData) {
      return <Navigate to="/" />;
   }
   
   const {role}=userData;
  return (
    <>
       {
          role === "admin" ? <Navigate to="/admin/dashboard"/> : <Navigate to="/employee/dashboard"/>
       }
    </>
  )
}

export default Dashboard
