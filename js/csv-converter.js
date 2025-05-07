/**
 * Enhanced functions for CSV Converter
 * To be added to your existing csv-converter.js file
 */

// Process files and generate JSON
function processFiles() {
  console.log('Processing files with enhanced processor...');
  
  // Check if we have at least one file to process
  if (converterState.files.length === 0) {
    showError('Please upload at least one CSV file to process');
    return;
  }
  
  // Set loading state
  converterState.loading = true;
  toggleProcessingState(true);
  
  try {
    // Process Facebook data
    if (converterState.processedFiles.facebook) {
      const csvData = converterState.processedFiles.facebook.content;
      
      // Use additional FB-specific files if available
      const options = {
        postsData: converterState.processedFiles.facebookSpecific.posts ? 
                   converterState.processedFiles.facebookSpecific.posts.content : null,
        reachData: converterState.processedFiles.facebookSpecific.reach ? 
                   converterState.processedFiles.facebookSpecific.reach.content : null,
        interactionsData: converterState.processedFiles.facebookSpecific.interactions ? 
                         converterState.processedFiles.facebookSpecific.interactions.content : null
      };
      
      // Use window-scoped function
      converterState.outputData.facebook_data = window.processFacebookData(csvData, options);
      console.log('Facebook data processed');
    }
    
    // Process Instagram data
    if (converterState.processedFiles.instagram) {
      const csvData = converterState.processedFiles.instagram.content;
      
      // Use additional IG-specific files if available
      const options = {
        reachData: converterState.processedFiles.instagramSpecific.reach ? 
                   converterState.processedFiles.instagramSpecific.reach.content : null,
        interactionsData: converterState.processedFiles.instagramSpecific.interactions ? 
                         converterState.processedFiles.instagramSpecific.interactions.content : null
      };
      
      // Use window-scoped function
      converterState.outputData.instagram_data = window.processInstagramData(csvData, options);
      console.log('Instagram data processed');
    }
    
    // Process Email data
    if (converterState.processedFiles.email) {
      const csvData = converterState.processedFiles.email.content;
      // Use window-scoped function
      converterState.outputData.email_data = window.processEmailData(csvData);
      console.log('Email data processed');
    }
    
    // Process YouTube data if available
    if (hasYoutubeData()) {
      // Get YouTube data from different files
      const ageData = converterState.processedFiles.youtube.age ? 
        converterState.processedFiles.youtube.age.content : '';
      const genderData = converterState.processedFiles.youtube.gender ? 
        converterState.processedFiles.youtube.gender.content : '';
      const geoData = converterState.processedFiles.youtube.geography ? 
        converterState.processedFiles.youtube.geography.content : '';
      const subscriptionData = converterState.processedFiles.youtube.subscription ? 
        converterState.processedFiles.youtube.subscription.content : '';
      const contentData = converterState.processedFiles.youtube.content ? 
        converterState.processedFiles.youtube.content.content : '';
      
      // Create options object with additional data
      const options = {
        citiesData: converterState.processedFiles.youtube.cities ? 
                   converterState.processedFiles.youtube.cities.content : null
      };
      
      // Process YouTube data using the window-scoped function
      converterState.outputData.youtube_data = window.processYouTubeData(
        ageData, genderData, geoData, subscriptionData, contentData, options
      );
      console.log('YouTube data processed');
    }
    
    // Process Google Analytics data if available
    if (hasGoogleAnalyticsData()) {
      // Get Google Analytics data from different files
      const demographicsData = converterState.processedFiles.googleAnalytics.demographics ? 
        converterState.processedFiles.googleAnalytics.demographics.content : '';
      const pagesData = converterState.processedFiles.googleAnalytics.pagesAndScreens ? 
        converterState.processedFiles.googleAnalytics.pagesAndScreens.content : '';
      const trafficData = converterState.processedFiles.googleAnalytics.trafficAcquisition ? 
        converterState.processedFiles.googleAnalytics.trafficAcquisition.content : '';
      const utmsData = converterState.processedFiles.googleAnalytics.utms ? 
        converterState.processedFiles.googleAnalytics.utms.content : '';
      
      // Process Google Analytics data using the window-scoped function
      converterState.outputData.google_analytics_data = window.processGoogleAnalyticsData(
        demographicsData, pagesData, trafficData, utmsData
      );
      console.log('Google Analytics data processed');
    }
    
    // Generate cross-channel data from processed platform data
    converterState.outputData.cross_channel_data = window.generateCrossChannelData(
      converterState.outputData.facebook_data,
      converterState.outputData.instagram_data,
      converterState.outputData.youtube_data,
      converterState.outputData.email_data,
      converterState.outputData.google_analytics_data
    );
    console.log('Cross-channel data generated');
    
    // Normalize all output data to ensure consistent data types
    normalizeAllOutputData();
    
    // Show results
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      resultsContainer.classList.remove('hidden');
    }
    
    // Update download links
    updateDownloadLinks();
    
  } catch (error) {
    console.error('Error processing files:', error);
    showError('Error processing files: ' + error.message);
  }
  
  // Reset loading state
  converterState.loading = false;
  toggleProcessingState(false);
}

/**
 * Normalize all output data to ensure consistent data types
 */
function normalizeAllOutputData() {
  console.log('Normalizing all output data...');
  
  // Process each output data object
  for (const key in converterState.outputData) {
    if (converterState.outputData[key]) {
      converterState.outputData[key] = normalizeObject(converterState.outputData[key]);
    }
  }
}

/**
 * Normalize a single value
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
    return parseFloat(cleanValue.replace('%', ''));
  }
  
  // Return original value if it's not a number
  return value;
}

/**
 * Recursively process an object or array to normalize all values
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

// Enhanced download function with normalization
function downloadFile(key, fileName) {
  // Get data and ensure it's normalized
  const data = normalizeObject(converterState.outputData[key]);
  
  // Convert to JSON string with proper formatting
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create and trigger download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

// Enhanced download all files as ZIP with normalization
function downloadZip() {
  // Check if JSZip is available
  if (typeof JSZip === 'undefined') {
    showError('JSZip library not loaded. Please make sure all dependencies are loaded.');
    return;
  }
  
  const zip = new JSZip();
  
  // Add each file to the ZIP, ensuring data is normalized
  Object.entries(converterState.outputData).forEach(([key, data]) => {
    const fileName = `${key}.json`;
    const normalizedData = normalizeObject(data);
    const jsonString = JSON.stringify(normalizedData, null, 2);
    zip.file(fileName, jsonString);
  });
  
  // Generate ZIP and trigger download
  zip.generateAsync({ type: 'blob' })
    .then(function(content) {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'marketing_dashboard_data.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    })
    .catch(function(error) {
      console.error('Error creating ZIP:', error);
      showError('Error creating ZIP file: ' + error.message);
    });
}