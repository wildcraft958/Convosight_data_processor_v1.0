import React, { useState, useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { getDefaultKeywords } from '../../utils/categoryInference'

export default function CategoryKeywordEditor({ onSave, onClose }) {
  const [keywords, setKeywords] = useLocalStorage('custom_keywords', null)
  const [editingKeywords, setEditingKeywords] = useState(keywords || getDefaultKeywords())
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingKeywordField, setEditingKeywordField] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Expand/collapse keyword fields for editing
  const toggleKeywordEdit = (category) => {
    setEditingKeywordField(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  // Add new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setErrorMessage('Please enter a category name')
      return
    }
    if (editingKeywords[newCategoryName]) {
      setErrorMessage('Category already exists')
      return
    }
    setEditingKeywords(prev => ({
      ...prev,
      [newCategoryName]: []
    }))
    setNewCategoryName('')
    setErrorMessage('')
  }

  // Remove category
  const handleRemoveCategory = (category) => {
    setConfirmAction({ type: 'removeCategory', category })
    setShowConfirm(true)
  }

  const confirmRemoveCategory = () => {
    const { category } = confirmAction
    setEditingKeywords(prev => {
      const updated = { ...prev }
      delete updated[category]
      return updated
    })
    setShowConfirm(false)
  }

  // Update keywords for a category (space or comma separated)
  const handleUpdateKeywords = (category, value) => {
    const keywords = value
      .split(/[,\n]/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0)
    
    setEditingKeywords(prev => ({
      ...prev,
      [category]: keywords
    }))
  }

  // Add single keyword
  const handleAddKeyword = (category, keyword) => {
    if (!keyword.trim()) return
    const normalizedKeyword = keyword.trim().toLowerCase()
    
    setEditingKeywords(prev => ({
      ...prev,
      [category]: Array.from(new Set([...prev[category], normalizedKeyword]))
    }))
  }

  // Remove keyword
  const handleRemoveKeyword = (category, index) => {
    setEditingKeywords(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }))
  }

  // Save changes
  const handleSave = () => {
    setKeywords(editingKeywords)
    if (onSave) {
      onSave(editingKeywords)
    }
    onClose()
  }

  // Reset to defaults
  const handleResetDefaults = () => {
    setConfirmAction({ type: 'resetDefaults' })
    setShowConfirm(true)
  }

  const confirmResetDefaults = () => {
    const defaults = getDefaultKeywords()
    setEditingKeywords(defaults)
    setKeywords(defaults)
    setShowConfirm(false)
  }

  // Export as JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(editingKeywords, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'category-keywords.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import from JSON
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result)
        if (typeof imported === 'object' && imported !== null) {
          // Validate structure
          const isValid = Object.entries(imported).every(
            ([key, val]) => typeof key === 'string' && Array.isArray(val)
          )
          if (isValid) {
            setEditingKeywords(imported)
            setSuccessMessage('Keywords imported successfully!')
            setTimeout(() => setSuccessMessage(''), 3000) // Clear after 3 seconds
          } else {
            setErrorMessage('Invalid format. Expected: { "category": ["keyword1", "keyword2"] }')
            setTimeout(() => setErrorMessage(''), 5000) // Clear after 5 seconds
          }
        }
      } catch (err) {
        setErrorMessage('Error reading file: ' + err.message)
        setTimeout(() => setErrorMessage(''), 5000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Category & Keyword Editor</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition"
              title="Close editor"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 mt-2">Create and manage custom keyword mappings for category inference</p>
        </div>

        <div className="p-6">
          {/* Add New Category Section */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Add New Category</h3>
            {errorMessage && (
              <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm">
                {successMessage}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => {
                  setNewCategoryName(e.target.value)
                  setErrorMessage('') // Clear error when user starts typing
                }}
                placeholder="Enter category name (e.g., 'Hair Care')"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition"
              >
                Add Category
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            {Object.entries(editingKeywords).map(([category, keywords]) => (
              <div key={category} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{category}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{keywords.length} keyword{keywords.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleKeywordEdit(category)}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 transition"
                    >
                      {editingKeywordField[category] ? 'Done Editing' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Keywords Display / Edit Mode */}
                {!editingKeywordField[category] ? (
                  <div className="flex flex-wrap gap-2">
                    {keywords.length > 0 ? (
                      keywords.map((kw, idx) => (
                        <span key={idx} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-200 dark:border-blue-700">
                          {kw}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">No keywords added yet</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Keywords (comma or line separated)
                      </label>
                      <textarea
                        value={keywords.join('\n')}
                        onChange={(e) => handleUpdateKeywords(category, e.target.value)}
                        placeholder="Enter keywords one per line or comma-separated"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm placeholder-gray-500 dark:placeholder-gray-400"
                        rows="4"
                      />
                    </div>

                    {/* Display current keywords */}
                    {editingKeywords[category].length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Keywords:</p>
                        <div className="flex flex-wrap gap-2">
                          {editingKeywords[category].map((kw, idx) => (
                            <div
                              key={idx}
                              className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200 dark:border-blue-700"
                            >
                              {kw}
                              <button
                                onClick={() => handleRemoveKeyword(category, idx)}
                                className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 hover:font-bold"
                                title="Remove keyword"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-wrap gap-3 justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition"
              >
                📥 Export as JSON
              </button>
              <label className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 transition cursor-pointer">
                📤 Import from JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 transition"
              >
                ⟲ Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition font-semibold"
              >
                ✓ Save & Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {confirmAction?.type === 'resetDefaults' ? 'Reset to Defaults?' : 'Delete Category?'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {confirmAction?.type === 'resetDefaults'
                ? 'This will replace all categories and keywords with the default set. Are you sure?'
                : `Delete "${confirmAction?.category}" and all its keywords? This cannot be undone.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={
                  confirmAction?.type === 'resetDefaults'
                    ? confirmResetDefaults
                    : confirmRemoveCategory
                }
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
