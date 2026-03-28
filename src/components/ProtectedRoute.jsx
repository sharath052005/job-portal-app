import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, recruiterOnly = false }) {
  const { user, loading } = useAuth()

  // While checking auth — show nothing (prevents flash to login)
  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '68px'
    }}>
      <div className="profile-spinner" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  if (recruiterOnly && user.role !== 'recruiter') {
    return <Navigate to="/" replace />
  }

  return children
}