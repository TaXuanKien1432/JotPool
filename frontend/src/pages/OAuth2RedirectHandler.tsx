import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../contexts/UserContext';
import { apiFetch } from '../services/api';
import type { UserDTO } from '../services/auth';


const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext)!;

    useEffect(() => {
        const handleRedirect = async () => {
            const queryParams = new URLSearchParams(window.location.search);
            const token = queryParams.get("token");
            if (!token) {
                navigate("/");
                return;
            }
            localStorage.setItem("accessToken", token);
            try {
                const userDTO = await apiFetch<UserDTO>("/auth/me", { method: "GET" });
                setUser(userDTO);
                const redirect = localStorage.getItem("oauth2Redirect");
                localStorage.removeItem("oauth2Redirect");
                navigate(redirect || "/home");
            } catch (err: any) {
                console.error("Failed to fetch user after OAuth2:", err);
                localStorage.removeItem("accessToken");
                navigate("/");
            }
        };

        handleRedirect();
    }, [navigate, setUser]);
    
    return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h2 className="text-lg font-semibold">Connecting your account...</h2>
      <p className="text-gray-500 text-sm">Please wait a moment.</p>
    </div>
  );
};

export default OAuth2RedirectHandler