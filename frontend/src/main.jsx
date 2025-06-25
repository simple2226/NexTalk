import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import MainLayout from './MainLayout.jsx'
import SignUp from './SignUp.jsx'
import Login from './Login.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '',
        element: <MainLayout/>
      },
      {
        path: 'signup',
        element: <SignUp/>
      },
      {
        path: 'login',
        element: <Login/>,
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <>
    <RouterProvider router={router}/>
  </>,
)
