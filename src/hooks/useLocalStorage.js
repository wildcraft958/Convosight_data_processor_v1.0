import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing state with localStorage persistence
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if key not found
 * @returns {[value, setValue, clearValue]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  const clearValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, clearValue]
}
