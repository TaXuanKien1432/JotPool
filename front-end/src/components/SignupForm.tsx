import React, { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom';
import { register } from '../services/auth';
import Popup from './Popup';
import { UserContext } from '../contexts/UserContext';

const SignupForm:React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext)!;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        const userDTO = await register(name, email, password);
        setUser(userDTO);
        navigate(redirect ? redirect : "/home");
      } catch (err: any) {
        console.log(err);
        setError(err.message || "Signup failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
    <div className="flex flex-col justify-center items-center">
        <div className='mb-3 font-bold text-lg'>Create your JotPool account</div>
        {error && <Popup message={error} type="error" onClose={() => setError(null)} />}
        <form onSubmit={handleSignup} className='w-100 flex flex-col space-y-3'>
            <input
                type="text"
                placeholder='Full name'
                className='input-field'
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="email"
                placeholder='Email'
                className='input-field'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder='Password'
                className='input-field'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder='Confirm Password'
                className='input-field'
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type='submit' disabled={loading} className='btn-primary'>Sign up</button>
        </form>
    </div>
  )
}

export default SignupForm