# File: data_export.py
import sqlite3
import json
import os
from datetime import datetime, timedelta
import pandas as pd

def export_data_to_json(db_path="marketing_data.db", output_dir="data"):
    """Export data from SQLite to JSON files for client-side dashboard"""
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    
    # Export web analytics data
    export_web_analytics(conn, output_dir)
    
    # Export social media data
    export_social_media(conn, output_dir)
    
    # Export email data
    export_email_data(conn, output_dir)
    
    # Export YouTube data
    export_youtube_data(conn, output_dir)
    
    # Export general metrics for dashboard overview
    export_overview_metrics(conn, output_dir)
    
    # Close the connection
    conn.close()
    
    print(f"Data exported successfully to {output_dir}/")

def export_web_analytics(conn, output_dir):
    """Export web analytics data"""
    # Get Google Analytics data from metrics_data table
    cursor = conn.cursor()
    cursor.execute("""
        SELECT data_json 
        FROM metrics_data 
        WHERE platform = 'google_analytics'
    """)
    
    # Process results
    ga_data = []
    for row in cursor.fetchall():
        try:
            data = json.loads(row[0])
            ga_data.append(data)
        except json.JSONDecodeError:
            continue
    
    # Transform data into analytics metrics
    demographics = []
    pages = []
    traffic = []
    
    for item in ga_data:
        source_file = item.get('source_file', '')
        
        if 'GA_Demographics' in source_file:
            demographics.append(item)
        elif 'GA_Pages_And_Screens' in source_file:
            pages.append(item)
        elif 'GA_Traffic' in source_file:
            traffic.append(item)
    
    # Export data to respective files
    with open(f"{output_dir}/ga_demographics.json", 'w') as f:
        json.dump(demographics, f)
    
    with open(f"{output_dir}/ga_pages.json", 'w') as f:
        json.dump(pages, f)
    
    with open(f"{output_dir}/ga_traffic.json", 'w') as f:
        json.dump(traffic, f)

def export_social_media(conn, output_dir):
    """Export social media data (Facebook and Instagram)"""
    cursor = conn.cursor()
    
    # Facebook data
    cursor.execute("""
        SELECT data_json 
        FROM metrics_data 
        WHERE platform = 'facebook'
    """)
    
    fb_data = []
    for row in cursor.fetchall():
        try:
            data = json.loads(row[0])
            fb_data.append(data)
        except json.JSONDecodeError:
            continue
    
    # Instagram data
    cursor.execute("""
        SELECT data_json 
        FROM metrics_data 
        WHERE platform = 'instagram'
    """)
    
    ig_data = []
    for row in cursor.fetchall():
        try:
            data = json.loads(row[0])
            ig_data.append(data)
        except json.JSONDecodeError:
            continue
    
    # Categorize Facebook data
    fb_audience = [d for d in fb_data if 'FB_Audience' in d.get('source_file', '')]
    fb_posts = [d for d in fb_data if 'FB_Posts' in d.get('source_file', '')]
    fb_videos = [d for d in fb_data if 'FB_Videos' in d.get('source_file', '')]
    fb_interactions = [d for d in fb_data if 'FB_Interactions' in d.get('source_file', '')]
    fb_reach = [d for d in fb_data if 'FB_Reach' in d.get('source_file', '')]
    
    # Categorize Instagram data
    ig_audience = [d for d in ig_data if 'IG_Audience' in d.get('source_file', '')]
    ig_posts = [d for d in ig_data if 'IG_Posts' in d.get('source_file', '')]
    ig_interactions = [d for d in ig_data if 'IG_Interactions' in d.get('source_file', '')]
    ig_reach = [d for d in ig_data if 'IG_Reach' in d.get('source_file', '')]
    
    # Export Facebook data
    with open(f"{output_dir}/fb_audience.json", 'w') as f:
        json.dump(fb_audience, f)
    
    with open(f"{output_dir}/fb_posts.json", 'w') as f:
        json.dump(fb_posts, f)
    
    with open(f"{output_dir}/fb_videos.json", 'w') as f:
        json.dump(fb_videos, f)
    
    with open(f"{output_dir}/fb_interactions.json", 'w') as f:
        json.dump(fb_interactions, f)
    
    with open(f"{output_dir}/fb_reach.json", 'w') as f:
        json.dump(fb_reach, f)
    
    # Export Instagram data
    with open(f"{output_dir}/ig_audience.json", 'w') as f:
        json.dump(ig_audience, f)
    
    with open(f"{output_dir}/ig_posts.json", 'w') as f:
        json.dump(ig_posts, f)
    
    with open(f"{output_dir}/ig_interactions.json", 'w') as f:
        json.dump(ig_interactions, f)
    
    with open(f"{output_dir}/ig_reach.json", 'w') as f:
        json.dump(ig_reach, f)

