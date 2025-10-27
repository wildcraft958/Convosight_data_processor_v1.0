"""
Data Points Generator Script (CORRECTED VERSION)
=================================================
This script processes social media data from a Final Data File CSV and generates 
a filled Data Points summary table with metrics for different brands across platforms.

KEY CORRECTIONS:
- Uses videoPlayCount instead of videoViewCount for ER calculations
- For videos/shorts: Avg ER = sum(engagement) / sum(videoPlayCount) * 100
- For images/sidecars: Avg ER = sum(engagement) / sum(followers) * 100
- Only videos/shorts data used for all tables except the last table (Images/Sidecar)
- Uses existing Engagement column from data

Author: Auto-generated (Corrected)
Date: October 27, 2025
"""

import pandas as pd
import numpy as np
from datetime import datetime


def calculate_avg_er_for_videos_shorts(data):
    """
    Calculate average ER for videos/shorts using sum of engagement / sum of play count

    Args:
        data: DataFrame containing video/shorts posts

    Returns:
        float: Average ER or None
    """
    # Filter only videos and shorts
    video_shorts_data = data[data['Post Format'].str.lower().isin(['video', 'shorts'])]

    if len(video_shorts_data) == 0:
        return None

    total_engagement = video_shorts_data['Engagement'].sum()
    total_play_count = video_shorts_data['videoPlayCount'].sum()

    if pd.notna(total_play_count) and total_play_count > 0:
        return (total_engagement / total_play_count) * 100
    else:
        return None


def calculate_avg_er_for_images_sidecars(data):
    """
    Calculate average ER for images/sidecars using sum of engagement / sum of followers

    Args:
        data: DataFrame containing image/sidecar posts

    Returns:
        float: Average ER or None
    """
    # Filter only images and sidecars
    image_sidecar_data = data[data['Post Format'].str.lower().isin(['image', 'sidecar'])]

    if len(image_sidecar_data) == 0:
        return None

    total_engagement = image_sidecar_data['Engagement'].sum()

    # For followers, we use the total (assuming each post reaches the same follower base)
    # So sum of followers = followers * number of posts
    followers_list = image_sidecar_data['Followers'].dropna()
    if len(followers_list) > 0:
        # Get the followers count (should be consistent for brand account)
        followers_count = followers_list.iloc[0]
        total_followers = followers_count * len(image_sidecar_data)

        if pd.notna(total_followers) and total_followers > 0:
            return (total_engagement / total_followers) * 100

    return None


