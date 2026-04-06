import { createContext, useEffect, useState, type ReactNode } from "react";
import type { UserDTO } from "../services/auth";
import { apiFetch } from "../services/api";

interface UserContextType {
    user: UserDTO | null;
    setUser: (user: UserDTO | null) => void;
    authChecked: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({children}: { children: ReactNode}) => {
    const [user, setUser] = useState<UserDTO | null>(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setAuthChecked(true);
            return;
        }

        apiFetch<UserDTO>("/auth/me", { method: "GET" })
        .then(setUser)
        .catch((err: any) => {
            console.error("An error occurred:", err);
            localStorage.removeItem("accessToken");
            setUser(null);
        })
        .finally(() => setAuthChecked(true));
    }, []);

    return (
        <UserContext.Provider value={{user, setUser, authChecked}}>
            {children}
        </UserContext.Provider>
    )
}
