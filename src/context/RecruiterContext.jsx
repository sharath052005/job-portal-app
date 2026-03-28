import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const RecruiterContext = createContext(null)

export function RecruiterProvider({ children }) {
  const { user } = useAuth()
  const isRecruiter = user?.role === 'recruiter'

  return (
    <RecruiterContext.Provider value={{ isRecruiter }}>
      {children}
    </RecruiterContext.Provider>
  )
}

export const useRecruiter = () => useContext(RecruiterContext)