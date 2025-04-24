import os
import json
import csv
import io
import shutil
from datetime import datetime
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
from google.auth.transport.requests import Request

# Define paths
OUTPUT_DIR = "docs"  # GitHub Pages serves from /docs or root
DATA_DIR = os.path.join(OUTPUT_DIR, "data")
CSS_DIR = os.path.join(OUTPUT_DIR, "css")
JS_DIR = os.path.join(OUTPUT_DIR, "js")

# Google Drive API setup
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def get_drive_service():
    """Authenticate and create a Google Drive service"""
    creds = None
    token_path = 'token.json'
    
    # Load saved credentials if they exist
    if os.path.exists(token_path):
        with open(token_path, 'r') as token:
            creds = Credentials.from_authorized_user_info(json.load(token), SCOPES)
    
    # If no valid credentials, notify user
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # Save refreshed credentials
            with open(token_path, 'w') as token:
                token.write(creds.to_json())
        else:
            raise Exception("No valid credentials. Run auth_setup.py first.")
    
    return build('drive', 'v3', credentials=creds)

def find_folder_by_name(service, folder_name, parent_id=None):
    """Find a folder in Google Drive by name"""
    query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
    if parent_id:
        query += f" and '{parent_id}' in parents"
        
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    items = results.get('files', [])
    
    return items[0]['id'] if items else None

def download_file(service, file_id):
    """Download a file from Google Drive"""
    request = service.files().get_media(fileId=file_id)
    file_content = io.BytesIO()
    downloader = MediaIoBaseDownload(file_content, request)
    
    done = False
    while done is False:
        status, done = downloader.next_chunk()
    
    return file_content.getvalue()

def parse_csv(content, encoding='utf-8'):
    """Parse CSV content into a list of dictionaries"""
    try:
        text_content = content.decode(encoding)
    except UnicodeDecodeError:
        # Try with alternative encoding if utf-8 fails
        text_content = content.decode('cp1252')
    
    reader = csv.DictReader(text_content.splitlines())
    return list(reader)