def create_data_points_summary(data_file, brands):
    """
    Create comprehensive summary of data points for all brands

    Args:
        data_file: DataFrame containing the social media data
        brands: List of brand names to process

    Returns:
        DataFrame with summary statistics
    """
    results = []

    for brand in brands:
        brand_data = data_file[data_file['Brand Name'] == brand].copy()

        if len(brand_data) == 0:
            continue

        # Overall metrics (only videos/shorts for ER calculation)
        total_posts = len(brand_data)

        # Calculate average posts per month
        brand_data['timestamp_dt'] = pd.to_datetime(brand_data['timestamp'], errors='coerce')
        if brand_data['timestamp_dt'].notna().sum() > 0:
            date_range = (brand_data['timestamp_dt'].max() - brand_data['timestamp_dt'].min()).days
            months = max(date_range / 30, 1)  # At least 1 month
            avg_posts_per_month = total_posts / months
        else:
            avg_posts_per_month = None

        total_likes = brand_data['likesCount'].sum()
        total_comments = brand_data['commentsCount'].sum()
        total_engagement = brand_data['Engagement'].sum()

        # Total views = sum of videoPlayCount for videos/shorts
        video_shorts_data = brand_data[brand_data['Post Format'].str.lower().isin(['video', 'shorts'])]
        total_views = video_shorts_data['videoPlayCount'].sum()

        # Overall Avg ER (only for videos/shorts)
        avg_er = calculate_avg_er_for_videos_shorts(brand_data)

        # TikTok metrics (only videos/shorts)
        tiktok_data = brand_data[brand_data['Source'] == 'TikTok']
        tiktok_video_shorts = tiktok_data[tiktok_data['Post Format'].str.lower().isin(['video', 'shorts'])]
        tiktok_posts = len(tiktok_video_shorts)
        tiktok_followers = tiktok_data['Followers'].iloc[0] if len(tiktok_data) > 0 and pd.notna(tiktok_data['Followers'].iloc[0]) else None
        tiktok_avg_er = calculate_avg_er_for_videos_shorts(tiktok_data)

        # Instagram metrics (only videos/shorts)
        instagram_data = brand_data[brand_data['Source'] == 'Instagram']
        instagram_video_shorts = instagram_data[instagram_data['Post Format'].str.lower().isin(['video', 'shorts'])]
        instagram_posts = len(instagram_video_shorts)
        instagram_followers = instagram_data['Followers'].iloc[0] if len(instagram_data) > 0 and pd.notna(instagram_data['Followers'].iloc[0]) else None
        instagram_avg_er = calculate_avg_er_for_videos_shorts(instagram_data)

        # Instagram Branded vs Tagged (only videos/shorts)
        instagram_branded = instagram_data[instagram_data['Type of Post'] == 'Branded']
        instagram_branded_video_shorts = instagram_branded[instagram_branded['Post Format'].str.lower().isin(['video', 'shorts'])]
        instagram_branded_posts = len(instagram_branded_video_shorts)
        instagram_branded_er = calculate_avg_er_for_videos_shorts(instagram_branded)

        instagram_tagged = instagram_data[instagram_data['Type of Post'] == 'Tagged']
        instagram_tagged_video_shorts = instagram_tagged[instagram_tagged['Post Format'].str.lower().isin(['video', 'shorts'])]
        instagram_tagged_posts = len(instagram_tagged_video_shorts)
        instagram_tagged_er = calculate_avg_er_for_videos_shorts(instagram_tagged)

        # YouTube metrics (only videos/shorts)
        youtube_data = brand_data[brand_data['Source'] == 'YouTube']
        youtube_video_shorts = youtube_data[youtube_data['Post Format'].str.lower().isin(['video', 'shorts'])]
        youtube_posts = len(youtube_video_shorts)
        youtube_followers = youtube_data['Followers'].iloc[0] if len(youtube_data) > 0 and pd.notna(youtube_data['Followers'].iloc[0]) else None
        youtube_avg_er = calculate_avg_er_for_videos_shorts(youtube_data)

        # YouTube by post format (videos and shorts)
        youtube_video = youtube_data[youtube_data['Post Format'].str.lower() == 'video']
        youtube_shorts = youtube_data[youtube_data['Post Format'].str.lower() == 'shorts']

        youtube_video_posts = len(youtube_video)
        youtube_video_followers = youtube_video['Followers'].iloc[0] if len(youtube_video) > 0 and pd.notna(youtube_video['Followers'].iloc[0]) else None
        youtube_video_er = calculate_avg_er_for_videos_shorts(youtube_video)

        youtube_shorts_posts = len(youtube_shorts)
        youtube_shorts_followers = youtube_shorts['Followers'].iloc[0] if len(youtube_shorts) > 0 and pd.notna(youtube_shorts['Followers'].iloc[0]) else None
        youtube_shorts_er = calculate_avg_er_for_videos_shorts(youtube_shorts)

        # Instagram by post format (images and sidecars - for last table only)
        instagram_image = instagram_data[instagram_data['Post Format'].str.lower() == 'image']
        instagram_sidecar = instagram_data[instagram_data['Post Format'].str.lower() == 'sidecar']

        instagram_image_posts = len(instagram_image)
        instagram_image_followers = instagram_image['Followers'].iloc[0] if len(instagram_image) > 0 and pd.notna(instagram_image['Followers'].iloc[0]) else None
        instagram_image_er = calculate_avg_er_for_images_sidecars(instagram_image)

        instagram_sidecar_posts = len(instagram_sidecar)
        instagram_sidecar_followers = instagram_sidecar['Followers'].iloc[0] if len(instagram_sidecar) > 0 and pd.notna(instagram_sidecar['Followers'].iloc[0]) else None
        instagram_sidecar_er = calculate_avg_er_for_images_sidecars(instagram_sidecar)

        results.append({
            'Brand': brand,
            # Overall
            'Total Posts': total_posts,
            'Avg Posts Per Month': avg_posts_per_month,
            'Total Likes': total_likes,
            'Total Comments': total_comments,
            'Total Engagement': total_engagement,
            'Total Views': total_views,
            'Overall Avg ER': avg_er,
            # TikTok
            'TikTok Total Posts': tiktok_posts,
            'TikTok Followers': tiktok_followers,
            'TikTok Avg ER': tiktok_avg_er,
            # Instagram
            'Instagram Total Posts': instagram_posts,
            'Instagram Followers': instagram_followers,
            'Instagram Avg ER': instagram_avg_er,
            # Instagram Branded/Tagged
            'Instagram Branded Posts': instagram_branded_posts,
            'Instagram Branded ER': instagram_branded_er,
            'Instagram Tagged Posts': instagram_tagged_posts,
            'Instagram Tagged ER': instagram_tagged_er,
            # YouTube
            'YouTube Total Posts': youtube_posts,
            'YouTube Followers': youtube_followers,
            'YouTube Avg ER': youtube_avg_er,
            # YouTube by format
            'YouTube Video Posts': youtube_video_posts,
            'YouTube Video Followers': youtube_video_followers,
            'YouTube Video ER': youtube_video_er,
            'YouTube Shorts Posts': youtube_shorts_posts,
            'YouTube Shorts Followers': youtube_shorts_followers,
            'YouTube Shorts ER': youtube_shorts_er,
            # Instagram by format (for last table)
            'Instagram Image Posts': instagram_image_posts,
            'Instagram Image Followers': instagram_image_followers,
            'Instagram Image ER': instagram_image_er,
            'Instagram Sidecar Posts': instagram_sidecar_posts,
            'Instagram Sidecar Followers': instagram_sidecar_followers,
            'Instagram Sidecar ER': instagram_sidecar_er,
        })

    return pd.DataFrame(results)


