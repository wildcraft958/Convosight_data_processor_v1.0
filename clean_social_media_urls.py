import pandas as pd
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from difflib import SequenceMatcher
import re

def extract_social_media_id(url):
    """
    Extract unique identifier from social media URLs
    Returns tuple: (platform, unique_id)
    """
    url_lower = url.lower()

    # Instagram - extract post/reel ID
    # Formats: instagram.com/p/ABC123, instagram.com/reel/ABC123
    instagram_match = re.search(r'instagram\.com/(?:p|reel|tv)/([A-Za-z0-9_-]+)', url)
    if instagram_match:
        return ('instagram', instagram_match.group(1))

    # YouTube - extract video ID
    # Formats: youtube.com/watch?v=ABC123, youtu.be/ABC123
    youtube_match = re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]+)', url)
    if youtube_match:
        return ('youtube', youtube_match.group(1))

    # TikTok - extract video ID
    # Formats: tiktok.com/@user/video/1234567890, vm.tiktok.com/ABC123
    tiktok_match = re.search(r'tiktok\.com/@[^/]+/video/(\d+)', url)
    if tiktok_match:
        return ('tiktok', tiktok_match.group(1))

    tiktok_short_match = re.search(r'(?:vm\.tiktok\.com|vt\.tiktok\.com)/([A-Za-z0-9]+)', url)
    if tiktok_short_match:
        return ('tiktok', tiktok_short_match.group(1))

    # Facebook - extract post ID
    # Formats: facebook.com/user/posts/123456, facebook.com/photo.php?fbid=123
    fb_post_match = re.search(r'facebook\.com/[^/]+/(?:posts|videos)/(\d+)', url)
    if fb_post_match:
        return ('facebook', fb_post_match.group(1))

    fb_photo_match = re.search(r'facebook\.com/photo\.php\?fbid=(\d+)', url)
    if fb_photo_match:
        return ('facebook', fb_photo_match.group(1))

    fb_watch_match = re.search(r'facebook\.com/watch/?\?v=(\d+)', url)
    if fb_watch_match:
        return ('facebook', fb_watch_match.group(1))

    return (None, None)

def normalize_url(url):
    """
    Normalize URL with strict rules for social media platforms
    - Removes tracking parameters (UTM, fbclid, igshid, etc.)
    - Standardizes protocol
    - Removes trailing slashes
    - Sorts remaining query parameters
    """
    if pd.isna(url) or not isinstance(url, str):
        return url, None, None

    url = url.strip()

    # First, try to extract social media ID
    platform, unique_id = extract_social_media_id(url)

    # Parse URL
    try:
        parsed = urlparse(url)
    except:
        return url, platform, unique_id

    # Remove trailing slash from path
    path = parsed.path.rstrip('/')

    # Parse query parameters
    params = parse_qs(parsed.query, keep_blank_values=True)

    # Tracking parameters to remove
    tracking_params = {
        # UTM parameters
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
        # Facebook tracking
        'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref',
        # Instagram tracking
        'igshid', 'igsh', 'ig_rid', 'ig_web_copy_link',
        # TikTok tracking
        'tt_from', '_r', '_d', 'is_from_webapp', 'is_copy_url',
        # YouTube tracking
        'feature', 'gclid', 'si',
        # General tracking
        'ref', 'source', 'campaign_id', 'ad_id', 'share_id', 'sender_device',
        'timestamp', '_branch_match_id', 'mibextid'
    }

    # Remove tracking parameters
    filtered_params = {k: v for k, v in params.items() if k.lower() not in tracking_params}

    # Sort parameters alphabetically for consistency
    sorted_params = sorted(filtered_params.items())
    query_string = urlencode(sorted_params, doseq=True) if sorted_params else ''

    # Normalize domain (remove www, convert to lowercase)
    netloc = parsed.netloc.lower()
    netloc = netloc.replace('www.', '')

    # Standardize protocol to https
    scheme = 'https'

    # Reconstruct URL
    normalized = urlunparse((
        scheme,
        netloc,
        path,
        parsed.params,
        query_string,
        ''  # Remove fragment
    ))

    return normalized, platform, unique_id

def calculate_similarity(s1, s2):
    """Calculate similarity ratio between two strings using edit distance"""
    return SequenceMatcher(None, s1, s2).ratio()

