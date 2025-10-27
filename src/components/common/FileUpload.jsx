import React, { useCallback } from 'react'

export default function FileUpload({ label, accept, onFileSelect, selectedFile, required = false }) {
  const safeId = (label || 'file').toString().replace(/[^a-z0-9]+/gi, '-').toLowerCase()

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFileSelect(file)
  }, [onFileSelect])

  const handleDragOver = (e) => e.preventDefault()

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="card p-4">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`upload-zone rounded-lg p-6 text-center cursor-pointer ${selectedFile ? 'uploaded' : ''}`}
          onClick={() => document.getElementById(`file-${safeId}`).click()}
        >
          <input
            id={`file-${safeId}`}
            type="file"
            accept={accept}
            onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            className="hidden"
          />
          {selectedFile ? (
            <div>
              <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
              <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 mt-1">{accept}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}