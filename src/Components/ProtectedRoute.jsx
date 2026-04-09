import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function ProtectedRoute({ children, managerOnly = false }) {
  const { token, user } = useAuthStore()

  if (!token) return <Navigate to="/login" replace />
  if (managerOnly && user?.role !== 'manager') return <Navigate to="/dashboard" replace />

  return children
}