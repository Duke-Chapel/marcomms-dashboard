import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# Define OAuth scopes for Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def setup_authentication():
    """Set up Google Drive authentication and save token"""
    creds = None
    token_path = 'token.json'
    
    # Load saved credentials if they exist
    if os.path.exists(token_path):
        with open(token_path, 'r') as token:
            creds = Credentials.from_authorized_user_info(json.load(token), SCOPES)
    
    # If no valid credentials, authenticate
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save credentials
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
    
    print("Authentication successful! Token saved to 'token.json'")
    print("You can now run the data processing script.")

if __name__ == "__main__":
    setup_authentication()