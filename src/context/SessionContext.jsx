import React, { createContext, useContext, useCallback } from 'react'

/**
 * Session context for managing global session state and reset
 */
const SessionContext = createContext()

export function SessionProvider({ children }) {
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

    // Force page refresh to reset all state
    window.location.reload()
  }, [])

  return (
    <SessionContext.Provider value={{ handleNewSession }}>
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
