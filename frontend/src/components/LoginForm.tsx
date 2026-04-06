import React, { useContext, useState } from 'react'
import { login } from '../services/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Popup from './Popup';
import { UserContext } from '../contexts/UserContext';

const LoginForm:React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext)!;
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userDTO = await login(email, password);
      setUser(userDTO);
      navigate(redirect ? redirect : "/home");
    } catch (err: any) {
      console.log(err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="flex flex-col justify-center items-center">
        <div className='mb-3 font-bold text-lg'>Login to your JotPool account</div>
        {error && <Popup message={error} type="error" onClose={() => setError(null)} />}
        <form onSubmit={handleLogin} className='w-100 flex flex-col space-y-3'>
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
            <button type="submit" disabled={loading} className='btn-primary'>Log in</button>
        </form>
    </div>
  )
}

export default LoginForm