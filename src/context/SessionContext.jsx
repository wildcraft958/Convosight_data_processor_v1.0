import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'

/**
 * Session context for managing global session state and reset
 */
const SessionContext = createContext()

export function SessionProvider({ children }) {
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Check if there's any session data stored
  useEffect(() => {
    const sessionDataExists = () => {
      const keysToIgnore = ['theme']
      const allKeys = Object.keys(localStorage)
      return allKeys.some(key => !keysToIgnore.includes(key))
    }
    setIsSessionActive(sessionDataExists())
  }, [])

  const handleNewSession = useCallback(() => {
    // Clear all localStorage keys except theme
    const keysToKeep = ['theme']
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        try {
          localStorage.removeItem(key)
        } catch (error) {
          console.warn(`Failed to clear localStorage key: ${key}`, error)
        }
      }
    })

    setIsSessionActive(false)
    // Force page refresh to reset all state
    window.location.reload()
  }, [])

  return (
    <SessionContext.Provider value={{ handleNewSession, isSessionActive }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
