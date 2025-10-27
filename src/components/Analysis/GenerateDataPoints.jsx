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

    const brands = [
        "Brand A",
        "Brand B",
        "Brand C",
        "Brand D",
        "Brand E",
        "Brand F",
        "Brand G",
    ];
    const [brandsList, setBrandsList] = useState(brands)
    const [newBrand, setNewBrand] = useState('')

    const addBrand = (b) => {
        const name = String(b || '').trim()
        if (!name) return
        if (brandsList.includes(name)) return
        setBrandsList((s) => [...s, name])
    }

    const removeBrand = (idx) => {
        setBrandsList((s) => s.filter((_, i) => i !== idx))
    }

    const handleAddBrand = () => {
        addBrand(newBrand)
        setNewBrand('')
    }

    const handleLoadBrandsCSV = async (file) => {
        try {
            const rows = await readCSVFile(file)
            if (!rows || rows.length === 0) return
            // Try find a brand-like column
            const keys = Object.keys(rows[0])
            const brandCol = keys.find(k => /brand/i.test(k)) || keys[0]
            const extracted = Array.from(new Set(rows.map(r => (r[brandCol] || '').trim()).filter(Boolean)))
            setBrandsList((s) => Array.from(new Set([...s, ...extracted])))
        } catch (err) {
            setError('Failed to load brands from CSV')
        }
    }

    const handleDetectFromDataFile = (data) => {
        if (!data || data.length === 0) return
        const keys = Object.keys(data[0])
        const brandCol = keys.find(k => /brand/i.test(k)) || keys[0]
        const extracted = Array.from(new Set(data.map(r => (r[brandCol] || '').trim()).filter(Boolean)))
        setBrandsList((s) => Array.from(new Set([...s, ...extracted])))
    }

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

            <div className="mt-4 card p-4">
                <h3 className="font-medium mb-2">Brands to include</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                    {brandsList.map((b, idx) => (
                        <div key={b} className="inline-flex items-center space-x-2 bg-[var(--surface)] border px-3 py-1 rounded-full">
                            <span className="text-sm text-gray-800 dark:text-gray-100">{b}</span>
                            <button onClick={() => removeBrand(idx)} className="text-xs text-red-600 dark:text-red-400">✕</button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 items-center">
                    <input
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
                        placeholder="Add brand and press Enter"
                        className="flex-1 px-3 py-2 border rounded bg-white dark:bg-[var(--surface)] dark:text-gray-100"
                    />
                    <button onClick={handleAddBrand} className="px-3 py-2 bg-blue-600 text-white rounded">Add</button>

                    <label className="inline-block px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded cursor-pointer">
                        <input type="file" accept=".csv" onChange={(e) => e.target.files && handleLoadBrandsCSV(e.target.files[0])} className="hidden" />
                        Load CSV
                    </label>

                    <button
                        onClick={async () => {
                            if (!file) {
                                setError('Upload the main data file first to detect brands')
                                return
                            }
                            try {
                                const data = await readCSVFile(file)
                                handleDetectFromDataFile(data)
                            } catch (err) {
                                setError('Failed to read uploaded data file')
                            }
                        }}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                        Auto-detect from data
                    </button>
                </div>
            </div>
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
