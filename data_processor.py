import pandas as pd
from sqlalchemy import create_engine, inspect, text
import chardet
import csv
import re

def detect_encoding(file_path):
    with open(file_path, 'rb') as f:
        result = chardet.detect(f.read(100000))  # Increased sample size
    return result['encoding']

def clean_column_name(name):
    # Remove invalid characters and standardize
    name = re.sub(r'[^a-z0-9_]', '', name.strip().lower().replace(' ', '_'))
    return name.replace('__', '_').rstrip('_')  # Clean duplicates and trailing underscores

def add_column_if_not_exists(conn, table_name, column_name, column_type):
    """Safely add a column if it doesn't exist already"""
    try:
        conn.execute(text(f'ALTER TABLE {table_name} ADD COLUMN "{column_name}" {column_type};'))
    except Exception as e:
        # Column likely already exists - ignore the error
        pass

def process_ga_file(file_path):
    # Read file as text first to examine structure
    with open(file_path, 'r', encoding='latin1', errors='replace') as f:
        lines = f.readlines()
    
    # Find where real data starts (after comments)
    data_start = 0
    for i, line in enumerate(lines):
        if not line.startswith('#') and ',' in line:
            data_start = i
            break
    
    # Read only data portion with fixed delimiter
    df = pd.read_csv(
        file_path,
        encoding='latin1',
        sep=',',           # Force comma delimiter
        skiprows=data_start,
        on_bad_lines='skip',
        dtype='object',
        engine='python'
    )
    
    return df

def process_csv(file_path, engine):
    try:
        # 1. Handle Encoding with Fallback
        try:
            encoding = detect_encoding(file_path)
        except:
            encoding = 'latin1'  # Fallback encoding

        # 2. Skip Metadata Rows and Detect Delimiter
        skip_rows = 0
        with open(file_path, 'r', encoding=encoding) as f:
            lines = []
            for line in f:
                if line.startswith(('#', 'sep=')):
                    skip_rows += 1
                else:
                    lines.append(line)
                if len(lines) >= 10:  # Sample 10 data lines for delimiter detection
                    break
            if lines:
                dialect = csv.Sniffer().sniff('\n'.join(lines))
            else:
                dialect = csv.excel  # Default to CSV

        # 3. Read CSV with Error Handling
        df = pd.read_csv(
            file_path,
            sep=dialect.delimiter,
            skiprows=skip_rows,
            encoding=encoding,
            on_bad_lines='warn',  # Skip bad lines but log them
            dtype=str,
            engine='c'  # Use faster C engine (no `low_memory` issues)
        )

        # 4. Clean Columns Aggressively
        df.columns = [clean_column_name(col) for col in df.columns]
        df = df.loc[:, ~df.columns.str.contains('^unnamed')]  # Drop "Unnamed" cols

        # 5. Database Schema Alignment
        inspector = inspect(engine)
        db_columns = {col['name'] for col in inspector.get_columns('raw_metrics')}
        
        # Keep only columns that exist in DB or are clean/new
        valid_columns = [col for col in df.columns if re.match(r'^[a-z0-9_]+$', col)]
        df = df[valid_columns]

        # Add missing columns to DB
        with engine.connect() as conn:
            for col in valid_columns:
                if col not in db_columns:
                    add_column_if_not_exists(conn, 'raw_metrics', col, 'TEXT')

        # 6. Insert Data
        df.to_sql(
            'raw_metrics',
            con=engine,
            if_exists='append',
            index=False,
            method='multi',
            chunksize=1000
        )
        print(f"SUCCESS: {file_path}")
        return True
        
    except Exception as e:
        print(f"FAILED: {file_path}")
        print(f"Error: {str(e)}")
        if 'df' in locals():
            print(f"Columns detected: {df.columns.tolist()}")
        return False

# Usage
engine = create_engine('sqlite:///marketing_data.db')
file_path = './data/GA_Pages_And_Screens.csv'

# Use dedicated GA file processor for Google Analytics files
if 'GA_' in file_path:
    df = process_ga_file(file_path)
    # Clean and prepare the dataframe
    df.columns = [clean_column_name(col) for col in df.columns]
    df = df.loc[:, ~df.columns.str.contains('^unnamed')]
    
    # Get database schema
    inspector = inspect(engine)
    try:
        db_columns = {col['name'] for col in inspector.get_columns('raw_metrics')}
    except:
        # Create table if it doesn't exist
        with engine.connect() as conn:
            conn.execute(text('CREATE TABLE IF NOT EXISTS raw_metrics (id INTEGER PRIMARY KEY AUTOINCREMENT);'))
        db_columns = set()
    
    # Keep only valid columns
    valid_columns = [col for col in df.columns if re.match(r'^[a-z0-9_]+$', col)]
    df = df[valid_columns]
    
    # Add missing columns to DB
    with engine.connect() as conn:
        for col in valid_columns:
            if col not in db_columns:
                add_column_if_not_exists(conn, 'raw_metrics', col, 'TEXT')

    
    # Insert data
    df.to_sql('raw_metrics', con=engine, if_exists='append', index=False, method='multi', chunksize=1000)
    print(f"SUCCESS: {file_path}")
else:
    # Use standard processor for non-GA files
    process_csv(file_path, engine)
