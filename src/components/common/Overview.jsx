import React, { useState } from 'react'

export default function Overview({ activeTab }) {
  const [expandedGuide, setExpandedGuide] = useState(0)

  const guides = [
    {
      title: 'Data Creation',
      icon: '📋',
      steps: [
        { num: 1, title: 'Extract Usernames', desc: 'Upload Instagram posts JSON to extract unique usernames' },
        { num: 2, title: 'Create Table', desc: 'Combine Instagram posts, followers, YouTube, and TikTok data' },
        { num: 3, title: 'Match & Fill', desc: 'Fill missing data by matching with reference tables' },
        { num: 4, title: 'Final Category', desc: 'Categorize posts with inferred final categories' }
      ]
    },
    {
      title: 'CVI Creation',
      icon: '📊',
      steps: [
        { num: 1, title: 'Upload Files', desc: 'Upload Excel or CSV files containing CVI data' },
        { num: 2, title: 'Process', desc: 'System processes and standardizes the CVI table' },
        { num: 3, title: 'Preview', desc: 'Review the processed data before download' },
        { num: 4, title: 'Download', desc: 'Export the standardized CVI table as CSV' }
      ]
    },
    {
      title: 'Analysis',
      icon: '📈',
      steps: [
        { num: 1, title: 'Post Matrix', desc: 'Build a matrix of posts across regions and sources' },
        { num: 2, title: 'Missing Posts', desc: 'Identify posts that are missing from the data' },
        { num: 3, title: 'Data Points', desc: 'Generate comprehensive metrics for each brand' }
      ]
    }
  ]

  const tips = [
    { icon: '💡', title: 'Use Drag & Drop', desc: 'Upload files quickly by dragging them into upload zones' },
    { icon: '🔄', title: 'Session Persistence', desc: 'Your work is automatically saved. Use "New Session" to start fresh' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Toggle between light and dark themes for comfortable viewing' },
    { icon: '💾', title: 'Download Results', desc: 'All results can be downloaded as CSV for further analysis' },
    { icon: '✨', title: 'Auto-detect Brands', desc: 'In Generate Data Points, use "Auto-detect from data" for quick setup' },
    { icon: '⚡', title: 'Process Large Files', desc: 'The tool handles CSV and Excel files efficiently' }
  ]

  const currentGuide = guides.find(g => {
    if (activeTab === 'data-creation') return g.title === 'Data Creation'
    if (activeTab === 'cvi-creation') return g.title === 'CVI Creation'
    if (activeTab === 'analysis') return g.title === 'Analysis'
  })

  return (
    <aside className="lg:col-span-4">
      <div className="space-y-3 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
        {/* Current Guide - Compact */}
        {currentGuide && (
          <div className="card p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800 border border-indigo-200 dark:border-indigo-700">
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
              <span className="text-xl">{currentGuide.icon}</span>
              {currentGuide.title}
            </h3>
            <div className="space-y-1">
              {currentGuide.steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setExpandedGuide(expandedGuide === idx ? -1 : idx)}
                  className="cursor-pointer p-2 rounded bg-white dark:bg-indigo-950 hover:shadow-sm transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 flex-1">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{step.title}</div>
                        {expandedGuide === idx && (
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">{step.desc}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips & Tricks - Compact Grid */}
        <div className="card p-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900 dark:to-teal-900 border border-emerald-200 dark:border-emerald-700">
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100 mb-2">💡 Quick Tips</h3>
          <div className="grid grid-cols-2 gap-1.5">
            {tips.slice(0, 4).map((tip, idx) => (
              <div key={idx} className="p-2 rounded bg-white dark:bg-emerald-950 text-xs hover:shadow-sm transition-all">
                <div className="text-lg mb-1">{tip.icon}</div>
                <div className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{tip.title}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">{tip.desc.split(' ').slice(0, 3).join(' ')}...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Info - Compact */}
        <div className="card p-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">📋 Supported Formats</h3>
          <div className="flex gap-1 flex-wrap text-xs">
            <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium">JSON</span>
            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 font-medium">CSV</span>
            <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-medium">Excel</span>
          </div>
        </div>

        {/* Feature Highlights - Compact */}
        <div className="card p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900 dark:to-orange-900 border border-amber-200 dark:border-amber-700">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Auto-save:</strong> Work is automatically saved</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Privacy:</strong> All processing in browser</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
              <span className="text-gray-700 dark:text-gray-300"><strong>Fast:</strong> Handles large files</span>
            </div>
          </div>
        </div>

        {/* Version & Status - Sticky Footer */}
        <div className="card p-2 text-center text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <div className="font-semibold text-gray-900 dark:text-gray-100">Convosight v1.0</div>
          <div className="inline-block mt-1 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-medium">
            🟢 Online
          </div>
        </div>
      </div>
    </aside>
  )
}
