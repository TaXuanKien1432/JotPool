import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Auth from './pages/Auth.tsx'
import './App.css'
import Home from './pages/Home.tsx'
import { UserContextProvider } from './contexts/UserContext.tsx'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import StartPage from './pages/StartPage.tsx'
import PublicRoute from './components/PublicRoute.tsx'

const router = createBrowserRouter([
  { path: "/", element: (
    <PublicRoute>
      <StartPage />
    </PublicRoute>) },
  { path: "/login", element: (
    <PublicRoute>
      <Auth />
    </PublicRoute>)},
  { path: "/signup", element: (
    <PublicRoute>
      <Auth />
    </PublicRoute>)},
  { path: "/home", element: (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  )},
  { path: "/home/:noteId", element: (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  )},
  { path: "/oauth2/redirect", element: <OAuth2RedirectHandler />}
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserContextProvider>
      <RouterProvider router = {router}/>
    </UserContextProvider>
  </StrictMode>,
)
