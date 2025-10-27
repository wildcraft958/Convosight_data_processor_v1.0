import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import DownloadButton from '../common/DownloadButton'
import { readCSVFile } from '../../utils/fileUtils'
import { createDataPointsSummary, createFilledDataPointsTable } from '../../utils/dataPointsGenerator'
import Papa from 'papaparse'

export default function GenerateDataPoints() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const brands = ['Ensure', 'Boost', 'Orgain', 'Premier Protein', 'Muscle Milk', 'Owyn', 'Kate Farms']

  const handleProcess = async () => {
    if (!file) {
      setError('Please upload a file first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await readCSVFile(file)
      const summaryData = createDataPointsSummary(data, brands)
      const filledTable = createFilledDataPointsTable(summaryData)
      setResult(filledTable)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Generate Data Points</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Upload a Final Data CSV to generate a summary table with metrics for different brands across platforms and formats.</p>

      <FileUpload
        label="Final Data File (CSV)"
        accept=".csv"
        onFileSelect={setFile}
        selectedFile={file}
        required
      />
      
      {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-3 rounded my-4">{error}</div>}

      <button
        onClick={handleProcess}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 mt-4"
      >
        {loading ? 'Processing...' : 'Generate Data Points'}
      </button>

      {result && (
        <div className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <StatsCard label="Brands Found" value={result.length} color="blue" />
            <StatsCard label="Total Posts Analyzed" value={result.reduce((sum, r) => sum + (r['Total Posts'] || 0), 0)} color="green" />
            <StatsCard label="Total Engagement" value={result.reduce((sum, r) => sum + (r['Total Engagement'] || 0), 0)} color="purple" />
          </div>

          <DataPreview data={result} maxRows={10} />
          
          <div className="mt-4">
            <DownloadButton
              filename="Generated_Data_Points.csv"
              content={Papa.unparse(result)}
              mime={'text/csv;charset=utf-8;'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
