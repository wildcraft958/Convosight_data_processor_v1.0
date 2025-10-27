/**
 * CVI processing from convert_excel_to_table.py
 * EXACT logic for standardizing CVI data
 */

export function processCVIFiles(filesData) {
  const targetHeaders = [
    "Serial Number", "Source", "URL", "ownerUsername", "Followers",
    "Type of Post", "Brand Name", "likesCount", "commentsCount",
    "Engagement", "Video Plays", "caption", "videoDuration",
    "Speech to text Transcription", "Theme", "Detailed Visual Description",
    "On-screen Text Overlays", "Background Setting", "Human Activity",
    "CTA Text", "Claims", "Ingredients on pack", "Product"
  ]

  const allData = []
  let serialNumber = 1

  for (const { data, filename } of filesData) {
    // Determine source from content_type or filename
    let sourceMap = []
    if (data[0] && data[0].content_type) {
      sourceMap = data.map(row => {
        const ct = String(row.content_type || '')
        if (ct.includes('TikTok')) return 'TikTok'
        if (ct.includes('Instagram')) return 'Instagram'
        return 'Unknown'
      })
    } else {
      // Fallback: from filename
      const fn = filename.toUpperCase()
      const source = fn.includes('TT') ? 'TikTok' : fn.includes('IG') ? 'Instagram' : 'Unknown'
      sourceMap = data.map(() => source)
    }

    // Determine username column
    const usernameCol = data[0] && data[0].platform_username !== undefined ? 'platform_username' : 'username'

    // Calculate engagement and process each row
    data.forEach((row, idx) => {
      const likes = row.like_count || 0
      const comments = row.comment_count || 0
      const followers = row.influencer_follower_count || 0

      const engRate = followers > 0 ? ((likes + comments) / followers) * 100 : 0

      const duration = row.duration || 0
      const typeOfPost = duration > 0 ? 'Video' : 'Image'

      allData.push({
        "Serial Number": serialNumber++,
        "Source": sourceMap[idx],
        "URL": row.original_url || '',
        "ownerUsername": row[usernameCol] || '',
        "Followers": followers,
        "Type of Post": typeOfPost,
        "Brand Name": row.Brand || '',
        "likesCount": likes,
        "commentsCount": comments,
        "Engagement": Math.round(engRate * 100) / 100,
        "Video Plays": row.view_count || '',
        "caption": row.caption || '',
        "videoDuration": duration,
        "Speech to text Transcription": row['Speech to text Transcription'] || '',
        "Theme": row.Theme || '',
        "Detailed Visual Description": row['Detailed Visual Description'] || '',
        "On-screen Text Overlays": row['On-screen Text Overlays'] || '',
        "Background Setting": row['Background Setting'] || '',
        "Human Activity": row['Human Activity'] || '',
        "CTA Text": row['CTA Text'] || '',
        "Claims": row.Claims || '',
        "Ingredients on pack": row['Ingredients on pack'] || '',
        "Product": row.Product || ''
      })
    })
  }

  // Calculate stats
  const stats = {
    totalRows: allData.length,
    bySource: {}
  }

  allData.forEach(row => {
    const source = row.Source
    stats.bySource[source] = (stats.bySource[source] || 0) + 1
  })

  return { data: allData, stats }
}
