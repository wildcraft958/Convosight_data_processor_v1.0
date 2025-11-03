/**
 * Data processing functions translated from generate_data_points.py
 * Calculates brand metrics and engagement rates from social media data
 */

// Helper to calculate ER for videos/shorts
function calculateAvgErForVideosShorts(data) {
  const videoShortsData = data.filter(row => 
    ['video', 'shorts'].includes((row['Post Format'] || '').toLowerCase())
  );
  if (videoShortsData.length === 0) return null;

  const totalEngagement = videoShortsData.reduce((sum, row) => sum + Number(row['Engagement'] || 0), 0);
  const totalPlayCount = videoShortsData.reduce((sum, row) => sum + Number(row['videoPlayCount'] || 0), 0);

  return totalPlayCount > 0 ? (totalEngagement / totalPlayCount) * 100 : null;
}

// Helper to calculate ER for images/sidecars
function calculateAvgErForImagesSidecars(data) {
  const imageSidecarData = data.filter(row => 
    ['image', 'sidecar'].includes((row['Post Format'] || '').toLowerCase())
  );
  if (imageSidecarData.length === 0) return null;

  const totalEngagement = imageSidecarData.reduce((sum, row) => sum + Number(row['Engagement'] || 0), 0);
  const followers = imageSidecarData.length > 0 ? Number(imageSidecarData[0]['Followers'] || 0) : 0;
  const totalFollowers = followers * imageSidecarData.length;
  
  return totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : null;
}

export function createDataPointsSummary(data, brands) {
  const results = [];

  brands.forEach(brand => {
    // Normalize brand name for case-insensitive matching
    const normalizedBrand = brand.toLowerCase().replace(/\s+/g, ' ').trim();
    const brandData = data.filter(row => {
      const rowBrand = (row['Brand Name'] || '').trim().toLowerCase().replace(/\s+/g, ' ').trim();
      return rowBrand === normalizedBrand;
    });
    if (brandData.length === 0) return;

    const totalPosts = brandData.length;
    
    // Avg posts per month
    const timestamps = brandData.map(row => new Date(row.timestamp)).filter(date => !isNaN(date));
    let avgPostsPerMonth = null;
    if (timestamps.length > 0) {
      const minDate = new Date(Math.min.apply(null, timestamps));
      const maxDate = new Date(Math.max.apply(null, timestamps));
      const months = Math.max((maxDate - minDate) / (1000 * 60 * 60 * 24 * 30), 1);
      avgPostsPerMonth = totalPosts / months;
    }

    const totalLikes = brandData.reduce((sum, row) => sum + Number(row.likesCount || 0), 0);
    const totalComments = brandData.reduce((sum, row) => sum + Number(row.commentsCount || 0), 0);
    const totalEngagement = brandData.reduce((sum, row) => sum + Number(row.Engagement || 0), 0);
    
    const videoShortsData = brandData.filter(row => ['video', 'shorts'].includes((row['Post Format'] || '').toLowerCase()));
    const totalViews = videoShortsData.reduce((sum, row) => sum + Number(row.videoPlayCount || 0), 0);
    const overallAvgEr = calculateAvgErForVideosShorts(brandData);

    // Platform metrics
    const getPlatformMetrics = (source) => {
        const platformData = brandData.filter(row => row.Source === source);
        const videoShorts = platformData.filter(row => ['video', 'shorts'].includes((row['Post Format'] || '').toLowerCase()));
        return {
            posts: videoShorts.length,
            followers: platformData.length > 0 ? Number(platformData[0].Followers) : null,
            avgEr: calculateAvgErForVideosShorts(platformData)
        };
    };

    const tiktokMetrics = getPlatformMetrics('TikTok');
    const instagramMetrics = getPlatformMetrics('Instagram');
    const youtubeMetrics = getPlatformMetrics('YouTube');
    const facebookMetrics = getPlatformMetrics('Facebook');
    
    // Instagram Branded vs Tagged
    const instagramData = brandData.filter(row => row.Source === 'Instagram');
    const igBranded = instagramData.filter(row => row['Type of Post'] === 'Branded' && ['video', 'shorts'].includes((row['Post Format'] || '').toLowerCase()));
    const igTagged = instagramData.filter(row => row['Type of Post'] === 'Tagged' && ['video', 'shorts'].includes((row['Post Format'] || '').toLowerCase()));
    
    // YouTube format specific
    const ytVideos = brandData.filter(row => row.Source === 'YouTube' && (row['Post Format'] || '').toLowerCase() === 'video');
    const ytShorts = brandData.filter(row => row.Source === 'YouTube' && (row['Post Format'] || '').toLowerCase() === 'shorts');

    // Instagram format specific
    const igImages = instagramData.filter(row => (row['Post Format'] || '').toLowerCase() === 'image');
    const igSidecars = instagramData.filter(row => (row['Post Format'] || '').toLowerCase() === 'sidecar');

    // Facebook format specific
    const facebookData = brandData.filter(row => row.Source === 'Facebook');
    const fbImages = facebookData.filter(row => (row['Post Format'] || '').toLowerCase() === 'image');
    const fbVideos = facebookData.filter(row => (row['Post Format'] || '').toLowerCase() === 'video');

    results.push({
      'Brand': brand, 
      'Total Posts': totalPosts, 
      'Avg Posts Per Month': avgPostsPerMonth,
      'Total Likes': totalLikes, 
      'Total Comments': totalComments, 
      'Total Engagement': totalEngagement,
      'Total Views': totalViews, 
      'Overall Avg ER': overallAvgEr,
      'TikTok Total Posts': tiktokMetrics.posts, 
      'TikTok Followers': tiktokMetrics.followers, 
      'TikTok Avg ER': tiktokMetrics.avgEr,
      'Instagram Total Posts': instagramMetrics.posts, 
      'Instagram Followers': instagramMetrics.followers, 
      'Instagram Avg ER': instagramMetrics.avgEr,
      'Instagram Branded Posts': igBranded.length, 
      'Instagram Branded ER': calculateAvgErForVideosShorts(igBranded),
      'Instagram Tagged Posts': igTagged.length, 
      'Instagram Tagged ER': calculateAvgErForVideosShorts(igTagged),
      'YouTube Total Posts': youtubeMetrics.posts, 
      'YouTube Followers': youtubeMetrics.followers, 
      'YouTube Avg ER': youtubeMetrics.avgEr,
      'YouTube Video Posts': ytVideos.length, 
      'YouTube Video ER': calculateAvgErForVideosShorts(ytVideos),
      'YouTube Shorts Posts': ytShorts.length, 
      'YouTube Shorts ER': calculateAvgErForVideosShorts(ytShorts),
      'Instagram Image Posts': igImages.length, 
      'Instagram Image ER': calculateAvgErForImagesSidecars(igImages),
      'Instagram Sidecar Posts': igSidecars.length, 
      'Instagram Sidecar ER': calculateAvgErForImagesSidecars(igSidecars),
      'Facebook Total Posts': facebookMetrics.posts,
      'Facebook Followers': facebookMetrics.followers,
      'Facebook Avg ER': facebookMetrics.avgEr,
      'Facebook Image Posts': fbImages.length,
      'Facebook Image ER': calculateAvgErForImagesSidecars(fbImages),
      'Facebook Video Posts': fbVideos.length,
      'Facebook Video ER': calculateAvgErForVideosShorts(fbVideos)
    });
  });

  return results;
}

export function createFilledDataPointsTable(summaryDf) {
    // Return the summary directly formatted for display
    return summaryDf;
}