def remove_url_duplicates(df, url_column, similarity_threshold=0.90, use_similarity=True):
    """
    Remove duplicate URLs from dataframe with social media-aware deduplication

    Parameters:
    - df: DataFrame containing URLs
    - url_column: Name of the column containing URLs
    - similarity_threshold: Minimum similarity to consider as duplicate (0-1)
    - use_similarity: Whether to use similarity matching as secondary check

    Returns:
    - cleaned_df: DataFrame with duplicates removed
    - removed_count: Number of duplicates removed
    - stats: Dictionary with deduplication statistics
    """
    print(f"\nProcessing {len(df)} URLs...")

    # Create normalized URL and extract IDs
    normalization_data = df[url_column].apply(normalize_url)
    df['normalized_url'] = normalization_data.apply(lambda x: x[0])
    df['platform'] = normalization_data.apply(lambda x: x[1])
    df['unique_id'] = normalization_data.apply(lambda x: x[2])

    # Statistics
    stats = {
        'total_urls': len(df),
        'exact_duplicates': 0,
        'id_based_duplicates': 0,
        'similarity_duplicates': 0,
        'platforms': {}
    }

    # Track platforms
    platform_counts = df['platform'].value_counts()
    stats['platforms'] = platform_counts.to_dict()

    # Track which rows to keep
    keep_indices = []
    seen_normalized = {}
    seen_ids = {}

    for idx, row in df.iterrows():
        normalized_url = row['normalized_url']
        platform = row['platform']
        unique_id = row['unique_id']

        # Handle null values
        if pd.isna(normalized_url):
            keep_indices.append(idx)
            continue

        # STEP 1: Check exact normalized URL match (strictest)
        if normalized_url in seen_normalized:
            stats['exact_duplicates'] += 1
            continue

        # STEP 2: Check platform-specific ID match (for social media)
        if platform and unique_id:
            id_key = f"{platform}:{unique_id}"
            if id_key in seen_ids:
                stats['id_based_duplicates'] += 1
                continue

        # STEP 3: Check similarity with existing URLs (optional, for edge cases)
        is_similar_duplicate = False
        if use_similarity and len(seen_normalized) > 0:
            for seen_url in list(seen_normalized.keys()):
                # Only compare URLs that are reasonably close in length
                length_ratio = len(normalized_url) / len(seen_url) if len(seen_url) > 0 else 0
                if 0.7 <= length_ratio <= 1.3:
                    similarity = calculate_similarity(normalized_url, seen_url)
                    if similarity >= similarity_threshold:
                        stats['similarity_duplicates'] += 1
                        is_similar_duplicate = True
                        break

        if is_similar_duplicate:
            continue

        # Not a duplicate - keep this URL
        seen_normalized[normalized_url] = idx
        if platform and unique_id:
            seen_ids[f"{platform}:{unique_id}"] = idx
        keep_indices.append(idx)

    # Remove temporary columns
    cleaned_df = df.loc[keep_indices].drop(columns=['normalized_url', 'platform', 'unique_id'])

    stats['removed_total'] = len(df) - len(keep_indices)
    stats['final_count'] = len(keep_indices)

    return cleaned_df, stats['removed_total'], stats

if __name__ == "__main__":
    # Configuration
    INPUT_FILE = 'input.csv'  # Change this to your input file name
    OUTPUT_FILE = 'cleaned_output.csv'  # Change this to your desired output file name
    URL_COLUMN = 'url'  # Change this to the name of your URL column
    SIMILARITY_THRESHOLD = 0.90  # Adjust this value (0-1) for strictness
    USE_SIMILARITY_CHECK = True  # Set to False to disable similarity matching

    try:
        # Load CSV
        print(f"Loading {INPUT_FILE}...")
        df = pd.read_csv(INPUT_FILE)
        print(f"✓ Loaded {len(df)} rows")

        # Clean duplicates
        print(f"\nRemoving duplicates from '{URL_COLUMN}' column...")
        print("Using strict normalization + social media ID extraction")
        if USE_SIMILARITY_CHECK:
            print(f"Similarity threshold: {SIMILARITY_THRESHOLD * 100}%")

        cleaned_df, removed_count, stats = remove_url_duplicates(
            df, 
            URL_COLUMN, 
            similarity_threshold=SIMILARITY_THRESHOLD,
            use_similarity=USE_SIMILARITY_CHECK
        )

        # Save cleaned data
        cleaned_df.to_csv(OUTPUT_FILE, index=False)

        # Print results
        print(f"\n{'='*60}")
        print(f"DEDUPLICATION SUMMARY")
        print(f"{'='*60}")
        print(f"Total URLs processed:        {stats['total_urls']}")
        print(f"Exact duplicates removed:    {stats['exact_duplicates']}")
        print(f"ID-based duplicates removed: {stats['id_based_duplicates']}")
        if USE_SIMILARITY_CHECK:
            print(f"Similarity duplicates removed: {stats['similarity_duplicates']}")
        print(f"Total removed:               {removed_count}")
        print(f"Final URL count:             {stats['final_count']}")

        if stats['platforms']:
            print(f"\nPlatforms detected:")
            for platform, count in stats['platforms'].items():
                if platform:
                    print(f"  - {platform}: {count} URLs")

        print(f"\n✓ Cleaned data saved to {OUTPUT_FILE}")

    except FileNotFoundError:
        print(f"Error: Could not find {INPUT_FILE}")
        print("Please ensure the file exists in the same directory as this script")
    except KeyError:
        print(f"Error: Column '{URL_COLUMN}' not found in CSV")
        print(f"Available columns: {df.columns.tolist()}")
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
