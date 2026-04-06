import React from 'react'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

const Footer:React.FC = () => {
  return (
    <footer className="w-full px-6 py-10 bg-gray-50 flex justify-between">
        <section className='flex flex-col items-center justify-evenly'>
            <Link to="/" className='flex items-center justify-center flex-wrap px-1 py-1'>
                <img src={logo} className='w-20'></img>
                <div className='font-bold text-2xl'>JotPool</div>
            </Link>
            <div className='text-gray-400'>© {new Date().getFullYear()} JotPool.</div>
        </section>
        <section>
            <div className='font-bold text-lg mb-2'>Contact</div>
            <div className='space-y-3'>
                <div>
                    <div>Address:</div>
                    <div>30 Nanyang Link, Singapore</div>
                </div>
                <div>
                    <div>Phone:</div>
                    <div>+6586175073</div>
                </div>
                <div>
                    <div>Email:</div>
                    <div>kienkonvip@gmail.com</div>
                </div>
            </div>
        </section>
        <section>
            <div className='font-bold text-lg mb-2'>Social Media</div>
            <div className='space-y-1'>
                <a href='https://www.facebook.com/shxxkien1432/'
                 target='_blank' 
                 rel="noopener noreferrer"
                 className='block hover:underline'>
                Facebook
                </a>
                <a href='https://www.instagram.com/shxxkien1432/'
                 target='_blank' 
                 rel="noopener noreferrer"
                 className='block hover:underline'>
                Instagram
                </a>
                <a href='https://www.linkedin.com/in/kien-ta-xuan/'
                 target='_blank' 
                 rel="noopener noreferrer"
                 className='block hover:underline'>
                LinkedIn
                </a>
                <a href='https://github.com/TaXuanKien1432'
                 target='_blank' 
                 rel="noopener noreferrer"
                 className='block hover:underline'>
                GitHub
                </a>
            </div>
        </section>
    </footer>
  )
}

export default Footer