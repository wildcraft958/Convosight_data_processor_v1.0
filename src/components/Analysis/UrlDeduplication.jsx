import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import DownloadButton from '../common/DownloadButton'
import { readCSVFile } from '../../utils/fileUtils'
import { removeUrlDuplicates } from '../../utils/urlDeduplication'
import Papa from 'papaparse'

export default function UrlDeduplication() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Configuration
  const [urlColumn, setUrlColumn] = useState('url')
  const [similarityThreshold, setSimilarityThreshold] = useState(90)
  const [useSimilarityCheck, setUseSimilarityCheck] = useState(true)
  const [availableColumns, setAvailableColumns] = useState([])

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile)
    setError('')
    
    // Try to detect columns
    try {
      const data = await readCSVFile(selectedFile)
      if (data && data.length > 0) {
        const columns = Object.keys(data[0])
        setAvailableColumns(columns)
        
        // Try to auto-detect URL column
        const urlCol = columns.find(col => 
          /url|link|post.*url|social.*url/i.test(col)
        )
        if (urlCol) {
          setUrlColumn(urlCol)
        }
      }
    } catch (err) {
      console.error('Error reading file:', err)
    }
  }

  const handleProcess = async () => {
    if (!file) {
      setError('Please upload a CSV file first.')
      return
    }

    if (!urlColumn) {
      setError('Please specify the URL column name.')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const data = await readCSVFile(file)
      
      // Check if URL column exists
      if (data.length > 0 && !data[0].hasOwnProperty(urlColumn)) {
        setError(`Column "${urlColumn}" not found in CSV. Available columns: ${Object.keys(data[0]).join(', ')}`)
        setLoading(false)
        return
      }

      const { cleanedData, duplicateRows, stats } = removeUrlDuplicates(
        data,
        urlColumn,
        similarityThreshold / 100,
        useSimilarityCheck
      )

      setResult({ data: cleanedData, duplicateRows, stats })
    } catch (err) {
      setError(err.message || 'Failed to process file')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto pb-4">
      <h2 className="text-2xl font-bold mb-4">URL Deduplication</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Remove duplicate rows based on URL matching. The tool keeps the first occurrence and removes all subsequent duplicates.
        All columns from your CSV are preserved in the cleaned output.
      </p>

      <FileUpload
        label="CSV File with URLs"
        accept=".csv"
        onFileSelect={handleFileSelect}
        selectedFile={file}
        required
      />

      {/* Configuration Panel */}
      <div className="card p-4 mb-4 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Configuration</h3>
        
        {/* URL Column Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL Column Name
          </label>
          {availableColumns.length > 0 ? (
            <select
              value={urlColumn}
              onChange={(e) => setUrlColumn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {availableColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={urlColumn}
              onChange={(e) => setUrlColumn(e.target.value)}
              placeholder="e.g., url, Post URL, link"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Column containing the URLs to deduplicate
          </p>
        </div>

        {/* Similarity Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Similarity Threshold: {similarityThreshold}%
          </label>
          <input
            type="range"
            min="70"
            max="100"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            URLs with {similarityThreshold}% or higher similarity are considered duplicates
          </p>
        </div>

        {/* Use Similarity Check */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useSimilarity"
            checked={useSimilarityCheck}
            onChange={(e) => setUseSimilarityCheck(e.target.checked)}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="useSimilarity" className="text-sm text-gray-700 dark:text-gray-300">
            Enable similarity-based duplicate detection
          </label>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">How it works:</h4>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>✓ <strong>Step 1:</strong> Removes tracking parameters (UTM, fbclid, igshid, etc.)</li>
            <li>✓ <strong>Step 2:</strong> Extracts platform-specific IDs (Instagram post IDs, YouTube video IDs, etc.)</li>
            <li>✓ <strong>Step 3:</strong> Compares normalized URLs for exact matches</li>
            <li>✓ <strong>Step 4:</strong> Optionally checks similarity for near-duplicates</li>
            <li>✓ <strong>Result:</strong> Keeps first occurrence, removes all duplicate rows completely</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleProcess}
        disabled={!file || loading}
        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 disabled:bg-gray-400 transition"
      >
        {loading ? 'Processing...' : 'Remove Duplicates'}
      </button>

      {result && (
        <div className="mt-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              label="Total Rows" 
              value={result.stats.totalUrls} 
              color="blue" 
            />
            <StatsCard 
              label="Duplicate Rows Removed" 
              value={result.stats.removedTotal} 
              color="red" 
            />
            <StatsCard 
              label="Clean Rows" 
              value={result.stats.finalCount} 
              color="green" 
            />
            <StatsCard 
              label="Deduplication Rate" 
              value={`${((result.stats.removedTotal / result.stats.totalUrls) * 100).toFixed(1)}%`} 
              color="purple" 
            />
          </div>

          {/* Detailed Statistics */}
          <div className="card p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Deduplication Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {result.stats.exactDuplicates}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Exact Duplicates</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Identical normalized URLs
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {result.stats.idBasedDuplicates}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">ID-Based Duplicates</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Same platform post IDs
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {result.stats.similarityDuplicates}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Similarity Duplicates</div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {similarityThreshold}%+ similar URLs
                </p>
              </div>
            </div>

            {/* Platform Statistics */}
            {Object.keys(result.stats.platforms).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Platforms Detected:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(result.stats.platforms).map(([platform, count]) => (
                    platform && (
                      <span 
                        key={platform}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
                      >
                        <span className="capitalize font-medium">{platform}</span>
                        <span className="ml-2 text-xs opacity-75">({count})</span>
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Preview */}
          <DataPreview data={result.data.slice(0, 10)} maxRows={10} />

          {/* Download Button */}
          <div className="mt-4 flex gap-3">
            <DownloadButton
              filename="cleaned_data.csv"
              content={Papa.unparse(result.data)}
              mime="text/csv;charset=utf-8;"
            />
            {result.duplicateRows && result.duplicateRows.length > 0 && (
              <DownloadButton
                filename="duplicate_rows.csv"
                content={Papa.unparse(result.duplicateRows)}
                mime="text/csv;charset=utf-8;"
              />
            )}
            <button
              onClick={() => {
                const statsText = `Deduplication Report
===================
Total Rows: ${result.stats.totalUrls}
Duplicate Rows Removed: ${result.stats.removedTotal}
Clean Rows Remaining: ${result.stats.finalCount}
Deduplication Rate: ${((result.stats.removedTotal / result.stats.totalUrls) * 100).toFixed(1)}%

Breakdown:
- Exact Duplicates: ${result.stats.exactDuplicates}
- ID-Based Duplicates: ${result.stats.idBasedDuplicates}
- Similarity Duplicates: ${result.stats.similarityDuplicates}

Platforms Detected:
${Object.entries(result.stats.platforms).map(([p, c]) => `- ${p}: ${c}`).join('\n')}

Configuration:
- URL Column: ${urlColumn}
- Similarity Threshold: ${similarityThreshold}%
- Similarity Check: ${useSimilarityCheck ? 'Enabled' : 'Disabled'}
`;
                const blob = new Blob([statsText], { type: 'text/plain' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = 'deduplication_report.txt'
                link.click()
                URL.revokeObjectURL(link.href)
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition"
            >
              📄 Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
