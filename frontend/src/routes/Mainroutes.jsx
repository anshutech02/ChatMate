import React from 'react'
import {Route,Routes} from 'react-router-dom'
import Register from "../pages/Register"
import Login from '../pages/Login'
import HomePage from '../pages/HomePage'
import Dashboard from '../pages/Dashboard'

const Mainroutes = () => {
  return (
    <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/auth/dashboard' element={<Dashboard/>}/>

    </Routes>
  )
}

export default Mainroutes
