import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { BookmarkProvider } from './context/BookmarkContext.jsx'
import { RecruiterProvider } from './context/RecruiterContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RecruiterProvider>
        <BookmarkProvider>
          <App />
        </BookmarkProvider>
      </RecruiterProvider>
    </AuthProvider>
  </StrictMode>,
)