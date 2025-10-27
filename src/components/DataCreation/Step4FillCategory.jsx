import React, { useState } from 'react'
import FileUpload from '../common/FileUpload'
import DataPreview from '../common/DataPreview'
import { ensureFinalCategoryColumn, getDefaultKeywords } from '../../utils/categoryInference'
import { readCSVFile, downloadCSV } from '../../utils/fileUtils'
import { useLocalStorage } from '../../hooks/useLocalStorage'

export default function Step4FillCategory({ initialData, onPrevious }) {
  const [file, setFile] = useLocalStorage('step4_file', null)
  const [keywords, setKeywords] = useState(getDefaultKeywords())
  const [result, setResult] = useLocalStorage('step4_result', null)

  const handleFill = async () => {
    try {
      const data = file ? await readCSVFile(file) : initialData
      const filled = ensureFinalCategoryColumn(data)
      setResult(filled)
    } catch (err) {
      alert(err.message)
    }
  }

  const categoryDist = result ? result.reduce((acc, row) => {
    const cat = row['Final Category'] || 'Not Specified'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {}) : {}

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Step 4: Fill Final Category</h2>

      <FileUpload label="Table from Step 3 (CSV)" accept=".csv" onFileSelect={setFile} selectedFile={file} />

      <div className="my-6">
        <h3 className="font-medium mb-3">Category Keywords</h3>
        {Object.entries(keywords).map(([category, kws]) => (
          <div key={category} className="border rounded p-3 mb-3">
            <div className="font-medium mb-2">{category}</div>
            <div className="flex flex-wrap gap-2">
              {kws.map((kw, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">{kw}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={onPrevious} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">Previous</button>
        <button onClick={handleFill} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Fill Final Category</button>
      </div>

      {result && (
        <div className="mt-6">
          <div className="card p-4 mb-4">
            <h3 className="font-medium mb-2">Distribution by Final Category</h3>
            {Object.entries(categoryDist).map(([cat, count]) => (
              <div key={cat} className="flex justify-between py-1">
                <span>{cat}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <DataPreview data={result.slice(0, 5)} maxRows={5} />
          <button onClick={() => downloadCSV(result, 'final_categorized_data.csv')} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 mt-4">Download Final CSV</button>
        </div>
      )}
    </div>
  )
}