def create_directory_structure():
    """Create output directory structure"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(CSS_DIR, exist_ok=True)
    os.makedirs(JS_DIR, exist_ok=True)

def copy_static_files():
    """Copy static files from src to output directory"""
    # Copy HTML file
    shutil.copy("src/index.html", OUTPUT_DIR)
    
    # Copy CSS files
    for file in os.listdir("src/css"):
        if file.endswith(".css"):
            shutil.copy(os.path.join("src/css", file), CSS_DIR)
    
    # Copy JS files
    for file in os.listdir("src/js"):
        if file.endswith(".js"):
            shutil.copy(os.path.join("src/js", file), JS_DIR)

def process_ga_data(data):
    """Process Google Analytics data"""
    processed_data = []
    
    for item in data:
        # Handle potential missing values or type conversions
        processed_item = {
            'date': item.get('Date', ''),
            'sessions': int(item.get('Sessions', 0)),
            'users': int(item.get('Users', 0)),
            'pageviews': int(item.get('Pageviews', 0)),
            'bounce_rate': float(item.get('Bounce Rate', '0').strip('%')) / 100 if item.get('Bounce Rate', '0').strip('%') else 0,
            'avg_session_duration': item.get('Avg. Session Duration', '0:00')
        }
        processed_data.append(processed_item)
    
    return processed_data

def process_social_data(data):
    """Process social media data"""
    processed_data = []
    
    for item in data:
        platform = item.get('Platform', '')
        processed_item = {
            'date': item.get('Date', ''),
            'platform': platform,
            'followers': int(item.get('Followers', 0)),
            'engagements': int(item.get('Engagements', 0)),
            'reach': int(item.get('Reach', 0)),
            'clicks': int(item.get('Clicks', 0))
        }
        processed_data.append(processed_item)
    
    return processed_data

def process_email_data(data):
    """Process email campaign data"""
    processed_data = []
    
    for item in data:
        # Convert percentages from strings to floats
        open_rate = item.get('Email open rate (MPP excluded)', '0%')
        if isinstance(open_rate, str) and '%' in open_rate:
            open_rate = float(open_rate.strip('%')) / 100
        
        click_rate = item.get('Email click rate', '0%')
        if isinstance(click_rate, str) and '%' in click_rate:
            click_rate = float(click_rate.strip('%')) / 100
        
        processed_item = {
            'campaign': item.get('Campaign', ''),
            'sent': int(item.get('Emails sent', 0)),
            'delivered': int(item.get('Email deliveries', 0)),
            'opened': int(item.get('Email opened (MPP excluded)', 0)),
            'clicked': int(item.get('Email clicked', 0)),
            'open_rate': open_rate,
            'click_rate': click_rate
        }
        processed_data.append(processed_item)
    
    return processed_data

def process_youtube_data(data):
    """Process YouTube data"""
    processed_data = []
    
    for item in data:
        processed_item = {
            'category': item.get('Viewer age', item.get('Viewer gender', item.get('Device type', item.get('Geography', '')))),
            'views': float(item.get('Views (%)', item.get('Views', 0))),
            'watch_time': float(item.get('Watch time (hours) (%)', item.get('Watch time (hours)', 0))),
            'avg_view_duration': item.get('Average view duration', '0:00')
        }
        processed_data.append(processed_item)
    
    return processed_data

def calculate_overview(ga_data, social_data, email_data, youtube_data):
    """Calculate overview metrics"""
    # GA metrics
    total_sessions = sum(item.get('sessions', 0) for item in ga_data)
    total_users = sum(item.get('users', 0) for item in ga_data)
    total_pageviews = sum(item.get('pageviews', 0) for item in ga_data)
    
    # Social metrics
    fb_followers = sum(item.get('followers', 0) for item in social_data if item.get('platform') == 'Facebook')
    ig_followers = sum(item.get('followers', 0) for item in social_data if item.get('platform') == 'Instagram')
    total_engagement = sum(item.get('engagements', 0) for item in social_data)
    
    # Email metrics
    total_sent = sum(item.get('sent', 0) for item in email_data)
    avg_open_rate = sum(item.get('open_rate', 0) for item in email_data) / len(email_data) if email_data else 0
    avg_click_rate = sum(item.get('click_rate', 0) for item in email_data) / len(email_data) if email_data else 0
    
    # Return overview metrics
    return {
        'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'ga': {
            'total_sessions': total_sessions,
            'total_users': total_users,
            'total_pageviews': total_pageviews
        },
        'social': {
            'facebook_followers': fb_followers,
            'instagram_followers': ig_followers,
            'total_engagement': total_engagement
        },
        'email': {
            'total_sent': total_sent,
            'avg_open_rate': avg_open_rate,
            'avg_click_rate': avg_click_rate
        },
        'youtube': {
            'total_views': sum(item.get('views', 0) for item in youtube_data)
        }
    }

def process_all_files():
    """Main function to process all files from Google Drive"""
    print("Starting data processing...")
    
    # Initialize Drive service
    service = get_drive_service()
    
    # Create directories
    create_directory_structure()
    
    # Copy static files
    copy_static_files()
    print("Copied static files to output directory")
    
    # Find main folder
    main_folder_id = find_folder_by_name(service, "Marketing Dashboard Data")
    if not main_folder_id:
        print("ERROR: Main folder 'Marketing Dashboard Data' not found in Google Drive")
        return
    
    # Find processed data folder
    processed_folder_id = find_folder_by_name(service, "Processed_Data", main_folder_id)
    if not processed_folder_id:
        print("ERROR: 'Processed_Data' folder not found in main folder")
        return
    
    # List all files in the processed folder
    results = service.files().list(
        q=f"'{processed_folder_id}' in parents and trashed=false", 
        spaces='drive',
        fields='files(id, name)'
    ).execute()
    
    files = results.get('files', [])
    if not files:
        print("No files found in Processed_Data folder")
        return
    
    # Prepare data containers
    ga_data = []
    social_data = []
    email_data = []
    youtube_data = []
    
    # Process each file
    for file in files:
        try:
            file_name = file['name']
            print(f"Processing {file_name}...")
            file_content = download_file(service, file['id'])
            
            # Determine file type and process
            if file_name.startswith("processed_GA"):
                data = parse_csv(file_content)
                ga_data.extend(process_ga_data(data))
            
            elif file_name.startswith("processed_FB") or file_name.startswith("processed_IG"):
                # Try cp1252 encoding for social media files
                data = parse_csv(file_content, encoding='cp1252')
                social_data.extend(process_social_data(data))
            
            elif "Email" in file_name:
                data = parse_csv(file_content)
                email_data.extend(process_email_data(data))
            
            elif file_name.startswith("processed_Youtube"):
                data = parse_csv(file_content)
                youtube_data.extend(process_youtube_data(data))
            
        except Exception as e:
            print(f"Error processing {file['name']}: {str(e)}")
    
    # Save processed data as JSON
    with open(os.path.join(DATA_DIR, "ga_data.json"), "w") as f:
        json.dump(ga_data, f)
    
    with open(os.path.join(DATA_DIR, "social_data.json"), "w") as f:
        json.dump(social_data, f)
    
    with open(os.path.join(DATA_DIR, "email_data.json"), "w") as f:
        json.dump(email_data, f)
    
    with open(os.path.join(DATA_DIR, "youtube_data.json"), "w") as f:
        json.dump(youtube_data, f)
    
    # Calculate and save overview
    overview = calculate_overview(ga_data, social_data, email_data, youtube_data)
    with open(os.path.join(DATA_DIR, "overview.json"), "w") as f:
        json.dump(overview, f)
    
    print("Data processing complete!")
    print(f"Output files saved to {OUTPUT_DIR} directory")
    print("You can now commit these files to GitHub and enable GitHub Pages")

if __name__ == "__main__":
    process_all_files()