def export_email_data(conn, output_dir):
    """Export email campaign data"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT data_json 
        FROM metrics_data 
        WHERE platform = 'email'
    """)
    
    email_data = []
    for row in cursor.fetchall():
        try:
            data = json.loads(row[0])
            email_data.append(data)
        except json.JSONDecodeError:
            continue
    
    # Export all email data
    with open(f"{output_dir}/email_campaigns.json", 'w') as f:
        json.dump(email_data, f)

def export_youtube_data(conn, output_dir):
    """Export YouTube data"""
    cursor = conn.cursor()
    cursor.execute("""
        SELECT data_json 
        FROM metrics_data 
        WHERE platform = 'youtube'
    """)
    
    yt_data = []
    for row in cursor.fetchall():
        try:
            data = json.loads(row[0])
            yt_data.append(data)
        except json.JSONDecodeError:
            continue
    
    # Categorize YouTube data
    yt_demographics = [d for d in yt_data if 'YouTube_Age' in d.get('source_file', '') or 'YouTube_Gender' in d.get('source_file', '')]
    yt_geography = [d for d in yt_data if 'YouTube_Geography' in d.get('source_file', '') or 'YouTube_Cities' in d.get('source_file', '')]
    yt_content = [d for d in yt_data if 'YouTube_Content' in d.get('source_file', '')]
    yt_subscription = [d for d in yt_data if 'YouTube_Subscription' in d.get('source_file', '')]
    
    # Export YouTube data
    with open(f"{output_dir}/yt_demographics.json", 'w') as f:
        json.dump(yt_demographics, f)
    
    with open(f"{output_dir}/yt_geography.json", 'w') as f:
        json.dump(yt_geography, f)
    
    with open(f"{output_dir}/yt_content.json", 'w') as f:
        json.dump(yt_content, f)
    
    with open(f"{output_dir}/yt_subscription.json", 'w') as f:
        json.dump(yt_subscription, f)

def export_overview_metrics(conn, output_dir):
    """Export aggregated metrics for dashboard overview"""
    # Generate date range for the past 30 days
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    # Format dates as strings
    date_range = []
    current = start_date
    while current <= end_date:
        date_range.append(current.strftime('%Y-%m-%d'))
        current += timedelta(days=1)
    
    # Create a structure for overview metrics
    overview = {
        "date_range": date_range,
        "platforms": ["facebook", "instagram", "google_analytics", "youtube", "email"],
        "metrics": {}
    }
    
    # Populate with metrics from the database (simplified for demonstration)
    cursor = conn.cursor()
    
    # Example: Get platform counts
    cursor.execute("""
        SELECT platform, COUNT(*) as count
        FROM metrics_data
        GROUP BY platform
    """)
    
    for platform, count in cursor.fetchall():
        overview["metrics"][platform] = {"record_count": count}
    
    # Export overview data
    with open(f"{output_dir}/overview.json", 'w') as f:
        json.dump(overview, f)

def generate_dummy_data():
    """For testing: Generate dummy data for dashboard development if SQLite DB is empty"""
    # Create output directory
    output_dir = "data"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Generate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    date_range = [(start_date + timedelta(days=i)).strftime('%Y-%m-%d') for i in range(31)]
    
    # Overview data with dummy metrics
    overview = {
        "date_range": date_range,
        "platforms": ["facebook", "instagram", "google_analytics", "youtube", "email"],
        "metrics": {
            "facebook": {
                "reach": [random.randint(1000, 5000) for _ in range(len(date_range))],
                "engagement": [random.randint(100, 1000) for _ in range(len(date_range))]
            },
            "instagram": {
                "reach": [random.randint(1500, 6000) for _ in range(len(date_range))],
                "engagement": [random.randint(200, 1500) for _ in range(len(date_range))]
            },
            "google_analytics": {
                "sessions": [random.randint(500, 3000) for _ in range(len(date_range))],
                "pageviews": [random.randint(1000, 7000) for _ in range(len(date_range))]
            },
            "youtube": {
                "views": [random.randint(300, 2000) for _ in range(len(date_range))],
                "watch_time": [random.randint(5000, 15000) for _ in range(len(date_range))]
            },
            "email": {
                "open_rate": [round(random.uniform(0.15, 0.35), 2) for _ in range(len(date_range))],
                "click_rate": [round(random.uniform(0.05, 0.15), 2) for _ in range(len(date_range))]
            }
        }
    }
    
    # Export dummy data
    with open(f"{output_dir}/overview.json", 'w') as f:
        json.dump(overview, f)
    
    print("Dummy data generated successfully")

if __name__ == "__main__":
    import argparse
    import random
    
    parser = argparse.ArgumentParser(description='Export SQLite data to JSON for the dashboard')
    parser.add_argument('--db', type=str, default='marketing_data.db', help='Path to SQLite database')
    parser.add_argument('--output', type=str, default='data', help='Output directory for JSON files')
    parser.add_argument('--dummy', action='store_true', help='Generate dummy data for testing')
    
    args = parser.parse_args()
    
    if args.dummy:
        generate_dummy_data()
    else:
        export_data_to_json(args.db, args.output)
