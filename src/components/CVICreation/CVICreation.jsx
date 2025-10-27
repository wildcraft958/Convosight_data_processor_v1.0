import React, { useState } from 'react'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import { processCVIFiles } from '../../utils/cviProcessing'
import { readCSVFile, readExcelFile } from '../../utils/fileUtils'
import Papa from 'papaparse'
import DownloadButton from '../common/DownloadButton'

export default function CVICreation() {
  const [files, setFiles] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileAdd = (fileList) => {
    setFiles([...files, ...Array.from(fileList)])
  }

  const handleRemove = (idx) => {
    setFiles(files.filter((_, i) => i !== idx))
  }

  const handleProcess = async () => {
    setLoading(true)
    try {
      const filesData = []
      for (const file of files) {
        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
        const data = isExcel ? await readExcelFile(file) : await readCSVFile(file)
        filesData.push({ data, filename: file.name })
      }

      const result = processCVIFiles(filesData)
      setResult(result)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">CVI Table Creator</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Upload CVI Excel/CSV files to create standardized table</p>

      <div 
        className="upload-zone border-2 border-dashed rounded-lg p-8 text-center mb-4"
        onClick={() => document.getElementById('cvi-files').click()}
      >
        <input
          id="cvi-files"
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileAdd(e.target.files)}
          className="hidden"
        />
  <p className="text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Excel (.xlsx, .xls) or CSV files</p>
      </div>

      {files.length > 0 && (
        <div className="bg-white dark:bg-transparent border border-gray-200 dark:border-gray-700 rounded mb-4">
          <div className="px-4 py-2 border-b font-medium dark:border-gray-700">Uploaded Files ({files.length})</div>
          <div className="divide-y">
            {files.map((file, idx) => (
              <div key={idx} className="px-4 py-2 flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{file.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
                <button onClick={() => handleRemove(idx)} className="text-red-600 hover:text-red-800">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={files.length === 0 || loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : 'Process CVI Files'}
      </button>

      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatsCard label="Total Rows" value={result.stats.totalRows} color="blue" />
            {Object.entries(result.stats.bySource).map(([source, count]) => (
              <StatsCard key={source} label={source} value={count} color="green" />
            ))}
          </div>
          <DataPreview data={result.data.slice(0, 10)} maxRows={10} />
          <div className="mt-4">
            {/* Generate CSV string and use DownloadButton to download */}
            <DownloadButton
              filename="processed_social_media_data.csv"
              content={Papa.unparse(result.data)}
              mime={'text/csv;charset=utf-8;'}
            />
          </div>
        </div>
      )}
    </div>
  )
}