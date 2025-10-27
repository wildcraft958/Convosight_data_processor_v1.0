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
    <aside className="lg:col-span-4 space-y-4">
      {/* Current Guide */}
      {currentGuide && (
        <div className="card p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span className="text-2xl">{currentGuide.icon}</span>
            {currentGuide.title} Guide
          </h3>
          <div className="space-y-2">
            {currentGuide.steps.map((step, idx) => (
              <div
                key={idx}
                onClick={() => setExpandedGuide(expandedGuide === idx ? -1 : idx)}
                className="cursor-pointer p-3 rounded bg-[rgba(99,102,241,0.05)] dark:bg-[rgba(99,102,241,0.1)] hover:bg-[rgba(99,102,241,0.1)] dark:hover:bg-[rgba(99,102,241,0.15)] transition-colors border border-[rgba(99,102,241,0.2)]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold">
                      {step.num}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{step.title}</div>
                      {expandedGuide === idx && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{step.desc}</div>
                      )}
                    </div>
                  </div>
                  <span className={`text-gray-400 transition-transform ${expandedGuide === idx ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips & Tricks */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Tips & Tricks</h3>
        <div className="space-y-2">
          {tips.slice(0, 3).map((tip, idx) => (
            <div key={idx} className="p-2 rounded bg-[rgba(34,197,94,0.05)] dark:bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
              <div className="flex gap-2">
                <span className="text-lg flex-shrink-0">{tip.icon}</span>
                <div className="text-xs">
                  <div className="font-medium text-gray-900 dark:text-gray-100">{tip.title}</div>
                  <div className="text-gray-600 dark:text-gray-400">{tip.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer font-medium text-primary-500 hover:text-primary-600 dark:text-primary-400">
            Show more tips
          </summary>
          <div className="space-y-2 mt-2">
            {tips.slice(3).map((tip, idx) => (
              <div key={idx + 3} className="p-2 rounded bg-[rgba(34,197,94,0.05)] dark:bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)]">
                <div className="flex gap-2">
                  <span className="text-lg flex-shrink-0">{tip.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{tip.title}</div>
                    <div className="text-gray-600 dark:text-gray-400">{tip.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Quick Info */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Quick Info</h3>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
            <div className="font-medium text-blue-900 dark:text-blue-100">File Formats</div>
            <div className="text-xs text-blue-800 dark:text-blue-200">Supports JSON, CSV, and Excel (.xlsx, .xls)</div>
          </div>
          <div className="p-2 rounded bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700">
            <div className="font-medium text-purple-900 dark:text-purple-100">Auto-save</div>
            <div className="text-xs text-purple-800 dark:text-purple-200">All form data is automatically saved locally</div>
          </div>
          <div className="p-2 rounded bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700">
            <div className="font-medium text-amber-900 dark:text-amber-100">Privacy</div>
            <div className="text-xs text-amber-800 dark:text-amber-200">All processing happens in your browser</div>
          </div>
        </div>
      </div>

      {/* Version & Status */}
      <div className="card p-4 text-center text-xs text-gray-600 dark:text-gray-400">
        <div>Convosight Data Processor</div>
        <div>v1.0</div>
        <div className="mt-2 inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
          ✓ Online
        </div>
      </div>
    </aside>
  )
}
