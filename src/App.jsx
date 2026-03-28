import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import JobDetails from './pages/JobDetails'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PostJob from './pages/PostJob'
import Bookmarks from './pages/Bookmarks'
import Applications from './pages/Applications'
import Profile from './pages/Profile'
import RecruiterHome from './pages/recruiter/RecruiterHome'
import RecruiterProfile from './pages/recruiter/RecruiterProfile'
import RecruiterApplications from './pages/recruiter/RecruiterApplications'
import ProtectedRoute from './components/ProtectedRoute'
import useScrollToTop from './hooks/useScrollToTop'
import { useAuth } from './context/AuthContext'
import Chat from './pages/Chat'

function AppContent() {
  useScrollToTop()
  const { user, loading } = useAuth()
  const isRecruiter = user?.role === 'recruiter'

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/jobs"   element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Role-based home */}
          <Route path="/" element={
            !loading && isRecruiter ? <RecruiterHome /> : <Home />
          } />

          {/* Seeker protected */}
          <Route path="/bookmarks" element={
            <ProtectedRoute><Bookmarks /></ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute><Applications /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              {isRecruiter ? <RecruiterProfile /> : <Profile />}
            </ProtectedRoute>
          } />

          {/* Recruiter protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute recruiterOnly><Dashboard /></ProtectedRoute>
          } />
          <Route path="/post-job" element={
            <ProtectedRoute recruiterOnly><PostJob /></ProtectedRoute>
          } />
          <Route path="/recruiter/applications" element={
            <ProtectedRoute recruiterOnly><RecruiterApplications /></ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute><Chat /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}