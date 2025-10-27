import React, { useState } from 'react'
import DataCreation from './components/DataCreation/DataCreation'
import CVICreation from './components/CVICreation/CVICreation'
import Analysis from './components/Analysis/Analysis'

export default function App() {
  const [activeTab, setActiveTab] = useState('data-creation')

  const TabButton = ({ id, children }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-150 ${
        activeTab === id
          ? 'bg-primary-500 text-white shadow'
          : 'bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="min-h-screen">
      <header className="bg-transparent pt-6 pb-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.webp" alt="Convosight" className="w-10 h-10 rounded-md object-cover shadow-sm" />
            <div>
              <div className="text-2xl font-extrabold text-gray-900">Convosight</div>
              <div className="text-sm text-gray-500">Data Processor v1.0</div>
            </div>
          </div>
          <div className="text-sm text-gray-600">Ready</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        <div className="card p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TabButton id="data-creation">Data Creation</TabButton>
              <TabButton id="cvi-creation">CVI Creation</TabButton>
              <TabButton id="analysis">Analysis</TabButton>
            </div>
            <div className="text-sm text-gray-500">Tip: Use drag & drop for uploads</div>
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
            <aside className="lg:col-span-4">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-2">Overview</h3>
                <p className="text-sm text-gray-600">Quick actions, status and helpful hints appear here.</p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}