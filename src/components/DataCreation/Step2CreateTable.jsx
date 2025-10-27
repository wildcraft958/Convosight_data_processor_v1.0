import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import { createTableFromJSONs } from '../../utils/dataProcessors'
import { readJSONFile, downloadCSV } from '../../utils/fileUtils'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export default function Step2CreateTable({ onPrevious, onNext }) {
  const [files, setFiles] = useLocalStorage('step2_files', { igPosts: null, igFollowers: null, yt: null, tt: null })
  const [result, setResult] = useLocalStorage('step2_result', null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const igPosts = await readJSONFile(files.igPosts)
      const igFollowers = await readJSONFile(files.igFollowers)
      const yt = files.yt ? await readJSONFile(files.yt) : []
      const tt = files.tt ? await readJSONFile(files.tt) : []

      const table = createTableFromJSONs(igPosts, igFollowers, yt, tt)
      setResult(table)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sourceCounts = result ? result.reduce((acc, row) => {
    acc[row.Source] = (acc[row.Source] || 0) + 1
    return acc
  }, {}) : {}

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Step 2: Create Table from JSONs</h2>

      <div className="grid grid-cols-2 gap-4">
        <FileUpload label="Instagram Posts JSON" accept=".json" onFileSelect={(f) => setFiles({...files, igPosts: f})} selectedFile={files.igPosts} required />
        <FileUpload label="Instagram Followers JSON" accept=".json" onFileSelect={(f) => setFiles({...files, igFollowers: f})} selectedFile={files.igFollowers} required />
        <FileUpload label="YouTube Posts JSON (optional)" accept=".json" onFileSelect={(f) => setFiles({...files, yt: f})} selectedFile={files.yt} />
        <FileUpload label="TikTok Posts JSON (optional)" accept=".json" onFileSelect={(f) => setFiles({...files, tt: f})} selectedFile={files.tt} />
      </div>

      <div className="flex gap-4 mt-4">
        <button onClick={onPrevious} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Previous</button>
        <button onClick={handleGenerate} disabled={!files.igPosts || !files.igFollowers || loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300">
          {loading ? 'Generating...' : 'Generate Table'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatsCard label="Total Rows" value={result.length} color="blue" />
            {Object.entries(sourceCounts).map(([source, count]) => (
              <StatsCard key={source} label={source} value={count} color="green" />
            ))}
          </div>
          <DataPreview data={result.slice(0, 5)} maxRows={5} />
          <div className="flex gap-4 mt-4">
            <button onClick={() => downloadCSV(result, 'populated_data.csv')} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Download CSV</button>
            <button onClick={() => onNext(result)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Next Step</button>
          </div>
        </div>
      )}
    </div>
  )
}