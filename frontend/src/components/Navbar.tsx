import React from 'react'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <Link to="/" className='flex items-center space-x-2'>
            <img src={logo} alt="JotPool logo" className="h-10, w-10" />
            <span className="text-xl font-bold text-gray-800">JotPool</span>
        </Link>
        <div className="flex items-center space-x-4">
            <Link to="/login" className="px-4 py-2 font-medium rounded-lg hover:bg-gray-100">Log in</Link>
            <Link to="/signup" className="px-4 py-2 font-medium text-white bg-jotpool rounded-lg hover:bg-blue-600">Get JotPool free</Link>
        </div>
    </nav>
  )
}

export default Navbar