import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import DataPreview from '../common/DataPreview'
import StatsCard from '../common/StatsCard'
import { fillColumnsFromReference } from '../../utils/dataProcessors'
import { readCSVFile, downloadCSV } from '../../utils/fileUtils'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export default function Step3MatchFill({ initialData, onPrevious, onNext }) {
  const [mainFile, setMainFile] = useLocalStorage('step3_mainFile', null)
  const [refFile, setRefFile] = useLocalStorage('step3_refFile', null)
  const [result, setResult] = useLocalStorage('step3_result', null)
  const [loading, setLoading] = useState(false)

  const handleMatch = async () => {
    setLoading(true)
    try {
      const main = mainFile ? await readCSVFile(mainFile) : initialData
      const ref = await readCSVFile(refFile)
      const { table, stats } = fillColumnsFromReference(main, ref)
      setResult({ table, stats })
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const coverage = result ? Math.round((result.stats.matchedUrls / result.stats.totalUrls) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto pb-4">
      <h2 className="text-2xl font-bold mb-4">Step 3: Match & Fill from Reference</h2>

      <FileUpload label="Main Table (CSV)" accept=".csv" onFileSelect={setMainFile} selectedFile={mainFile} />
      <FileUpload label="Reference Table (CSV)" accept=".csv" onFileSelect={setRefFile} selectedFile={refFile} required />

      <div className="flex gap-4 mt-4">
        <button onClick={onPrevious} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Previous</button>
        <button onClick={handleMatch} disabled={!refFile || loading} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300">
          {loading ? 'Matching...' : 'Match & Fill'}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <StatsCard label="Total URLs" value={result.stats.totalUrls} color="blue" />
            <StatsCard label="Matched" value={result.stats.matchedUrls} color="green" />
            <StatsCard label="Coverage" value={`${coverage}%`} color="green" />
            <StatsCard label="Updated Cells" value={Object.values(result.stats.updatedCells).reduce((a,b) => a+b, 0)} color="blue" />
          </div>
          <DataPreview data={result.table.slice(0, 5)} maxRows={5} />
          <div className="flex gap-4 mt-4">
            <button onClick={() => downloadCSV(result.table, 'updated_data.csv')} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Download CSV</button>
            <button onClick={() => onNext(result.table)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Next Step</button>
          </div>
        </div>
      )}
    </div>
  )
}