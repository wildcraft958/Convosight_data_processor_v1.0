import React, { useState, useEffect } from 'react'
import logo from '../logo.webp'
import DataCreation from './components/DataCreation/DataCreation'
import CVICreation from './components/CVICreation/CVICreation'
import Analysis from './components/Analysis/Analysis'
import Overview from './components/common/Overview'
import { useSession } from './context/SessionContext'
import SessionIndicator from './components/common/SessionIndicator'
import ConfirmModal from './components/common/ConfirmModal'

export default function App() {
  const [activeTab, setActiveTab] = useState('data-creation')
  const { handleNewSession, isSessionActive } = useSession()
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const TabButton = ({ id, children }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
        activeTab === id
          ? 'bg-primary-500 text-white shadow'
            : 'bg-[var(--surface)] text-gray-700 hover:bg-gray-50 dark:bg-[var(--surface)] dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen">
      <header className="bg-transparent pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Convosight" className="w-10 h-10 rounded-md object-cover shadow-sm" />
            <div>
              <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">Convosight</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Data Processor v1.0</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isSessionActive ? (
              <SessionIndicator isActive={isSessionActive} />
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">Ready</div>
            )}
            <button
              onClick={() => setShowConfirmModal(true)}
              title="Clear all session data and start fresh"
              className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
            >
              New Session
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
              <TabButton id="data-creation">Data Creation</TabButton>
              <TabButton id="cvi-creation">CVI Creation</TabButton>
              <TabButton id="analysis">Analysis</TabButton>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tip: Use drag & drop for uploads</div>
          </div>
        </div>

        <main>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="card p-6">
                {activeTab === 'data-creation' && <DataCreation />}
                {activeTab === 'cvi-creation' && <CVICreation />}
                {activeTab === 'analysis' && <Analysis />}
              </div>
            </div>
            <Overview activeTab={activeTab} />
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        title="Start New Session?"
        message="All unsaved work and session data will be lost. Your theme preference will be preserved. Are you sure?"
        confirmText="Yes, Start New Session"
        cancelText="Cancel"
        onConfirm={handleNewSession}
        onCancel={() => setShowConfirmModal(false)}
        isDangerous={true}
      />
    </div>
  )
}

function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved) return saved
    } catch (e) {}
    // default to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      try { localStorage.setItem('theme', 'dark') } catch (e) {}
    } else {
      root.classList.remove('dark')
      try { localStorage.setItem('theme', 'light') } catch (e) {}
    }
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title="Toggle light / dark"
      className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[var(--surface)] dark:bg-[var(--surface)] border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow focus:outline-none"
    >
      {theme === 'dark' ? (
        // sun icon for dark (show sun to indicate switching to light)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M5 19l-1.5 1.5M20.5 3.5 19 5" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
      ) : (
        // moon icon for light (show moon to indicate switching to dark)
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )
}