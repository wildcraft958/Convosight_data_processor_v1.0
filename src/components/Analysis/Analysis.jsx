import React, { useState } from 'react'
import PostMatrix from './PostMatrix'
import MissingPosts from './MissingPosts'

// Lazy-load GenerateDataPoints to keep initial bundle small
const GenerateDataPointsLazy = React.lazy(() => import('./GenerateDataPoints'))

export default function Analysis() {
  const [activeSection, setActiveSection] = useState('matrix')

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSection('matrix')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeSection === 'matrix'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Post Matrix
        </button>
        <button
          onClick={() => setActiveSection('missing')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeSection === 'missing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Missing Posts
        </button>
        <button
          onClick={() => setActiveSection('generate')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeSection === 'generate'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Generate Data Points
        </button>
      </div>

      {activeSection === 'matrix' && <PostMatrix />}
      {activeSection === 'missing' && <MissingPosts />}
      {activeSection === 'generate' && (
        // lazy import replacement: simple dynamic import since component is small
        <React.Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
          <GenerateDataPointsLazy />
        </React.Suspense>
      )}
    </div>
  )
}