/**
 * URL Deduplication utility
 * Removes duplicate URLs from CSV data using normalization and similarity matching
 * Translated from clean_social_media_urls.py
 */

/**
 * Extract unique identifier from social media URLs
 * Returns object: { platform, uniqueId }
 */
export function extractSocialMediaId(url) {
  const urlLower = url.toLowerCase();

  // Instagram - extract post/reel ID
  const instagramMatch = urlLower.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (instagramMatch) {
    return { platform: 'instagram', uniqueId: instagramMatch[1] };
  }

  // YouTube - extract video ID
  const youtubeMatch = urlLower.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
  if (youtubeMatch) {
    return { platform: 'youtube', uniqueId: youtubeMatch[1] };
  }

  // TikTok - extract video ID
  const tiktokMatch = urlLower.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (tiktokMatch) {
    return { platform: 'tiktok', uniqueId: tiktokMatch[1] };
  }

  const tiktokShortMatch = urlLower.match(/(?:vm\.tiktok\.com|vt\.tiktok\.com)\/([A-Za-z0-9]+)/);
  if (tiktokShortMatch) {
    return { platform: 'tiktok', uniqueId: tiktokShortMatch[1] };
  }

  // Facebook - extract post ID
  const fbPostMatch = urlLower.match(/facebook\.com\/[^/]+\/(?:posts|videos)\/(\d+)/);
  if (fbPostMatch) {
    return { platform: 'facebook', uniqueId: fbPostMatch[1] };
  }

  const fbPhotoMatch = urlLower.match(/facebook\.com\/photo\.php\?fbid=(\d+)/);
  if (fbPhotoMatch) {
    return { platform: 'facebook', uniqueId: fbPhotoMatch[1] };
  }

  const fbWatchMatch = urlLower.match(/facebook\.com\/watch\/?\?v=(\d+)/);
  if (fbWatchMatch) {
    return { platform: 'facebook', uniqueId: fbWatchMatch[1] };
  }

  return { platform: null, uniqueId: null };
}

/**
 * Normalize URL with strict rules for social media platforms
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') {
    return { normalized: url, platform: null, uniqueId: null };
  }

  const trimmedUrl = url.trim();

  // Extract social media ID
  const { platform, uniqueId } = extractSocialMediaId(trimmedUrl);

  // Parse URL
  let parsed;
  try {
    parsed = new URL(trimmedUrl);
  } catch (e) {
    return { normalized: trimmedUrl, platform, uniqueId };
  }

  // Remove trailing slash from path
  let path = parsed.pathname.replace(/\/$/, '');

  // Tracking parameters to remove
  const trackingParams = new Set([
    // UTM parameters
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    // Facebook tracking
    'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref',
    // Instagram tracking
    'igshid', 'igsh', 'ig_rid', 'ig_web_copy_link',
    // TikTok tracking
    'tt_from', '_r', '_d', 'is_from_webapp', 'is_copy_url',
    // YouTube tracking
    'feature', 'gclid', 'si',
    // General tracking
    'ref', 'source', 'campaign_id', 'ad_id', 'share_id', 'sender_device',
    'timestamp', '_branch_match_id', 'mibextid'
  ]);

  // Filter and sort parameters
  const filteredParams = new URLSearchParams();
  for (const [key, value] of parsed.searchParams.entries()) {
    if (!trackingParams.has(key.toLowerCase())) {
      filteredParams.append(key, value);
    }
  }
  filteredParams.sort();

  // Normalize domain
  let hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');

  // Reconstruct URL
  const normalized = `https://${hostname}${path}${filteredParams.toString() ? '?' + filteredParams.toString() : ''}`;

  return { normalized, platform, uniqueId };
}

/**
 * Calculate similarity ratio between two strings using Levenshtein-based approach
 */
