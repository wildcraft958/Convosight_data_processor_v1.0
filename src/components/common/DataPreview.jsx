import React from 'react'

export default function DataPreview({ data, maxRows = 10 }) {
  if (!data || data.length === 0) return null

  const headers = Object.keys(data[0])
  const displayData = data.slice(0, maxRows)

  return (
    <div className="mt-4 card overflow-hidden">
      <div className="bg-gray-50 dark:bg-transparent px-4 py-3 border-b dark:border-gray-700">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">Preview (first {maxRows} rows)</h3>
      </div>
      <div className="overflow-x-auto max-h-96">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0">
            <tr>
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-gray-700">
            {displayData.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-gray-50 dark:bg-gray-800'}>
                {headers.map((header, cellIdx) => (
                  <td key={cellIdx} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 align-top">
                    {String(row[header] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}