/**
 * Analysis utilities from build_post_matrix.py and diff_refs_vs_finals.py
 * EXACT logic for post matrix and missing posts
 */

export function inferRegionFromFilename(filename) {
  // Try regex: "Final Vietnam Data" or "Final Vietnam Data_filled"
  const match = filename.match(/Final\s*(.+?)\s*Data/i)
  if (match) {
    return match[1].trim()
  }
  return 'Unknown'
}

export function buildPostMatrix(filesData) {
  const rows = []

  for (const { data, filename } of filesData) {
    const region = inferRegionFromFilename(filename)

    // Ensure required columns
    const processedData = data.map(row => ({
      Source: row.Source || 'Unknown',
      'Final Category': row['Final Category'] || 'Not Specified'
    }))

    // Count posts by Source x Final Category
    const counts = {}
    processedData.forEach(row => {
      const key = `${row.Source}|||${row['Final Category']}`
      counts[key] = (counts[key] || 0) + 1
    })

    // Convert to rows
    for (const [key, count] of Object.entries(counts)) {
      const [source, finalCategory] = key.split('|||')
      rows.push({
        Region: region,
        Source: source,
        'Final Category': finalCategory,
        'Post Count': count
      })
    }
  }

  // Aggregate across files
  const aggregated = {}
  rows.forEach(row => {
    const key = `${row.Region}|||${row.Source}|||${row['Final Category']}`
    if (!aggregated[key]) {
      aggregated[key] = { ...row }
    } else {
      aggregated[key]['Post Count'] += row['Post Count']
    }
  })

  return Object.values(aggregated)
}

export function findMissingPosts(referenceTable, finalTable) {
  // Collect URLs from final table
  const finalUrls = new Set()
  finalTable.forEach(row => {
    const url = row.URL
    if (url && String(url).trim() !== '') {
      finalUrls.add(String(url).trim())
    }
  })

  // Find rows in reference whose URL not in final
  const missingPosts = referenceTable.filter(row => {
    const url = row.URL
    if (!url || String(url).trim() === '') return true
    return !finalUrls.has(String(url).trim())
  })

  const stats = {
    totalInReference: referenceTable.length,
    totalInFinal: finalTable.length,
    missingPosts: missingPosts.length,
    coverage: finalTable.length > 0 
      ? Math.round((finalTable.length / referenceTable.length) * 100 * 100) / 100
      : 0
  }

  return { missingPosts, stats }
}
