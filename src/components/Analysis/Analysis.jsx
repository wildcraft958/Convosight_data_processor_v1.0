import React, { useState } from 'react'
import PostMatrix from './PostMatrix'
import MissingPosts from './MissingPosts'

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
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Post Matrix
        </button>
        <button
          onClick={() => setActiveSection('missing')}
          className={`px-4 py-2 rounded-md font-medium ${
            activeSection === 'missing'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Missing Posts
        </button>
      </div>

      {activeSection === 'matrix' && <PostMatrix />}
      {activeSection === 'missing' && <MissingPosts />}
    </div>
  )
}