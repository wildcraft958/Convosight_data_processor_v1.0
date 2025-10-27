/**
 * Data processing utilities that mirror Python scripts EXACTLY
 * NO modifications to core logic - only input/output handling adapted for browser
 */

// From extract_instagram_usernames.py
export function extractInstagramUsernames(instagramData) {
  // Handle both single object and array formats
  const posts = Array.isArray(instagramData) ? instagramData : [instagramData]

  // Extract all usernames from posts (preserve order)
  const usernames = []
  for (const post of posts) {
    const username = post.ownerUsername || ''
    if (username) {
      const norm = username.trim()
      if (norm) usernames.push(norm)
    }
  }

  // Create order-preserving unique list (first-seen wins)
  // Use case-sensitive deduplication for Instagram
  const seen = new Set()
  const uniqueUsernames = []
  for (const u of usernames) {
    const key = u // case-sensitive
    if (!seen.has(key)) {
      seen.add(key)
      uniqueUsernames.push(u)
    }
  }

  return {
    totalPosts: posts.length,
    totalUsernames: usernames.length,
    uniqueUsernames: uniqueUsernames.length,
    usernames: uniqueUsernames
  }
}

// From create_table_from_json.py
export function determineInfluencerTier(followers) {
  if (followers >= 500000) return 'Mega'
  if (followers >= 100000) return 'Macro'
  if (followers >= 10000) return 'Micro'
  if (followers > 1000) return 'Nano'
  return 'Pico'
}

export function parseInstagramData(instagramPosts, followersData) {
  const rows = []

  // Create followers lookup dictionary
  const followersDict = {}
  for (const profile of followersData) {
    const username = profile.userName || ''
    const userId = profile.userId || ''
    const count = profile.followersCount || 0
    followersDict[username] = count
    followersDict[userId] = count
  }

  for (const post of instagramPosts) {
    const url = post.inputUrl || ''
    const username = post.ownerUsername || ''
    const userId = post.ownerId || ''

    // Get follower count
    const followers = followersDict[username] || followersDict[userId] || 0

    // Calculate engagement metrics
    const likes = post.likesCount || 0
    const comments = post.commentsCount || 0
    const engagement = likes + comments
    const views = ['Video', 'Reel'].includes(post.type) ? (post.videoPlayCount || 0) : 0

    // Calculate engagement rates
    const erOnViews = views > 0 ? (engagement / views * 100) : 0
    const erOnFollowers = followers > 0 ? (engagement / followers * 100) : 0

    // Determine content type
    const isSponsored = post.isSponsored || false
    const paidPartnership = isSponsored ? 'Yes' : 'No'

    rows.push({
      'SNo': '',
      'URL': url,
      'Source': 'Instagram',
      'Final Category': '',
      'Category': '',
      'Brand': '',
      'Content Type': '',
      'Caption (Title)': post.caption || '',
      'Caption (Text)': '',
      'Likes': likes,
      'Comments': comments,
      'Engagement': engagement,
      'Views': views,
      'ER% on Views': Math.round(erOnViews * 100) / 100,
      '% ER Based on Followers': Math.round(erOnFollowers * 100) / 100,
      'Owner Username': username,
      'Influencer ID': `https://www.instagram.com/${username}`,
      'Followers': followers,
      'Influencer Tier (Mega, Macro...)': determineInfluencerTier(followers),
      'Timestamp': post.timestamp || '',
      'Format': post.type || '',
      'Paid Partnership': paidPartnership
    })
  }

  return rows
}

export function parseYouTubeData(youtubePosts) {
  const rows = []

  for (const post of youtubePosts) {
    const url = post.url || ''
    const username = post.channelUsername || ''
    const followers = post.numberOfSubscribers || 0

    const likes = post.likes || 0
    const comments = post.commentsCount || 0
    const engagement = likes + comments
    const views = post.viewCount || 0

    const erOnViews = views > 0 ? (engagement / views * 100) : 0
    const erOnFollowers = followers > 0 ? (engagement / followers * 100) : 0

    rows.push({
      'SNo': '',
      'URL': url,
      'Source': 'YouTube',
      'Final Category': '',
      'Category': '',
      'Brand': '',
      'Content Type': '',
      'Caption (Title)': post.title || '',
      'Caption (Text)': post.text || '',
      'Likes': likes,
      'Comments': comments,
      'Engagement': engagement,
      'Views': views,
      'ER% on Views': Math.round(erOnViews * 100) / 100,
      '% ER Based on Followers': Math.round(erOnFollowers * 100) / 100,
      'Owner Username': username,
      'Influencer ID': post.channelUrl || '',
      'Followers': followers,
      'Influencer Tier (Mega, Macro...)': determineInfluencerTier(followers),
      'Timestamp': post.date || '',
      'Format': (post.type || '').charAt(0).toUpperCase() + (post.type || '').slice(1),
      'Paid Partnership': ''
    })
  }

  return rows
}

