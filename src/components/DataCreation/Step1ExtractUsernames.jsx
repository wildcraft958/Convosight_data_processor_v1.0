import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import StatsCard from '../common/StatsCard'
import { extractInstagramUsernames } from '../../utils/dataProcessors'
import { readJSONFile } from '../../utils/fileUtils'
import DownloadButton from '../common/DownloadButton'

export default function Step1ExtractUsernames({ onNext }) {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleProcess = async () => {
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const data = await readJSONFile(file)
      const result = extractInstagramUsernames(data)
      setResult(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    downloadJSON({ usernames: result.usernames }, 'instagram_usernames_for_scraper.json')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Step 1: Extract Instagram Usernames</h2>
  <p className="text-gray-600 dark:text-gray-300 mb-6">Upload Instagram posts JSON to extract unique usernames</p>

      <FileUpload
        label="Instagram Posts JSON"
        accept=".json"
        onFileSelect={setFile}
        selectedFile={file}
        required
      />

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <button
        onClick={handleProcess}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : 'Extract Usernames'}
      </button>

      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <StatsCard label="Total Posts" value={result.totalPosts} color="blue" />
            <StatsCard label="Total Usernames" value={result.totalUsernames} color="blue" />
            <StatsCard label="Unique Usernames" value={result.uniqueUsernames} color="green" />
          </div>

          <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
            <h3 className="font-medium mb-2">Preview (first 20 usernames)</h3>
            <div className="max-h-48 overflow-y-auto">
              {result.usernames.slice(0, 20).map((username, idx) => (
                <div key={idx} className="text-sm py-1">{idx + 1}. {username}</div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <DownloadButton
              filename="instagram_usernames_for_scraper.json"
              content={{ usernames: result.usernames }}
            />
            <button
              onClick={() => onNext(result)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Next Step
            </button>
          </div>
        </div>
      )}
    </div>
  )
}