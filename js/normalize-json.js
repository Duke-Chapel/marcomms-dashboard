/**
 * normalize-json.js
 * Script to normalize JSON data files for marketing dashboard
 * Converts string numbers to actual numbers and ensures consistent data types
 */

const fs = require('fs');
const path = require('path');

/**
 * Normalize a value (convert string numbers to actual numbers)
 * @param {any} value - The value to normalize
 * @returns {any} - The normalized value
 */
function normalizeValue(value) {
  // If it's not a string, return as is
  if (typeof value !== 'string') return value;
  
  // Remove commas from number strings
  const cleanValue = value.replace(/,/g, '');
  
  // Try to convert to number if it looks like a number
  if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
    return parseFloat(cleanValue);
  }
  
  // For percentage strings (if they end with %)
  if (/^-?\d+(\.\d+)?%$/.test(cleanValue)) {
    return parseFloat(cleanValue);
  }
  
  // Return original value if it's not a number
  return value;
}

/**
 * Recursively process an object or array
 * @param {object|array} data - The data to normalize
 * @returns {object|array} - The normalized data
 */
function normalizeObject(data) {
  if (Array.isArray(data)) {
    // Process each item in the array
    return data.map(item => normalizeObject(item));
  } else if (data && typeof data === 'object') {
    // Process each property in the object
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = normalizeObject(value);
    }
    return result;
  } else {
    // It's a primitive value, normalize it
    return normalizeValue(data);
  }
}

/**
 * Read JSON from file, normalize it, and write it back
 * @param {string} filePath - Path to the JSON file
 * @param {string} outputPath - Path to write the normalized JSON file (defaults to same as input)
 * @returns {boolean} - Success status
 */
function normalizeJsonFile(filePath, outputPath = filePath) {
  try {
    console.log(`Processing file: ${filePath}`);
    
    // Read the file
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(jsonData);
    
    // Normalize the data
    const normalizedData = normalizeObject(data);
    
    // Write back to file with proper formatting
    fs.writeFileSync(outputPath, JSON.stringify(normalizedData, null, 2));
    
    console.log(`Successfully normalized: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Process all JSON files in a directory
 * @param {string} directory - Path to the directory containing JSON files
 * @returns {number} - Count of processed files
 */
function normalizeAllJsonFiles(directory) {
  try {
    // Get all files in the directory
    const files = fs.readdirSync(directory);
    
    // Process each JSON file
    let processedCount = 0;
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(directory, file);
        if (normalizeJsonFile(filePath)) {
          processedCount++;
        }
      }
    }
    
    console.log(`Processed ${processedCount} JSON files in ${directory}`);
    return processedCount;
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
    return 0;
  }
}

/**
 * Main function - Parse command line arguments and run the script
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node normalize-json.js [directory-path]');
    console.log('Or to process a single file: node normalize-json.js --file [file-path]');
    return;
  }
  
  if (args[0] === '--file' && args.length > 1) {
    // Process a single file
    const filePath = args[1];
    if (normalizeJsonFile(filePath)) {
      console.log(`Successfully normalized ${filePath}`);
    } else {
      console.error(`Failed to normalize ${filePath}`);
    }
  } else {
    // Process a directory
    const directory = args[0];
    normalizeAllJsonFiles(directory);
  }
}

// Run the script if it's executed directly
main();