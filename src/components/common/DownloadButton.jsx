import React from 'react'

/**
 * DownloadButton
 * Props:
 * - filename: string (default 'data.json')
 * - content: string | object | Blob - data to download
 * - mime: mime type (default application/json)
 * - onDownload: optional callback to perform custom download logic (if provided this is called instead)
 */
export default function DownloadButton({ filename = 'data.json', content = '', mime = 'application/json', onDownload }) {
  const handleDownload = (e) => {
    e && e.preventDefault()
    if (onDownload) return onDownload()

    let blob
    if (content instanceof Blob) {
      blob = content
    } else if (typeof content === 'object') {
      try {
        blob = new Blob([JSON.stringify(content, null, 2)], { type: mime })
      } catch (err) {
        blob = new Blob([String(content)], { type: mime })
      }
    } else {
      blob = new Blob([String(content)], { type: mime })
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative">
      <button
        onClick={handleDownload}
        className="group w-12 h-12 rounded-full bg-gray-900 dark:bg-gray-700 flex items-center justify-center cursor-pointer relative transition duration-300 shadow-sm hover:bg-purple-600"
        aria-label="Download"
        title="Download"
      >
        <svg
          className="w-5 h-5 text-purple-300 group-hover:text-white transform transition-transform duration-300 -translate-y-0.5 group-hover:-translate-y-0"
          viewBox="0 0 384 512"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
        >
          <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
        </svg>

        {/* decorative small bar under the arrow */}
        <span className="absolute bottom-3 w-4 h-0.5 border-b-2 border-purple-300 group-hover:border-white rounded-sm" />
      </button>

      <div className="absolute right-14 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs px-3 py-1 rounded shadow">
          Download
        </div>
      </div>
    </div>
  )
}
