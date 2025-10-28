import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import { findMissingPosts } from '../../utils/analysisUtils'
import { readCSVFile, downloadCSV } from '../../utils/fileUtils'

export default function MissingPosts() {
  const [refFile, setRefFile] = useState(null)
  const [finalFile, setFinalFile] = useState(null)
  const [result, setResult] = useState(null)

  const handleFind = async () => {
    try {
      const ref = await readCSVFile(refFile)
      const final = await readCSVFile(finalFile)
      const result = findMissingPosts(ref, final)
      setResult(result)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-4">
      <h2 className="text-2xl font-bold mb-4">Find Missing Posts</h2>

      <FileUpload label="Reference Table (CSV)" accept=".csv" onFileSelect={setRefFile} selectedFile={refFile} required />
      <FileUpload label="Final Table (CSV)" accept=".csv" onFileSelect={setFinalFile} selectedFile={finalFile} required />

      <button
        onClick={handleFind}
        disabled={!refFile || !finalFile}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
      >
        Find Missing Posts
      </button>

      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatsCard label="Total in Reference" value={result.stats.totalInReference} color="blue" />
            <StatsCard label="Total in Final" value={result.stats.totalInFinal} color="blue" />
            <StatsCard label="Missing Posts" value={result.stats.missingPosts} color="red" />
            <StatsCard label="Coverage" value={`${result.stats.coverage}%`} color="green" />
          </div>
          <DataPreview data={result.missingPosts.slice(0, 10)} maxRows={10} />
          <button
            onClick={() => downloadCSV(result.missingPosts, 'missing_posts.csv')}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4"
          >
            Download Missing Posts CSV
          </button>
        </div>
      )}
    </div>
  )
}