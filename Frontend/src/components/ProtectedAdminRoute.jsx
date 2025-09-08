import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ProtectedAdminRoute({ children }) {
  const navigate = useNavigate()

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    
    if (!isAuthenticated || userRole !== 'admin') {
      navigate('/login')
    }
  }, [navigate])

  const userRole = localStorage.getItem('userRole')
  const isAuthenticated = localStorage.getItem('isAuthenticated')

  if (!isAuthenticated || userRole !== 'admin') {
    return null // or a loading spinner
  }

  return children
}