def create_filled_data_points_table(summary_df, brands):
    """
    Create the filled data points table in the template format

    Args:
        summary_df: DataFrame containing summary statistics
        brands: List of brand names

    Returns:
        DataFrame formatted according to the template structure
    """
    template_rows = []

    # Row 0: Headers for overall section
    template_rows.append({
        'col0': None, 'col1': 'Brand', 'col2': 'Total Posts', 'col3': 'Average Post per Month',
        'col4': 'Total Likes', 'col5': 'Total Comments', 'col6': 'Total Engagement', 
        'col7': 'Total Views', 'col8': 'Avg ER', 'col9': None, 
        'col10': 'Avg ER calculate only for video/shorts posts = sum of engagement/ sum of views',
        'col11': None, 'col12': None, 'col13': None, 'col14': None, 'col15': None
    })

    # Row 1: Note
    template_rows.append({
        'col0': None, 'col1': None, 'col2': None, 'col3': None,
        'col4': None, 'col5': None, 'col6': None, 'col7': None, 
        'col8': None, 'col9': None, 'col10': 'Engagement = Likes+Comments',
        'col11': None, 'col12': None, 'col13': None, 'col14': None, 'col15': None
    })

    # Rows 2-8: Brand data for overall section
    for brand in brands:
        brand_summary = summary_df[summary_df['Brand'] == brand].iloc[0] if len(summary_df[summary_df['Brand'] == brand]) > 0 else None
        if brand_summary is not None:
            template_rows.append({
                'col0': None, 'col1': brand, 
                'col2': brand_summary['Total Posts'],
                'col3': round(brand_summary['Avg Posts Per Month'], 2) if pd.notna(brand_summary['Avg Posts Per Month']) else None,
                'col4': brand_summary['Total Likes'],
                'col5': brand_summary['Total Comments'],
                'col6': brand_summary['Total Engagement'],
                'col7': brand_summary['Total Views'],
                'col8': round(brand_summary['Overall Avg ER'], 2) if pd.notna(brand_summary['Overall Avg ER']) else None,
                'col9': None, 'col10': None, 'col11': None, 'col12': None, 
                'col13': None, 'col14': None, 'col15': None
            })

    # Empty rows
    for _ in range(3):
        template_rows.append({f'col{i}': None for i in range(16)})

    # Row 12: Section header for TikTok/Instagram/YouTube
    template_rows.append({
        'col0': None, 'col1': 'Brand', 'col2': 'TikTok', 'col3': None,
        'col4': None, 'col5': 'Instagram', 'col6': None, 'col7': None, 
        'col8': 'YouTube', 'col9': None, 'col10': None, 'col11': None, 
        'col12': None, 'col13': None, 'col14': None, 'col15': None
    })

    # Row 13: Sub-headers
    template_rows.append({
        'col0': None, 'col1': None, 'col2': 'Total Posts', 'col3': 'Avg ER',
        'col4': '# of Followers', 'col5': 'Total Posts', 'col6': 'Avg ER', 
        'col7': '# of Followers', 'col8': 'Total Posts', 'col9': 'Avg ER',
        'col10': '# of Followers', 'col11': None, 'col12': None, 
        'col13': None, 'col14': None, 'col15': None
    })

    # Rows 14-20: Brand data for TikTok/Instagram/YouTube
    for brand in brands:
        brand_summary = summary_df[summary_df['Brand'] == brand].iloc[0] if len(summary_df[summary_df['Brand'] == brand]) > 0 else None
        if brand_summary is not None:
            template_rows.append({
                'col0': None, 'col1': brand,
                'col2': brand_summary['TikTok Total Posts'] if brand_summary['TikTok Total Posts'] > 0 else None,
                'col3': round(brand_summary['TikTok Avg ER'], 2) if pd.notna(brand_summary['TikTok Avg ER']) else None,
                'col4': brand_summary['TikTok Followers'],
                'col5': brand_summary['Instagram Total Posts'] if brand_summary['Instagram Total Posts'] > 0 else None,
                'col6': round(brand_summary['Instagram Avg ER'], 2) if pd.notna(brand_summary['Instagram Avg ER']) else None,
                'col7': brand_summary['Instagram Followers'],
                'col8': brand_summary['YouTube Total Posts'] if brand_summary['YouTube Total Posts'] > 0 else None,
                'col9': round(brand_summary['YouTube Avg ER'], 2) if pd.notna(brand_summary['YouTube Avg ER']) else None,
                'col10': brand_summary['YouTube Followers'],
                'col11': None, 'col12': None, 'col13': None, 'col14': None, 'col15': None
            })

    # Empty rows
    for _ in range(3):
        template_rows.append({f'col{i}': None for i in range(16)})

    # Row 24: Section header for Branded/Tagged
    template_rows.append({
        'col0': None, 'col1': 'Brand', 'col2': 'Total Branded Posts', 'col3': 'Branded Avg ER%',
        'col4': 'Total Tagged Posts', 'col5': 'Tagged ER%', 'col6': None, 'col7': None,
        'col8': None, 'col9': None, 'col10': None, 'col11': None,
        'col12': None, 'col13': None, 'col14': None, 'col15': None
    })

    # Rows 25-31: Brand data for Branded/Tagged (Instagram only)
    for brand in brands:
        brand_summary = summary_df[summary_df['Brand'] == brand].iloc[0] if len(summary_df[summary_df['Brand'] == brand]) > 0 else None
        if brand_summary is not None:
            template_rows.append({
                'col0': None, 'col1': brand,
                'col2': brand_summary['Instagram Branded Posts'] if brand_summary['Instagram Branded Posts'] > 0 else None,
                'col3': round(brand_summary['Instagram Branded ER'], 2) if pd.notna(brand_summary['Instagram Branded ER']) else None,
                'col4': brand_summary['Instagram Tagged Posts'] if brand_summary['Instagram Tagged Posts'] > 0 else None,
                'col5': round(brand_summary['Instagram Tagged ER'], 2) if pd.notna(brand_summary['Instagram Tagged ER']) else None,
                'col6': None, 'col7': None, 'col8': None, 'col9': None,
                'col10': None, 'col11': None, 'col12': None, 'col13': None, 
                'col14': None, 'col15': None
            })

    # Empty rows
    for _ in range(3):
        template_rows.append({f'col{i}': None for i in range(16)})

    # Row 35: Section header for Video/Shorts/Images/Sidecar
    template_rows.append({
        'col0': None, 'col1': 'Brand', 'col2': 'Video', 'col3': None,
        'col4': None, 'col5': 'Shorts', 'col6': None, 'col7': None,
        'col8': 'Images', 'col9': None, 'col10': None, 'col11': 'Sidecar',
        'col12': None, 'col13': None, 'col14': None, 'col15': None
    })

    # Row 36: Sub-headers with note
    template_rows.append({
        'col0': None, 'col1': None, 'col2': 'Total Posts', 'col3': 'Avg ER',
        'col4': '# of Followers', 'col5': 'Total Posts', 'col6': 'Avg ER', 
        'col7': '# of Followers', 'col8': 'Total Posts', 'col9': 'Avg ER',
        'col10': '# of Followers', 'col11': 'Total Posts', 'col12': 'Avg ER',
        'col13': '# of Followers', 'col14': None, 
        'col15': 'Avg ER = Sum of engagement/ sum of followers'
    })

    # Rows 37-43: Brand data for Video/Shorts/Images/Sidecar
    for brand in brands:
        brand_summary = summary_df[summary_df['Brand'] == brand].iloc[0] if len(summary_df[summary_df['Brand'] == brand]) > 0 else None
        if brand_summary is not None:
            template_rows.append({
                'col0': None, 'col1': brand,
                'col2': brand_summary['YouTube Video Posts'] if brand_summary['YouTube Video Posts'] > 0 else None,
                'col3': round(brand_summary['YouTube Video ER'], 2) if pd.notna(brand_summary['YouTube Video ER']) else None,
                'col4': brand_summary['YouTube Video Followers'],
                'col5': brand_summary['YouTube Shorts Posts'] if brand_summary['YouTube Shorts Posts'] > 0 else None,
                'col6': round(brand_summary['YouTube Shorts ER'], 2) if pd.notna(brand_summary['YouTube Shorts ER']) else None,
                'col7': brand_summary['YouTube Shorts Followers'],
                'col8': brand_summary['Instagram Image Posts'] if brand_summary['Instagram Image Posts'] > 0 else None,
                'col9': round(brand_summary['Instagram Image ER'], 2) if pd.notna(brand_summary['Instagram Image ER']) else None,
                'col10': brand_summary['Instagram Image Followers'],
                'col11': brand_summary['Instagram Sidecar Posts'] if brand_summary['Instagram Sidecar Posts'] > 0 else None,
                'col12': round(brand_summary['Instagram Sidecar ER'], 2) if pd.notna(brand_summary['Instagram Sidecar ER']) else None,
                'col13': brand_summary['Instagram Sidecar Followers'],
                'col14': None, 'col15': None
            })

    # Create the final dataframe
    filled_data_points = pd.DataFrame(template_rows)

    # Rename columns to match original
    filled_data_points.columns = [f'Unnamed: {i}' for i in range(16)]

    return filled_data_points