export function calculateSimilarity(s1, s2) {
  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.length === 0) return 1.0;

  // Calculate Levenshtein distance
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Remove duplicate URLs from data array
 * Removes entire rows where URLs are duplicates, keeping only the first occurrence
 * 
 * @param {Array} data - Array of objects containing URLs
 * @param {string} urlColumn - Name of the column containing URLs
 * @param {number} similarityThreshold - Minimum similarity to consider as duplicate (0-1)
 * @param {boolean} useSimilarity - Whether to use similarity matching
 * @returns {Object} { cleanedData, duplicateRows, stats }
 */
export function removeUrlDuplicates(data, urlColumn, similarityThreshold = 0.90, useSimilarity = true) {
  console.log(`Processing ${data.length} URLs...`);

  const stats = {
    totalUrls: data.length,
    exactDuplicates: 0,
    idBasedDuplicates: 0,
    similarityDuplicates: 0,
    platforms: {},
    removedTotal: 0,
    finalCount: 0
  };

  // Normalize all URLs and extract IDs
  const processedData = data.map(row => {
    const url = row[urlColumn];
    const { normalized, platform, uniqueId } = normalizeUrl(url);
    
    // Track platforms
    if (platform) {
      stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
    }

    return {
      ...row,
      _normalized: normalized,
      _platform: platform,
      _uniqueId: uniqueId
    };
  });

  // Track which rows to keep and which are duplicates
  const keepIndices = [];
  const duplicateIndices = [];
  const seenNormalized = new Map();
  const seenIds = new Map();

  processedData.forEach((row, idx) => {
    const normalized = row._normalized;
    const platform = row._platform;
    const uniqueId = row._uniqueId;

    // Handle null/undefined values - keep them
    if (!normalized) {
      keepIndices.push(idx);
      return;
    }

    let isDuplicate = false;
    let duplicateType = '';

    // STEP 1: Check exact normalized URL match (strictest)
    if (seenNormalized.has(normalized)) {
      stats.exactDuplicates++;
      isDuplicate = true;
      duplicateType = 'exact';
    }
    // STEP 2: Check platform-specific ID match (for social media)
    else if (platform && uniqueId) {
      const idKey = `${platform}:${uniqueId}`;
      if (seenIds.has(idKey)) {
        stats.idBasedDuplicates++;
        isDuplicate = true;
        duplicateType = 'id-based';
      }
    }

    // STEP 3: Check similarity with existing URLs (optional)
    if (!isDuplicate && useSimilarity && seenNormalized.size > 0) {
      for (const [seenUrl] of seenNormalized) {
        // Only compare URLs that are reasonably close in length
        const lengthRatio = normalized.length / seenUrl.length;
        if (lengthRatio >= 0.7 && lengthRatio <= 1.3) {
          const similarity = calculateSimilarity(normalized, seenUrl);
          if (similarity >= similarityThreshold) {
            stats.similarityDuplicates++;
            isDuplicate = true;
            duplicateType = 'similarity';
            break;
          }
        }
      }
    }

    if (isDuplicate) {
      duplicateIndices.push({ idx, type: duplicateType });
    } else {
      // Not a duplicate - keep this URL (first occurrence)
      seenNormalized.set(normalized, idx);
      if (platform && uniqueId) {
        seenIds.set(`${platform}:${uniqueId}`, idx);
      }
      keepIndices.push(idx);
    }
  });

  // Remove temporary columns from kept rows
  const cleanedData = keepIndices.map(idx => {
    const row = { ...processedData[idx] };
    delete row._normalized;
    delete row._platform;
    delete row._uniqueId;
    return row;
  });

  // Keep duplicate rows for download (optional)
  const duplicateRows = duplicateIndices.map(({ idx, type }) => {
    const row = { ...processedData[idx] };
    delete row._normalized;
    delete row._platform;
    delete row._uniqueId;
    return { ...row, _duplicate_type: type };
  });

  stats.removedTotal = data.length - cleanedData.length;
  stats.finalCount = cleanedData.length;

  return { cleanedData, duplicateRows, stats };
}
