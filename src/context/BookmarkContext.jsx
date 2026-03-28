import { createContext, useContext, useState, useEffect } from 'react'
import { getBookmarksAPI, toggleBookmarkAPI } from '../api/bookmarks'
import { useAuth } from './AuthContext'

const BookmarkContext = createContext(null)

export function BookmarkProvider({ children }) {
  const [bookmarks, setBookmarks] = useState([])   // array of job_id numbers
  const { user } = useAuth()

  // Load bookmarks when user logs in
  useEffect(() => {
    if (user) {
      getBookmarksAPI()
        .then(data => setBookmarks(data.bookmarks))
        .catch(() => setBookmarks([]))
    } else {
      setBookmarks([])
    }
  }, [user])

  const toggleBookmark = async (jobId) => {
    if (!user) return { requiresLogin: true }

    try {
      const data = await toggleBookmarkAPI(jobId)
      setBookmarks(prev =>
        data.saved
          ? [...prev, jobId]
          : prev.filter(id => id !== jobId)
      )
      return { saved: data.saved }
    } catch (err) {
      console.error('Bookmark toggle error:', err)
    }
  }

  const isBookmarked = (jobId) => bookmarks.includes(jobId)

  return (
    <BookmarkContext.Provider value={{ bookmarks, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export const useBookmarks = () => useContext(BookmarkContext)