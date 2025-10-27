import React, { useState } from 'react'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import { buildPostMatrix } from '../../utils/analysisUtils'
import { readCSVFile, downloadCSV } from '../../utils/fileUtils'

export default function PostMatrix() {
  const [files, setFiles] = useState([])
  const [result, setResult] = useState(null)

  const handleProcess = async () => {
    try {
      const filesData = []
      for (const file of files) {
        const data = await readCSVFile(file)
        filesData.push({ data, filename: file.name })
      }
      const matrix = buildPostMatrix(filesData)
      setResult(matrix)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Build Post Count Matrix</h2>

      <div 
        className="upload-zone border-2 border-dashed rounded-lg p-8 text-center mb-4"
        onClick={() => document.getElementById('matrix-files').click()}
      >
        <input
          id="matrix-files"
          type="file"
          multiple
          accept=".csv"
          onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}
          className="hidden"
        />
  <p className="text-gray-500 dark:text-gray-400">Upload Final Data CSV files</p>
      </div>

      {files.length > 0 && (
  <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded p-4 mb-4">
          <div className="font-medium mb-2">Files ({files.length})</div>
          {files.map((f, idx) => <div key={idx} className="text-sm">{f.name}</div>)}
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={files.length === 0}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
      >
        Build Matrix
      </button>

      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <StatsCard label="Files Processed" value={files.length} color="blue" />
            <StatsCard label="Total Entries" value={result.length} color="green" />
          </div>
          <DataPreview data={result} maxRows={10} />
          <button
            onClick={() => downloadCSV(result, 'region_source_category_matrix.csv')}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4"
          >
            Download Matrix CSV
          </button>
        </div>
      )}
    </div>
  )
}