def main():
    """Main function to process data and generate filled data points table"""

    # Input and output file paths
    input_file = 'Copy of Abbott Ensure USA_Final Data - Final Data Updated.csv'
    output_file = 'Filled_Data_Points.csv'

    print("=" * 80)
    print("Data Points Generator (CORRECTED VERSION)")
    print("=" * 80)
    print(f"\nReading data from: {input_file}")

    # Load the data
    try:
        data_file = pd.read_csv(input_file)
        print(f"✓ Successfully loaded {len(data_file)} rows")
    except FileNotFoundError:
        print(f"✗ Error: File '{input_file}' not found!")
        return
    except Exception as e:
        print(f"✗ Error reading file: {e}")
        return

    # Standardize and clean data
    print("\nCleaning and standardizing data...")

    # Clean brand names
    data_file['Brand Name'] = data_file['Brand Name'].str.strip()
    data_file['Brand Name'] = data_file['Brand Name'].replace({'Muscle Milk ': 'Muscle Milk'})

    # Standardize Post Format
    data_file['Post Format'] = data_file['Post Format'].str.lower().str.capitalize()

    # Standardize Type of Post
    data_file['Type of Post'] = data_file['Type of Post'].str.capitalize()

    # Convert videoPlayCount and videoViewCount to numeric
    data_file['videoPlayCount'] = pd.to_numeric(data_file['videoPlayCount'], errors='coerce')
    data_file['videoViewCount'] = pd.to_numeric(data_file['videoViewCount'], errors='coerce')

    print("✓ Data cleaned")

    # Define brands to process
    brands = ['Ensure', 'Boost', 'Orgain', 'Premier Protein', 'Muscle Milk', 'Owyn', 'Kate Farms']

    # Create summary
    print("\nGenerating summary statistics...")
    summary_df = create_data_points_summary(data_file, brands)
    print(f"✓ Summary created for {len(summary_df)} brands")

    # Create filled data points table
    print("\nCreating filled data points table...")
    filled_data_points = create_filled_data_points_table(summary_df, brands)
    print("✓ Data points table created")

    # Save to CSV
    print(f"\nSaving to: {output_file}")
    filled_data_points.to_csv(output_file, index=False)
    print("✓ File saved successfully")

    # Print summary statistics
    print("\n" + "=" * 80)
    print("Summary Statistics")
    print("=" * 80)
    print(f"Total Posts: {len(data_file)}")
    print(f"\nPosts by Source:")
    print(data_file['Source'].value_counts().to_string())
    print(f"\nPosts by Brand:")
    print(data_file['Brand Name'].value_counts().to_string())
    print("\n" + "=" * 80)
    print("✓ Processing complete!")
    print("=" * 80)

    # Notes
    print("\nIMPORTANT NOTES:")
    print("=" * 80)
    print("- For Videos/Shorts: Avg ER = sum(Engagement) / sum(videoPlayCount) * 100")
    print("- For Images/Sidecars: Avg ER = sum(Engagement) / sum(Followers) * 100")
    print("- All tables use videos/shorts data EXCEPT the last table (Images/Sidecar)")
    print("- Uses existing Engagement column from the data file")
    print("- Uses videoPlayCount (not videoViewCount) for ER calculations")


if __name__ == "__main__":
    main()