export function parseTikTokData(tiktokPosts) {
  const rows = []

  for (const post of tiktokPosts) {
    const url = post.webVideoUrl || ''
    const authorMeta = post.authorMeta || {}
    const username = authorMeta.name || ''
    const followers = authorMeta.fans || 0

    const likes = post.diggCount || 0
    const comments = post.commentCount || 0
    const engagement = likes + comments
    const views = post.playCount || 0

    const erOnViews = views > 0 ? (engagement / views * 100) : 0
    const erOnFollowers = followers > 0 ? (engagement / followers * 100) : 0

    const isSponsored = post.isAd || post.isSponsored || false

    rows.push({
      'SNo': '',
      'URL': url,
      'Source': 'TikTok',
      'Final Category': '',
      'Category': '',
      'Brand': '',
      'Content Type': '',
      'Caption (Title)': post.text || '',
      'Caption (Text)': '',
      'Likes': likes,
      'Comments': comments,
      'Engagement': engagement,
      'Views': views,
      'ER% on Views': Math.round(erOnViews * 100) / 100,
      '% ER Based on Followers': Math.round(erOnFollowers * 100) / 100,
      'Owner Username': username,
      'Influencer ID': authorMeta.profileUrl || '',
      'Followers': followers,
      'Influencer Tier (Mega, Macro...)': determineInfluencerTier(followers),
      'Timestamp': post.createTimeISO || '',
      'Format': 'Video',
      'Paid Partnership': ''
    })
  }

  return rows
}

export function createTableFromJSONs(instagramPosts, followersData, youtubePosts = [], tiktokPosts = []) {
  const allRows = []

  // Parse data from each platform
  if (instagramPosts && followersData) {
    allRows.push(...parseInstagramData(instagramPosts, followersData))
  }
  if (youtubePosts && youtubePosts.length > 0) {
    allRows.push(...parseYouTubeData(youtubePosts))
  }
  if (tiktokPosts && tiktokPosts.length > 0) {
    allRows.push(...parseTikTokData(tiktokPosts))
  }

  // Add serial numbers
  allRows.forEach((row, idx) => {
    row['SNo'] = idx + 1
  })

  return allRows
}

// From match_and_fill_tables.py
export function fillColumnsFromReference(mainTable, referenceTable) {
  const columnsToFill = ['Category', 'Brand', 'Content Type']

  // Ensure reference URLs are unique
  const referenceDict = {}
  const urlsSeen = new Set()
  for (const row of referenceTable) {
    const url = row.URL
    if (url && !urlsSeen.has(url)) {
      urlsSeen.add(url)
      referenceDict[url] = {}
      for (const col of columnsToFill) {
        if (row[col] !== undefined) {
          referenceDict[url][col] = row[col]
        }
      }
    }
  }

  let matchedCount = 0
  const updatedCells = { 'Category': 0, 'Brand': 0, 'Content Type': 0 }

  // Fill columns in main table based on URL match
  const updatedTable = mainTable.map(row => {
    const url = row.URL
    const newRow = { ...row }

    // Ensure columns exist
    for (const col of columnsToFill) {
      if (newRow[col] === undefined) newRow[col] = ''
    }

    if (url && referenceDict[url]) {
      matchedCount++
      for (const col of columnsToFill) {
        // Only fill if empty
        const currentVal = newRow[col]
        if (!currentVal || String(currentVal).trim() === '') {
          if (referenceDict[url][col] !== undefined) {
            newRow[col] = referenceDict[url][col]
            updatedCells[col]++
          }
        }
      }
    }

    return newRow
  })

  return {
    table: updatedTable,
    stats: {
      totalUrls: mainTable.length,
      matchedUrls: matchedCount,
      unmatchedUrls: mainTable.length - matchedCount,
      updatedCells
    }
  }
}
