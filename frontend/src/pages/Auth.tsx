import React from 'react'
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import logo from '../assets/logo.png'
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Auth:React.FC = () => {
  const isLogin = useLocation().pathname.startsWith("/login");
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect");

  const startGoogleOAuth = () => {
    if (redirect) localStorage.setItem("oauth2Redirect", redirect);
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  const startGithubOAuth = () => {
    if (redirect) localStorage.setItem("oauth2Redirect", redirect);
    window.location.href = `${API_BASE_URL}/oauth2/authorization/github`;
  };
  
  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center'>
      <img src={logo} className='w-15'></img>
      {isLogin ? <LoginForm /> : <SignupForm />}
      {isLogin ? 
        <div className='w-100 flex items-center justify-center gap-x-1 mt-3'>
          <div>New user?</div>
          <Link to={redirect ? `/signup?redirect=${redirect}` : "/signup"} className='text-jotpool hover:underline'>Sign up</Link>
        </div> :
        <div className='w-100 flex items-center justify-center gap-x-1 mt-3'>
          <div>Already have an account?</div>
          <Link to={redirect ? `/login?redirect=${redirect}` : "/login"} className='text-jotpool hover:underline'>Log in</Link>
        </div>}
      <div className='w-100 flex items-center justify-center my-6 space-x-2'>
        <div className='flex-grow border-t border-gray-300'></div>
        <div className='text-muted'>OR</div>
        <div className='flex-grow border-t border-gray-300'></div>
      </div>
        <div className='w-100 flex flex-col gap-y-3'>
          <button onClick={startGoogleOAuth} className='btn-oauth'>
            <FcGoogle className='text-xl absolute left-3'/>
            <div>Continue with Google</div>
          </button>
          <button onClick={startGithubOAuth} className='btn-oauth'>
            <FaGithub className='text-xl absolute left-3'/>
            <div>Continue with GitHub</div>
          </button>
        </div>
    </div>
  )
}

export default Auth