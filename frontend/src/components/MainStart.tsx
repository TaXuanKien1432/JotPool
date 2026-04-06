import React from 'react'
import { Link } from 'react-router-dom'

const MainStart:React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full px-6 py-50 text-center space-y-8">
      <div className="font-extrabold text-6xl">Your ideas, in one pool</div>
      <div className="text-gray-600 text-2xl font-medium">JotPool is a connected workspace where private notes meet collaboration — with AI agents by your side.</div>
      <Link to="/signup" className="flex items-center justify-center px-4 py-2 h-15 w-60 text-center font-medium text-2xl text-white bg-jotpool rounded-lg hover:bg-blue-600">Get JotPool free</Link>
    </div>
  )
}

export default MainStart