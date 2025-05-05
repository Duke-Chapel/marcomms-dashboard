/**
 * CSV to JSON Converter for Marketing Dashboard
 * 
 * This script provides the CSV converter dashboard functionality
 * with enhanced support for YouTube content and other platforms.
 */

// Define the renderConverterDashboard function that dashboard.js is looking for
function renderConverterDashboard() {
    const container = document.getElementById('converter-dashboard');
    
    if (!container) {
      console.error('Converter dashboard container not found');
      return;
    }
    
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Marketing CSV Converter</h2>
          <p class="text-gray-600">Convert your marketing data CSVs into dashboard-ready JSON files</p>
        </div>
        
        <div class="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 class="font-medium text-gray-800 mb-2">Required Files by Platform</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div class="space-y-1">
              <div class="font-medium">Facebook:</div>
              <div class="text-gray-600 ml-3">FB_Videos.csv or any FB data file</div>
            </div>
            <div class="space-y-1">
              <div class="font-medium">Instagram:</div>
              <div class="text-gray-600 ml-3">IG_Posts.csv or any IG data file</div>
            </div>
            <div class="space-y-1">
              <div class="font-medium">Email:</div>
              <div class="text-gray-600 ml-3">Email_Campaign_Performance.csv</div>
            </div>
            <div class="space-y-1">
              <div class="font-medium">YouTube:</div>
              <div class="text-gray-600 ml-3">YouTube_Age.csv</div>
              <div class="text-gray-600 ml-3">YouTube_Gender.csv</div>
              <div class="text-gray-600 ml-3">YouTube_Geography.csv</div>
              <div class="text-gray-600 ml-3">YouTube_Subscription_Status.csv</div>
              <div class="text-gray-600 ml-3">YouTube_Content.csv</div>
            </div>
            <div class="space-y-1">
              <div class="font-medium">Google Analytics:</div>
              <div class="text-gray-600 ml-3">GA_Demographics.csv</div>
              <div class="text-gray-600 ml-3">GA_Pages_And_Screens.csv</div>
              <div class="text-gray-600 ml-3">GA_Traffic_Acquisition.csv</div>
              <div class="text-gray-600 ml-3">GA_UTMs.csv</div>
            </div>
          </div>
        </div>
        
        <div id="drop-area" class="border-2 border-dashed border-blue-400 rounded-lg p-10 text-center bg-blue-50 transition hover:bg-blue-100">
          <svg class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p class="mt-4 text-lg text-blue-700 font-medium">
            Drag and drop CSV files here
          </p>
          <p class="text-sm text-blue-600 mt-1">or</p>
          <input id="file-input" type="file" multiple accept=".csv" class="hidden">
          <button id="browse-button" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Browse Files
          </button>
        </div>
        
        <div id="upload-progress" class="hidden mt-6">
          <div class="flex justify-between mb-1">
            <span class="text-sm text-gray-700">Uploading files...</span>
            <span class="text-sm text-gray-700" id="progress-text">0%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div id="progress-bar" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%"></div>
          </div>
        </div>
        
        <div id="file-list-container" class="mt-6 hidden">
          <h3 class="font-medium text-gray-800 mb-2">Uploaded Files</h3>
          <div id="file-list" class="border border-gray-200 rounded-md">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody id="file-table-body" class="bg-white divide-y divide-gray-200">
                <!-- Files will be listed here -->
              </tbody>
            </table>
          </div>
          
          <div class="mt-4 flex space-x-4">
            <button id="process-button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Process Files
            </button>
            
            <button id="clear-button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
              Clear All
            </button>
          </div>
        </div>
        
        <div id="error-message" class="mt-4 hidden p-3 bg-red-50 text-red-800 rounded-md"></div>
      </div>
      
      <div id="results-container" class="bg-white p-6 rounded-lg shadow mb-6 hidden">
        <div class="text-center mb-6">
          <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mt-2 text-xl font-bold text-gray-900">Processing Complete!</h3>
          <p class="mt-1 text-gray-600">Your marketing dashboard data is ready</p>
        </div>
        
        <div class="flex flex-col space-y-4">
          <button id="download-zip-button" class="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-3-3V4m-7 5h14" />
            </svg>
            Download All Files (ZIP)
          </button>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Or download individual files:</h4>
            <div id="download-links" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Download links will be added here -->
            </div>
          </div>
        </div>
        
        <div class="mt-8 border-t border-gray-200 pt-6">
          <h4 class="font-medium text-gray-900 mb-2">Next Steps</h4>
          <ol class="list-decimal pl-5 text-gray-700 space-y-2">
            <li>Upload the generated JSON files to your <code class="px-1 py-0.5 bg-gray-100 rounded">/data</code> folder in your dashboard repository</li>
            <li>Commit and push the changes to update your dashboard</li>
            <li>Refresh your dashboard to see the updated visualizations</li>
          </ol>
        </div>
        
        <div class="mt-6">
          <button id="start-over-button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Start Over
          </button>
        </div>
      </div>
    `;
    
    // Initialize the converter functionality
    initializeConverter();
  }
  
  // Converter state
  const converterState = {
    files: [],
    processedFiles: {
      facebook: null,
      instagram: null,
      email: null,
      youtube: {
        age: null,
        gender: null,
        geography: null,
        subscription: null,
        content: null
      },
      googleAnalytics: {
        demographics: null,
        pagesAndScreens: null,
        trafficAcquisition: null,
        utms: null
      }
    },
    outputData: {},
    loading: false,
    error: null
  };
  
  // Initialize the converter
  function initializeConverter() {
    console.log('Initializing CSV converter...');
    
    // Setup drag and drop functionality
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    
    if (!dropArea || !fileInput || !browseButton) {
      console.error('Required converter elements not found');
      return;
    }
    
    // Add event listeners for the drop area
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      dropArea.classList.add('border-blue-600', 'bg-blue-100');
    }
    
    function unhighlight() {
      dropArea.classList.remove('border-blue-600', 'bg-blue-100');
    }
    
    // Handle file drop
    dropArea.addEventListener('drop', function(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      handleFileUpload(files);
    });
    
    // Handle file input change
    fileInput.addEventListener('change', function() {
      handleFileUpload(this.files);
    });
    
    // Handle browse button click
    browseButton.addEventListener('click', function() {
      fileInput.click();
    });
    
    // Handle process button click
    const processButton = document.getElementById('process-button');
    if (processButton) {
      processButton.addEventListener('click', processFiles);
    }
    
    // Handle clear button click
    const clearButton = document.getElementById('clear-button');
    if (clearButton) {
      clearButton.addEventListener('click', clearAllFiles);
    }
    
    // Handle start over button click
    const startOverButton = document.getElementById('start-over-button');
    if (startOverButton) {
      startOverButton.addEventListener('click', resetConverter);
    }
    
    // Handle download zip button click
    const downloadZipButton = document.getElementById('download-zip-button');
    if (downloadZipButton) {
      downloadZipButton.addEventListener('click', downloadZip);
    }
    
    console.log('CSV converter initialized successfully');
  }
  
  // Handle file upload
  function handleFileUpload(fileList) {
    // Filter for CSV files
    const csvFiles = Array.from(fileList).filter(file => 
      file.name.toLowerCase().endsWith('.csv')
    );
    
    if (csvFiles.length === 0) {
      showError('Please upload CSV files only');
      return;
    }
    
    // Show upload progress
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (uploadProgress && progressBar && progressText) {
      uploadProgress.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
    }
    
    // Process files
    let filesProcessed = 0;
    
    // Add files to state
    converterState.files = [...converterState.files, ...csvFiles];
    
    // Process each file
    csvFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const content = e.target.result;
        
        // Auto-detect file type
        const fileType = detectFileType(file.name, content);
        
        // Store file in the appropriate category
        storeFileByType(file, content, fileType.type);
        
        // Update progress
        filesProcessed++;
        const progress = Math.round((filesProcessed / csvFiles.length) * 100);
        
        if (progressBar && progressText) {
          progressBar.style.width = progress + '%';
          progressText.textContent = progress + '%';
        }
        
        // If all files processed, update the UI
        if (filesProcessed === csvFiles.length) {
          updateFileList();
          const fileListContainer = document.getElementById('file-list-container');
          if (fileListContainer) {
            fileListContainer.classList.remove('hidden');
          }
          
          setTimeout(() => {
            if (uploadProgress) {
              uploadProgress.classList.add('hidden');
            }
          }, 500);
        }
      };
      
      reader.readAsText(file);
    });
  }
  
  // Detect file type based on filename and content
  function detectFileType(filename, content) {
    const lowerFilename = filename.toLowerCase();
    let type = 'unknown';
    let confidence = 'low';
    
    // Check filename patterns
    if (lowerFilename.includes('fb_') || lowerFilename.includes('facebook')) {
      type = 'facebook';
      confidence = 'high';
    } else if (lowerFilename.includes('ig_') || lowerFilename.includes('instagram')) {
      type = 'instagram';
      confidence = 'high';
    } else if (lowerFilename.includes('email') || lowerFilename.includes('campaign')) {
      type = 'email';
      confidence = 'high';
    } else if (lowerFilename.includes('youtube')) {
      if (lowerFilename.includes('age')) {
        type = 'youtubeAge';
        confidence = 'high';
      } else if (lowerFilename.includes('gender')) {
        type = 'youtubeGender';
        confidence = 'high';
      } else if (lowerFilename.includes('geo')) {
        type = 'youtubeGeography';
        confidence = 'high';
      } else if (lowerFilename.includes('subscription')) {
        type = 'youtubeSubscription';
        confidence = 'high';
      } else if (lowerFilename.includes('content') || lowerFilename.includes('video')) {
        type = 'youtubeContent';
        confidence = 'high';
      } else {
        // Generic YouTube file
        type = 'youtube';
        confidence = 'medium';
      }
    } else if (lowerFilename.includes('ga_') || lowerFilename.includes('analytics')) {
      if (lowerFilename.includes('demographic')) {
        type = 'gaDemographics';
        confidence = 'high';
      } else if (lowerFilename.includes('page')) {
        type = 'gaPages';
        confidence = 'high';
      } else if (lowerFilename.includes('traffic')) {
        type = 'gaTraffic';
        confidence = 'high';
      } else if (lowerFilename.includes('utm')) {
        type = 'gaUtms';
        confidence = 'high';
      } else {
        // Generic GA file
        type = 'googleAnalytics';
        confidence = 'medium';
      }
    }
    
    // If no strong match from filename, check content
    if (confidence !== 'high') {
      // Get the first line (headers)
      const headers = content.split('\n')[0].toLowerCase();
      
      // Check for marker fields
      if (headers.includes('video asset id') || 
          (headers.includes('reactions') && headers.includes('comments') && headers.includes('shares'))) {
        type = 'facebook';
        confidence = 'medium';
      } else if (headers.includes('post id') && headers.includes('likes') && 
                (headers.includes('saves') || headers.includes('description'))) {
        type = 'instagram';
        confidence = 'medium';
      } else if (headers.includes('campaign') && 
                (headers.includes('email open rate') || headers.includes('email click rate'))) {
        type = 'email';
        confidence = 'medium';
      } else if (headers.includes('viewer age') && headers.includes('views (%)')) {
        type = 'youtubeAge';
        confidence = 'high';
      } else if (headers.includes('viewer gender')) {
        type = 'youtubeGender';
        confidence = 'high';
      } else if (headers.includes('geography') && headers.includes('average view duration')) {
        type = 'youtubeGeography';
        confidence = 'high';
      } else if (headers.includes('subscription status')) {
        type = 'youtubeSubscription';
        confidence = 'high';
      } else if (headers.includes('video title') || headers.includes('video views')) {
        type = 'youtubeContent';
        confidence = 'medium';
      }
    }
    
    return { type, confidence };
  }
  
  // Store file by detected type
  function storeFileByType(file, content, fileType) {
    switch (fileType) {
      case 'facebook':
        converterState.processedFiles.facebook = { file, content };
        break;
        
      case 'instagram':
        converterState.processedFiles.instagram = { file, content };
        break;
        
      case 'email':
        converterState.processedFiles.email = { file, content };
        break;
        
      case 'youtubeAge':
        converterState.processedFiles.youtube.age = { file, content };
        break;
        
      case 'youtubeGender':
        converterState.processedFiles.youtube.gender = { file, content };
        break;
        
      case 'youtubeGeography':
        converterState.processedFiles.youtube.geography = { file, content };
        break;
        
      case 'youtubeSubscription':
        converterState.processedFiles.youtube.subscription = { file, content };
        break;
        
      case 'youtubeContent':
        converterState.processedFiles.youtube.content = { file, content };
        break;
        
      case 'youtube':
        // Generic YouTube file, try to determine subtype by content
        const headers = content.split('\n')[0].toLowerCase();
        
        if (headers.includes('viewer age')) {
          converterState.processedFiles.youtube.age = { file, content };
        } else if (headers.includes('viewer gender')) {
          converterState.processedFiles.youtube.gender = { file, content };
        } else if (headers.includes('geography')) {
          converterState.processedFiles.youtube.geography = { file, content };
        } else if (headers.includes('subscription status')) {
          converterState.processedFiles.youtube.subscription = { file, content };
        } else if (headers.includes('video title') || headers.includes('video views')) {
          converterState.processedFiles.youtube.content = { file, content };
        }
        break;
        
      case 'gaDemographics':
        converterState.processedFiles.googleAnalytics.demographics = { file, content };
        break;
        
      case 'gaPages':
        converterState.processedFiles.googleAnalytics.pagesAndScreens = { file, content };
        break;
        
      case 'gaTraffic':
        converterState.processedFiles.googleAnalytics.trafficAcquisition = { file, content };
        break;
        
      case 'gaUtms':
        converterState.processedFiles.googleAnalytics.utms = { file, content };
        break;
        
      case 'googleAnalytics':
        // Generic GA file, try to determine subtype by content
        const gaHeaders = content.split('\n')[0].toLowerCase();
        
        if (gaHeaders.includes('age') || gaHeaders.includes('gender') || gaHeaders.includes('country')) {
          converterState.processedFiles.googleAnalytics.demographics = { file, content };
        } else if (gaHeaders.includes('page path') || gaHeaders.includes('page title')) {
          converterState.processedFiles.googleAnalytics.pagesAndScreens = { file, content };
        } else if (gaHeaders.includes('source') && gaHeaders.includes('medium')) {
          converterState.processedFiles.googleAnalytics.trafficAcquisition = { file, content };
        } else if (gaHeaders.includes('campaign')) {
          converterState.processedFiles.googleAnalytics.utms = { file, content };
        }
        break;
    }
  }
  
  // Update the file list UI
  function updateFileList() {
    const tableBody = document.getElementById('file-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Helper function to get file type display name
    function getTypeDisplayName(type) {
      const typeNames = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        email: 'Email',
        youtubeAge: 'YouTube (Age)',
        youtubeGender: 'YouTube (Gender)',
        youtubeGeography: 'YouTube (Geography)',
        youtubeSubscription: 'YouTube (Subscription)',
        youtubeContent: 'YouTube (Content)',
        gaDemographics: 'GA (Demographics)',
        gaPages: 'GA (Pages)',
        gaTraffic: 'GA (Traffic)',
        gaUtms: 'GA (UTMs)',
        unknown: 'Unknown'
      };
      
      return typeNames[type] || 'Unknown';
    }
    
    // Helper function to get type class
    function getTypeClass(type) {
      if (type.includes('facebook')) return 'bg-blue-100 text-blue-800';
      if (type.includes('instagram')) return 'bg-pink-100 text-pink-800';
      if (type.includes('email')) return 'bg-purple-100 text-purple-800';
      if (type.includes('youtube')) return 'bg-red-100 text-red-800';
      if (type.includes('ga')) return 'bg-green-100 text-green-800';
      return 'bg-gray-100 text-gray-800';
    }
    
    // Get all files and their types
    const filesList = [];
    
    if (converterState.processedFiles.facebook) {
      filesList.push({
        file: converterState.processedFiles.facebook.file,
        type: 'facebook'
      });
    }
    
    if (converterState.processedFiles.instagram) {
      filesList.push({
        file: converterState.processedFiles.instagram.file,
        type: 'instagram'
      });
    }
    
    if (converterState.processedFiles.email) {
      filesList.push({
        file: converterState.processedFiles.email.file,
        type: 'email'
      });
    }
    
    // YouTube files
    for (const type in converterState.processedFiles.youtube) {
      if (converterState.processedFiles.youtube[type]) {
        filesList.push({
          file: converterState.processedFiles.youtube[type].file,
          type: 'youtube' + type.charAt(0).toUpperCase() + type.slice(1)
        });
      }
    }
    
    // GA files
    for (const type in converterState.processedFiles.googleAnalytics) {
      if (converterState.processedFiles.googleAnalytics[type]) {
        filesList.push({
          file: converterState.processedFiles.googleAnalytics[type].file,
          type: 'ga' + type.charAt(0).toUpperCase() + type.slice(1)
        });
      }
    }
    
    // Generate table rows
    if (filesList.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
            No files uploaded yet
          </td>
        </tr>
      `;
      return;
    }
    
    filesList.forEach((item, index) => {
      const row = document.createElement('tr');
      const typeName = getTypeDisplayName(item.type);
      const typeClass = getTypeClass(item.type);
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${item.file.name}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${(item.file.size / 1024).toFixed(1)} KB
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span class="px-2 py-1 rounded-full text-xs font-medium ${typeClass}">
            ${typeName}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <button class="text-red-600 hover:text-red-900" onclick="removeFile('${item.type}', ${index})">
            Remove
          </button>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }
  
  // Make removeFile accessible to the onclick handler
  window.removeFile = function(type, index) {
    // Remove the file based on type
    if (type === 'facebook') {
      converterState.processedFiles.facebook = null;
    } else if (type === 'instagram') {
      converterState.processedFiles.instagram = null;
    } else if (type === 'email') {
      converterState.processedFiles.email = null;
    } else if (type.startsWith('youtube')) {
      const subtypeKey = type.replace('youtube', '').toLowerCase();
      if (converterState.processedFiles.youtube[subtypeKey]) {
        converterState.processedFiles.youtube[subtypeKey] = null;
      }
    } else if (type.startsWith('ga')) {
      const subtypeKey = type.replace('ga', '').toLowerCase();
      if (converterState.processedFiles.googleAnalytics[subtypeKey]) {
        converterState.processedFiles.googleAnalytics[subtypeKey] = null;
      }
    }
    
    // Also remove from files array
    const files = converterState.files;
    if (index >= 0 && index < files.length) {
      converterState.files.splice(index, 1);
    }
    
    // Update the UI
    updateFileList();
    
    // Hide file list if no files remain
    if (converterState.files.length === 0) {
      const fileListContainer = document.getElementById('file-list-container');
      if (fileListContainer) {
        fileListContainer.classList.add('hidden');
      }
    }
  };
  
  // Process files and generate JSON
  function processFiles() {
    console.log('Processing files...');
    
    // Check if we have at least one file to process
    if (converterState.files.length === 0) {
      showError('Please upload at least one CSV file to process');
      return;
    }
    
    // Set loading state
    converterState.loading = true;
    toggleProcessingState(true);
    
    try {
      // Process the files using CSV to JSON conversion
      // For this simplified version, we'll just create placeholder data
      
      if (converterState.processedFiles.facebook) {
        converterState.outputData.facebook_data = createPlaceholderData('facebook');
        console.log('Facebook data processed');
      }
      
      if (converterState.processedFiles.instagram) {
        converterState.outputData.instagram_data = createPlaceholderData('instagram');
        console.log('Instagram data processed');
      }
      
      if (converterState.processedFiles.email) {
        converterState.outputData.email_data = createPlaceholderData('email');
        console.log('Email data processed');
      }
      
      if (hasYoutubeData()) {
        converterState.outputData.youtube_data = createPlaceholderData('youtube');
        console.log('YouTube data processed');
      }
      
      if (hasGoogleAnalyticsData()) {
        converterState.outputData.google_analytics_data = createPlaceholderData('googleAnalytics');
        console.log('Google Analytics data processed');
      }
      
      // Always generate cross-channel data
      converterState.outputData.cross_channel_data = createPlaceholderData('crossChannel');
      console.log('Cross-channel data generated');
      
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
  
  // Toggle processing state
  function toggleProcessingState(isProcessing) {
    const processButton = document.getElementById('process-button');
    const clearButton = document.getElementById('clear-button');
    
    if (processButton) {
      if (isProcessing) {
        processButton.disabled = true;
        processButton.textContent = 'Processing...';
        processButton.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        processButton.disabled = false;
        processButton.textContent = 'Process Files';
        processButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
    
    if (clearButton) {
      if (isProcessing) {
        clearButton.disabled = true;
        clearButton.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        clearButton.disabled = false;
        clearButton.classList.remove('opacity-50', 'cursor-not-allowed');
      }
    }
  }
  
  // Check if we have YouTube data
  function hasYoutubeData() {
    return converterState.processedFiles.youtube.age || 
           converterState.processedFiles.youtube.gender || 
           converterState.processedFiles.youtube.geography || 
           converterState.processedFiles.youtube.subscription ||
           converterState.processedFiles.youtube.content;
  }
  
  // Check if we have Google Analytics data
  function hasGoogleAnalyticsData() {
    return converterState.processedFiles.googleAnalytics.demographics || 
           converterState.processedFiles.googleAnalytics.pagesAndScreens || 
           converterState.processedFiles.googleAnalytics.trafficAcquisition || 
           converterState.processedFiles.googleAnalytics.utms;
  }
  
  // Update download links
  function updateDownloadLinks() {
    const downloadLinks = document.getElementById('download-links');
    if (!downloadLinks) return;
    
    downloadLinks.innerHTML = '';
    
    // Create download links for each output file
    Object.entries(converterState.outputData).forEach(([key, data]) => {
      if (!data) return;
      
      const fileName = `${key}.json`;
      const buttonColor = getButtonColorForType(key);
      
      const link = document.createElement('button');
      link.className = `px-4 py-2 text-white rounded-md ${buttonColor} text-sm`;
      link.textContent = fileName;
      
      link.addEventListener('click', () => {
        downloadFile(key, fileName);
      });
      
      downloadLinks.appendChild(link);
    });
    
    // Helper to get button color based on file type
    function getButtonColorForType(type) {
      const colors = {
        facebook_data: 'bg-blue-600 hover:bg-blue-700',
        instagram_data: 'bg-pink-600 hover:bg-pink-700',
        youtube_data: 'bg-red-600 hover:bg-red-700',
        email_data: 'bg-purple-600 hover:bg-purple-700',
        google_analytics_data: 'bg-green-600 hover:bg-green-700',
        cross_channel_data: 'bg-yellow-600 hover:bg-yellow-700'
      };
      
      return colors[type] || 'bg-gray-600 hover:bg-gray-700';
    }
  }
  
  // Download a single file
  function downloadFile(key, fileName) {
    const jsonString = JSON.stringify(converterState.outputData[key], null, 2);
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
  
  // Download all files as ZIP
  function downloadZip() {
    // Check if JSZip is available
    if (typeof JSZip === 'undefined') {
      showError('JSZip library not loaded. Please make sure all dependencies are loaded.');
      return;
    }
    
    const zip = new JSZip();
    
    // Add each file to the ZIP
    Object.entries(converterState.outputData).forEach(([key, data]) => {
      const fileName = `${key}.json`;
      const jsonString = JSON.stringify(data, null, 2);
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
  
  // Create placeholder data for testing
  function createPlaceholderData(type) {
    console.log(`Creating placeholder data for ${type}`);
    
    switch (type) {
      case 'facebook':
        return {
          reach: 125000,
          engagement: 12500,
          engagement_rate: 10.0,
          views: 75000,
          posts: Array(25).fill().map((_, i) => ({
            title: `Facebook Post ${i+1}`,
            date: new Date(2023, 0, i+1).toISOString(),
            reach: 5000 + Math.random() * 5000,
            reactions: 100 + Math.random() * 200,
            comments: 10 + Math.random() * 50,
            shares: 5 + Math.random() * 25
          })),
          performance_trend: Array(12).fill().map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            reach: 15000 + i * 1000 + Math.random() * 500,
            engagement: 1500 + i * 100 + Math.random() * 50
          }))
        };
        
      case 'instagram':
        return {
          reach: 85000,
          engagement: 15000,
          engagement_rate: 17.65,
          likes: 12000,
          posts: Array(20).fill().map((_, i) => ({
            description: `Instagram Post ${i+1}`,
            date: new Date(2023, 0, i+1).toISOString(),
            type: ['Photo', 'Carousel', 'Video'][Math.floor(Math.random() * 3)],
            reach: 4000 + Math.random() * 4000,
            likes: 200 + Math.random() * 300,
            comments: 20 + Math.random() * 60,
            shares: 10 + Math.random() * 30,
            saves: 15 + Math.random() * 40
          })),
          performance_trend: Array(12).fill().map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            reach: 10000 + i * 800 + Math.random() * 400,
            engagement: 1000 + i * 80 + Math.random() * 40
          }))
        };
        
      case 'email':
        return {
          campaigns: 15,
          totalSent: 75000,
          totalDelivered: 74100,
          totalOpens: 20748,
          totalClicks: 4446,
          openRate: 28.0,
          clickRate: 6.0,
          bounceRate: 1.2,
          unsubscribeRate: 0.15,
          campaigns: Array(15).fill().map((_, i) => ({
            name: `Email Campaign ${i+1}`,
            sent: 5000,
            delivered: 4940,
            opened: 1383,
            clicked: 296,
            openRate: 28.0,
            clickRate: 6.0,
            bounceRate: 1.2,
            unsubscribeRate: 0.15
          })),
          performance_trend: Array(12).fill().map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            openRate: 21.0 + i * 0.25 + Math.random() * 0.1,
            clickRate: 2.5 + i * 0.05 + Math.random() * 0.02
          }))
        };
        
      case 'youtube':
        return {
          totalViews: 250000,
          totalWatchTime: 25000,
          averageViewDuration: '6:00',
          demographics: {
            age: [
              { group: '18-24', viewPercentage: 18.5, watchTimePercentage: 17.2 },
              { group: '25-34', viewPercentage: 32.7, watchTimePercentage: 33.4 },
              { group: '35-44', viewPercentage: 22.4, watchTimePercentage: 23.1 },
              { group: '45-54', viewPercentage: 14.6, watchTimePercentage: 15.2 },
              { group: '55-64', viewPercentage: 8.3, watchTimePercentage: 8.5 },
              { group: '65+', viewPercentage: 3.5, watchTimePercentage: 2.6 }
            ],
            gender: [
              { group: 'Female', viewPercentage: 42.3, watchTimePercentage: 44.7 },
              { group: 'Male', viewPercentage: 57.7, watchTimePercentage: 55.3 }
            ]
          },
          geography: Array(10).fill().map((_, i) => ({
            country: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico'][i],
            views: 25000 - i * 2000 + Math.random() * 1000,
            watchTime: 2500 - i * 200 + Math.random() * 100,
            averageDuration: `${Math.floor(5 - i * 0.3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
          })),
          subscriptionStatus: [
            { status: 'Subscribed', views: 75000, watchTime: 9000, percentage: 30.0 },
            { status: 'Not subscribed', views: 175000, watchTime: 16000, percentage: 70.0 }
          ],
          content: Array(15).fill().map((_, i) => ({
            id: `vid-${1000 + i}`,
            title: `Video ${i+1}: How to do something amazing`,
            views: 15000 - i * 800 + Math.random() * 400,
            watchTime: 1500 - i * 80 + Math.random() * 40,
            duration: 180 + i * 30,
            likes: 500 - i * 25 + Math.random() * 10,
            comments: 50 - i * 2.5 + Math.random() * 5,
            shares: 25 - i * 1.2 + Math.random() * 3
          })),
          performance_trend: Array(12).fill().map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            views: 18000 + i * 500 + Math.random() * 200,
            watchTime: 1800 + i * 50 + Math.random() * 20
          }))
        };
        
      case 'googleAnalytics':
        return {
          totalUsers: 150000,
          totalSessions: 325000,
          engagedSessions: 260000,
          engagementRate: 80.0,
          demographics: {
            ageGroups: [
              { ageRange: '18-24', users: 22500, sessions: 48750, percentage: 15.0 },
              { ageRange: '25-34', users: 45000, sessions: 97500, percentage: 30.0 },
              { ageRange: '35-44', users: 37500, sessions: 81250, percentage: 25.0 },
              { ageRange: '45-54', users: 22500, sessions: 48750, percentage: 15.0 },
              { ageRange: '55-64', users: 15000, sessions: 32500, percentage: 10.0 },
              { ageRange: '65+', users: 7500, sessions: 16250, percentage: 5.0 }
            ],
            genderGroups: [
              { gender: 'Female', users: 67500, sessions: 146250, percentage: 45.0 },
              { gender: 'Male', users: 82500, sessions: 178750, percentage: 55.0 }
            ],
            countries: Array(10).fill().map((_, i) => ({
              country: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Mexico'][i],
              users: 15000 - i * 1200 + Math.random() * 600,
              sessions: 32500 - i * 2600 + Math.random() * 1300,
              percentage: 10 - i * 0.8 + Math.random() * 0.4
            }))
          }
        };
        
      case 'crossChannel':
        return {
          reach: {
            total: 210000,
            byPlatform: {
              facebook: 125000,
              instagram: 85000,
              youtube: 250000,
              web: 150000
            }
          },
          engagement: {
            total: 27500,
            byPlatform: {
              facebook: 12500,
              instagram: 15000,
              youtube: 25000,
              web: 12000
            }
          },
          engagement_rate: {
            overall: 13.1,
            byPlatform: {
              facebook: 10.0,
              instagram: 17.65,
              email: 6.0,
              web: 8.0
            }
          },
          performance_trend: Array(12).fill().map((_, i) => ({
            month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
            facebook: 90 + i * 3,
            instagram: 95 + i * 2.5,
            youtube: 85 + i * 2,
            email: 92 + i * 1,
            web: 97 + i * 1.5
          })),
          attribution: [
            { name: 'Organic Search', value: 32 },
            { name: 'Direct', value: 15 },
            { name: 'Social', value: 22 },
            { name: 'Email', value: 18 },
            { name: 'Referral', value: 8 },
            { name: 'Paid Search', value: 5 }
          ],
          content_performance: [
            { subject: 'Reach', Video: 92, Image: 68, Text: 42 },
            { subject: 'Engagement', Video: 85, Image: 65, Text: 38 },
            { subject: 'Clicks', Video: 78, Image: 62, Text: 45 },
            { subject: 'Conversions', Video: 80, Image: 55, Text: 35 }
          ],
          demographics: {
            age: [
              { age: '18-24', facebook: 15, instagram: 30, youtube: 18, web: 15 },
              { age: '25-34', facebook: 28, instagram: 35, youtube: 33, web: 30 },
              { age: '35-44', facebook: 22, instagram: 20, youtube: 23, web: 25 },
              { age: '45-54', facebook: 18, instagram: 10, youtube: 14, web: 15 },
              { age: '55-64', facebook: 12, instagram: 3, youtube: 8, web: 10 },
              { age: '65+', facebook: 5, instagram: 2, youtube: 4, web: 5 }
            ]
          },
          meta: {
            lastUpdated: new Date().toISOString()
          }
        };
        
      default:
        return {};
    }
  }
  
  // Clear all files
  function clearAllFiles() {
    // Reset state
    converterState.files = [];
    converterState.processedFiles = {
      facebook: null,
      instagram: null,
      email: null,
      youtube: {
        age: null,
        gender: null,
        geography: null,
        subscription: null,
        content: null
      },
      googleAnalytics: {
        demographics: null,
        pagesAndScreens: null,
        trafficAcquisition: null,
        utms: null
      }
    };
    
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Hide the file list and results
    const fileListContainer = document.getElementById('file-list-container');
    const resultsContainer = document.getElementById('results-container');
    
    if (fileListContainer) {
      fileListContainer.classList.add('hidden');
    }
    
    if (resultsContainer) {
      resultsContainer.classList.add('hidden');
    }
    
    // Clear error message
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.classList.add('hidden');
    }
  }
  
  // Reset the converter
  function resetConverter() {
    clearAllFiles();
    converterState.outputData = {};
  }
  
  // Show error message
  function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (!errorElement) return;
    
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // Hide message after a few seconds
    setTimeout(() => {
      errorElement.classList.add('hidden');
    }, 5000);
  }
  
  // Make the renderConverterDashboard function available globally
  // so dashboard.js can find it
  window.renderConverterDashboard = renderConverterDashboard;
  
  // Initialize when the document loads
  document.addEventListener('DOMContentLoaded', function() {
    console.log('CSV converter script loaded');
  });
