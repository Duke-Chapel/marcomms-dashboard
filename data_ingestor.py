# File: data_ingestor.py
import os
import argparse
import logging
import sqlite3
import pandas as pd
import chardet
import json
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("ingestion.log"),
        logging.StreamHandler()
    ]
)

class DataIngestor:
    def __init__(self, db_path: str = "marketing_data.db"):
        self.db_path = db_path
        self._init_db()
        self.processed_count = 0
        self.error_count = 0

    def _init_db(self):
        """Initialize database with a simpler schema"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Create a table with a JSON column for flexible storage
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS metrics_data (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        source_file TEXT,
                        platform TEXT,
                        metric_date TEXT,
                        data_json TEXT,
                        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create processed files tracking table
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS processed_files (
                        file_path TEXT PRIMARY KEY,
                        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
        except sqlite3.Error as e:
            logging.error(f"Database initialization failed: {str(e)}")
            raise

    def ingest_directory(self, directory: str):
        """Main ingestion method"""
        logging.info(f"Starting ingestion from: {directory}")
        path = Path(directory)
        
        if not path.exists():
            logging.error(f"Directory not found: {directory}")
            return
            
        for file_path in path.glob("*.csv"):
            logging.info(f"Found CSV file: {file_path.name}")
            if self._should_process(file_path):
                self._process_file(file_path)
            else:
                logging.info(f"Skipping already processed file: {file_path.name}")

        logging.info(f"Ingestion complete. Processed: {self.processed_count} files, Errors: {self.error_count}")

    def _should_process(self, file_path: Path) -> bool:
        """Check if file needs processing"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                result = conn.execute(
                    "SELECT file_path FROM processed_files WHERE file_path = ?",
                    (str(file_path),)
                )
                return not result.fetchone()
        except sqlite3.Error as e:
            logging.error(f"Database query failed: {str(e)}")
            return False

    def _process_file(self, file_path: Path):
        """Core file processing logic with improved handling"""
        try:
            logging.info(f"Processing: {file_path.name}")
            
            # Special handling for GA files with encoding issues
            if file_path.name.startswith('GA_'):
                try:
                    # Direct approach for GA files
                    df = pd.read_csv(
                        file_path,
                        encoding='latin1',  # More permissive encoding
                        sep=',',            # Default separator
                        skiprows=1,         # Skip header comments
                        on_bad_lines='warn',
                        dtype='object',
                        engine='python'
                    )
                    
                    logging.info(f"Loaded {len(df)} rows from {file_path.name} using GA special handling")
                    
                    # Clean column names
                    df.columns = df.columns.str.strip().str.lower()
                    
                    # Add metadata
                    df['source_file'] = file_path.name
                    df['platform'] = 'google_analytics'
                    df['metric_date'] = datetime.now().strftime('%Y-%m-%d')
                    
                    # Store and mark as processed
                    self._store_as_json(df, file_path)
                    with sqlite3.connect(self.db_path) as conn:
                        conn.execute("INSERT INTO processed_files (file_path) VALUES (?)", (str(file_path),))
                    
                    self.processed_count += 1
                    return
                    
                except Exception as e:
                    logging.error(f"Failed to process GA file {file_path.name}: {str(e)}")
                    self.error_count += 1
                    return
            
            # Regular file processing for non-GA files
            # Detect encoding
            with open(file_path, 'rb') as f:
                rawdata = f.read(100000)
                encoding = chardet.detect(rawdata)['encoding'] or 'utf-8'
            
            # Pre-process for handling special formats
            skip_rows = 0
            sep = ','
            
            # Check for "sep=" header or comment lines
            with open(file_path, 'r', encoding=encoding, errors='replace') as f:
                first_line = f.readline().strip()
                if first_line.startswith('sep='):
                    sep = first_line[4:].strip()
                    skip_rows = 1
                elif first_line.startswith('#'):
                    skip_rows = 1
                    
            # Read CSV with parameters adjusted for file format
            df = pd.read_csv(
                file_path,
                encoding=encoding,
                sep=sep,
                skiprows=skip_rows,
                on_bad_lines='warn',
                thousands=',',
                dtype='object',
                engine='python'
            )
            
            logging.info(f"Loaded {len(df)} rows from {file_path.name}")

            # Clean column names
            df.columns = df.columns.str.strip().str.lower()
            
            # Add metadata columns
            df['source_file'] = file_path.name
            df['platform'] = self._detect_platform(file_path.name)
            
            # Extract date if available
            if 'date' in df.columns:
                df['metric_date'] = pd.to_datetime(df['date'], errors='coerce')
            else:
                df['metric_date'] = datetime.now().strftime('%Y-%m-%d')
            
            # Store data as JSON
            self._store_as_json(df, file_path)
            
            # Mark file as processed
            with sqlite3.connect(self.db_path) as conn:
                conn.execute(
                    "INSERT INTO processed_files (file_path) VALUES (?)",
                    (str(file_path),)
                )
                
            self.processed_count += 1
            logging.info(f"Successfully processed {file_path.name}")

        except Exception as e:
            self.error_count += 1
            logging.error(f"Failed to process {file_path.name}: {str(e)}")
            if 'df' in locals():
                logging.error(f"File structure: {list(df.columns)}")

    def _detect_platform(self, filename: str) -> str:
        """Detect platform from filename"""
        filename = filename.lower()
        platform_map = {
            'facebook': ['fb_', 'facebook'],
            'instagram': ['ig_', 'instagram'],
            'google_analytics': ['ga_', 'analytics'],
            'youtube': ['yt_', 'youtube'],
            'email': ['email', 'mailchimp']
        }
        for platform, keywords in platform_map.items():
            if any(kw in filename for kw in keywords):
                return platform
        return 'unknown'

    def _store_as_json(self, df, file_path):
        """Store data in JSON format - simpler approach"""
        try:
            platform = self._detect_platform(file_path.name)
            
            # Process by groups to avoid large transactions
            batch_size = 100
            total_rows = len(df)
            
            with sqlite3.connect(self.db_path) as conn:
                for i in range(0, total_rows, batch_size):
                    end_idx = min(i + batch_size, total_rows)
                    batch_df = df.iloc[i:end_idx]
                    
                    # Convert each row to JSON
                    for _, row in batch_df.iterrows():
                        # Convert row to dict, handle NaN values
                        row_dict = row.fillna('').to_dict()
                        json_data = json.dumps(row_dict)
                        
                        # Use parameterized query to prevent SQL injection
                        conn.execute("""
                            INSERT INTO metrics_data (
                                source_file, platform, metric_date, data_json
                            ) VALUES (?, ?, ?, ?)
                        """, (
                            row_dict.get('source_file', ''),
                            platform,
                            row_dict.get('metric_date', ''),
                            json_data
                        ))
            
        except Exception as e:
            logging.error(f"Error storing data: {str(e)}")
            raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Marketing Data Ingestor')
    parser.add_argument('--dir', type=str, required=True, help='Directory containing CSV files')
    args = parser.parse_args()

    ingestor = DataIngestor()
    ingestor.ingest_directory(args.dir)
    print("Check ingestion.log for detailed results")