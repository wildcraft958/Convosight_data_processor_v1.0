import React from 'react'
import DownloadButton from '../common/DownloadButton'

// Import raw script contents (Vite supports ?raw to import file as string)
import scriptText from '../../../generate_data_points_corrected.py?raw'

export default function GenerateDataPoints() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Generate Data Points</h2>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        This utility generates a filled Data Points summary table from the Final Data CSV.
        You can review the script below and download it to run locally.
      </p>

      <div className="card p-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-200">Script: <strong>generate_data_points_corrected.py</strong></div>
          <div>
            <DownloadButton filename="generate_data_points_corrected.py" content={scriptText} mime="text/x-python" />
          </div>
        </div>

        <div className="mt-4 overflow-auto max-h-96 bg-[var(--surface)] dark:bg-[var(--surface)] border border-gray-100 dark:border-gray-800 p-3 rounded">
          <pre className="whitespace-pre-wrap text-xs leading-5 text-gray-900 dark:text-gray-100"><code>{scriptText}</code></pre>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium mb-2">How to run</h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-200">
          <li>Download the script using the button above.</li>
          <li>Place it in the same folder as your CSV file or update the <code>input_file</code> path inside the script.</li>
          <li>Run it with Python 3.10+: <code>python generate_data_points_corrected.py</code></li>
        </ol>
      </div>
    </div>
  )
}
