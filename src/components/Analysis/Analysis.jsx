import React, { useState } from 'react'
import PostMatrix from './PostMatrix'
import MissingPosts from './MissingPosts'
import GenerateDataPoints from './GenerateDataPoints'
import UrlDeduplication from './UrlDeduplication'

export default function Analysis() {
  const [activeSection, setActiveSection] = useState('matrix')

  return (
    <div className="pb-4">
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveSection('matrix')}
          className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${
            activeSection === 'matrix'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Post Matrix
        </button>
        <button
          onClick={() => setActiveSection('missing')}
          className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${
            activeSection === 'missing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Missing Posts
        </button>
        <button
          onClick={() => setActiveSection('data-points')}
          className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${
            activeSection === 'data-points'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Generate Data Points
        </button>
        <button
          onClick={() => setActiveSection('url-deduplication')}
          className={`px-4 py-2 rounded-md font-medium whitespace-nowrap ${
            activeSection === 'url-deduplication'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          URL Deduplication
        </button>
      </div>

      {activeSection === 'matrix' && <PostMatrix />}
      {activeSection === 'missing' && <MissingPosts />}
      {activeSection === 'data-points' && <GenerateDataPoints />}
      {activeSection === 'url-deduplication' && <UrlDeduplication />}
    </div>
  )
}