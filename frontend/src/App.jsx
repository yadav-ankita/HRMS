import { useState } from 'react'
import './App.css'
import { Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Singup from './pages/Singup'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import Dashboard from './pages/Dashboard'
function App() {
  return (
    <>
      <Routes>
         {/* Public  */}
        <Route path="/" element={<Home/>} />
        <Route path="/Login" element={<Login/>} />
        <Route path='/Signup' element={<Singup/>}/>
         {/* Private  */}
         <Route path='/Dashboard' element={<Dashboard/>}/>
         <Route  path='/admin/dashboard' element={<AdminDashboard/>}/>
         <Route  path='/employee/dashboard' element={<EmployeeDashboard/>}/>
      </Routes>
    </>
  )
}
export default App
