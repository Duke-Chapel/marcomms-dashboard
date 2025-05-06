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
            <div class="text-gray-600 ml-3">FB_Posts.csv</div>
            <div class="text-gray-600 ml-3">FB_Reach.csv</div>
            <div class="text-gray-600 ml-3">FB_Interactions.csv</div>
          </div>
          <div class="space-y-1">
            <div class="font-medium">Instagram:</div>
            <div class="text-gray-600 ml-3">IG_Posts.csv or any IG data file</div>
            <div class="text-gray-600 ml-3">IG_Reach.csv</div>
            <div class="text-gray-600 ml-3">IG_Interactions.csv</div>
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
    facebookSpecific: {
      posts: null,
      videos: null,
      reach: null,
      audience: null,
      follows: null,
      interactions: null,
      linkClicks: null,
      views: null,
      visits: null
    },
    instagram: null,
    instagramSpecific: {
      posts: null,
      reach: null,
      audience: null,
      follows: null,
      interactions: null,
      linkClicks: null,
      views: null,
      visits: null
    },
    email: null,
    youtube: {
      age: null,
      gender: null,
      geography: null,
      subscription: null,
      content: null,
      cities: null
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
  console.log('Initializing CSV converter with enhanced processor integration...');
  
  // First, make sure csv-processor functions are available
  if (typeof enhancedCsvToJson !== 'function' || 
      typeof processFacebookData !== 'function' || 
      typeof processInstagramData !== 'function') {
    console.error('CSV Processor functions not found! Make sure csv-processor.js is loaded before csv-converter.js');
    
    // Show error in the converter dashboard
    const container = document.getElementById('converter-dashboard');
    if (container) {
      container.innerHTML = `
        <div class="bg-red-50 p-4 rounded-lg">
          <h2 class="text-red-800 font-bold">CSV Processor Not Available</h2>
          <p class="text-red-700">The CSV processor module could not be loaded. Please check your JavaScript includes.</p>
        </div>
      `;
    }
    return;
  }
  
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
  
  console.log('CSV converter with enhanced processor initialized successfully');
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
      
      // Preprocess content to handle BOM and line endings
      const processedContent = preprocessCsvData(content, '');
      
      // Auto-detect file type
      const fileType = detectFileType(file.name, processedContent);
      
      // Store file in the appropriate category
      storeFileByType(file, processedContent, fileType.type);
      
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

// Function to pre-process files before sending to the processor
function preprocessCsvData(fileContent, fileType) {
  // Handle potential issues with CSV format (BOM, line endings, etc.)
  let processedContent = fileContent;
  
  // Remove BOM if present
  if (processedContent.charCodeAt(0) === 0xFEFF) {
    processedContent = processedContent.slice(1);
  }
  
  // Normalize line endings
  processedContent = processedContent.replace(/\r\n/g, '\n');
  
  // Additional preprocessing based on file type
  switch (fileType) {
    case 'facebook':
      // Facebook-specific preprocessing
      break;
      
    case 'instagram':
      // Instagram-specific preprocessing
      break;
      
    case 'email':
      // Email-specific preprocessing
      break;
      
    // Add other cases as needed
  }
  
  return processedContent;
}

// Detect file type based on filename and content
function detectFileType(filename, content) {
  const lowerFilename = filename.toLowerCase();
  let type = 'unknown';
  let confidence = 'low';
  
  // Check filename patterns for platform files
  
  // Facebook files
  if (lowerFilename.startsWith('fb_') || lowerFilename.includes('facebook')) {
    if (lowerFilename.includes('videos') || lowerFilename.includes('video')) {
      type = 'facebookVideos';
      confidence = 'high';
    } else if (lowerFilename.includes('posts') || lowerFilename.includes('post')) {
      type = 'facebookPosts';
      confidence = 'high';
    } else if (lowerFilename.includes('reach')) {
      type = 'facebookReach';
      confidence = 'high';
    } else if (lowerFilename.includes('audience')) {
      type = 'facebookAudience';
      confidence = 'high';
    } else if (lowerFilename.includes('follows')) {
      type = 'facebookFollows';
      confidence = 'high';
    } else if (lowerFilename.includes('interactions')) {
      type = 'facebookInteractions';
      confidence = 'high';
    } else if (lowerFilename.includes('link_clicks') || lowerFilename.includes('linkclicks')) {
      type = 'facebookLinkClicks';
      confidence = 'high';
    } else if (lowerFilename.includes('views')) {
      type = 'facebookViews';
      confidence = 'high';
    } else if (lowerFilename.includes('visits')) {
      type = 'facebookVisits';
      confidence = 'high';
    } else {
      // Generic Facebook file
      type = 'facebook';
      confidence = 'high';
    }
  } 
  
  // Instagram files
  else if (lowerFilename.startsWith('ig_') || lowerFilename.includes('instagram')) {
    if (lowerFilename.includes('posts') || lowerFilename.includes('post')) {
      type = 'instagramPosts';
      confidence = 'high';
    } else if (lowerFilename.includes('reach')) {
      type = 'instagramReach';
      confidence = 'high';
    } else if (lowerFilename.includes('audience')) {
      type = 'instagramAudience';
      confidence = 'high';
    } else if (lowerFilename.includes('follows')) {
      type = 'instagramFollows';
      confidence = 'high';
    } else if (lowerFilename.includes('interactions')) {
      type = 'instagramInteractions';
      confidence = 'high';
    } else if (lowerFilename.includes('link_clicks') || lowerFilename.includes('linkclicks')) {
      type = 'instagramLinkClicks';
      confidence = 'high';
    } else if (lowerFilename.includes('views')) {
      type = 'instagramViews';
      confidence = 'high';
    } else if (lowerFilename.includes('visits')) {
      type = 'instagramVisits';
      confidence = 'high';
    } else {
      // Generic Instagram file
      type = 'instagram';
      confidence = 'high';
    }
  } 
  
  // Email files
  else if (lowerFilename.includes('email') || lowerFilename.includes('campaign')) {
    type = 'email';
    confidence = 'high';
  } 
  
  // YouTube files
  else if (lowerFilename.includes('youtube')) {
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
    } else if (lowerFilename.includes('cities') || lowerFilename.includes('city')) {
      type = 'youtubeCities';
      confidence = 'high';
    } else {
      // Generic YouTube file
      type = 'youtube';
      confidence = 'medium';
    }
  } 
  
  // Google Analytics files
  else if (lowerFilename.startsWith('ga_') || lowerFilename.includes('analytics')) {
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
      type = 'facebookVideos';
      confidence = 'medium';
    } else if (headers.includes('post id') && headers.includes('likes') && 
              (headers.includes('saves') || headers.includes('description'))) {
      type = 'instagramPosts';
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
    // Facebook main file
    case 'facebook':
      converterState.processedFiles.facebook = { file, content };
      break;
      
    // Facebook specific files
    case 'facebookPosts':
      converterState.processedFiles.facebookSpecific.posts = { file, content };
      // Also store in main Facebook if not set
      if (!converterState.processedFiles.facebook) {
        converterState.processedFiles.facebook = { file, content };
      }
      break;
      
    case 'facebookVideos':
      converterState.processedFiles.facebookSpecific.videos = { file, content };
      // Also store in main Facebook if not set
      if (!converterState.processedFiles.facebook) {
        converterState.processedFiles.facebook = { file, content };
      }
      break;
      
    case 'facebookReach':
      converterState.processedFiles.facebookSpecific.reach = { file, content };
      break;
      
    case 'facebookAudience':
      converterState.processedFiles.facebookSpecific.audience = { file, content };
      break;
      
    case 'facebookFollows':
      converterState.processedFiles.facebookSpecific.follows = { file, content };
      break;
      
    case 'facebookInteractions':
      converterState.processedFiles.facebookSpecific.interactions = { file, content };
      break;
      
    case 'facebookLinkClicks':
      converterState.processedFiles.facebookSpecific.linkClicks = { file, content };
      break;
      
    case 'facebookViews':
      converterState.processedFiles.facebookSpecific.views = { file, content };
      break;
      
    case 'facebookVisits':
      converterState.processedFiles.facebookSpecific.visits = { file, content };
      break;
    
    // Instagram main file
    case 'instagram':
      converterState.processedFiles.instagram = { file, content };
      break;
      
    // Instagram specific files  
    case 'instagramPosts':
      converterState.processedFiles.instagramSpecific.posts = { file, content };
      // Also store in main Instagram if not set
      if (!converterState.processedFiles.instagram) {
        converterState.processedFiles.instagram = { file, content };
      }
      break;
      
    case 'instagramReach':
      converterState.processedFiles.instagramSpecific.reach = { file, content };
      break;
      
    case 'instagramAudience':
      converterState.processedFiles.instagramSpecific.audience = { file, content };
      break;
      
    case 'instagramFollows':
      converterState.processedFiles.instagramSpecific.follows = { file, content };
      break;
      
    case 'instagramInteractions':
      converterState.processedFiles.instagramSpecific.interactions = { file, content };
      break;
      
    case 'instagramLinkClicks':
      converterState.processedFiles.instagramSpecific.linkClicks = { file, content };
      break;
      
    case 'instagramViews':
      converterState.processedFiles.instagramSpecific.views = { file, content };
      break;
      
    case 'instagramVisits':
      converterState.processedFiles.instagramSpecific.visits = { file, content };
      break;
    
    // Email
    case 'email':
      converterState.processedFiles.email = { file, content };
      break;
    
    // YouTube files  
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
      
    case 'youtubeCities':
      converterState.processedFiles.youtube.cities = { file, content };
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
      } else if (headers.includes('city') || headers.includes('cities')) {
        converterState.processedFiles.youtube.cities = { file, content };
      }
      break;
    
    // Google Analytics files  
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
      
    // Handle unknown file types
    default:
      console.warn(`Unknown file type for ${file.name}. Using content analysis to try to categorize.`);
      
      // Try to categorize by content
      const unknownHeaders = content.split('\n')[0].toLowerCase();
      
      if (unknownHeaders.includes('video') && unknownHeaders.includes('facebook')) {
        converterState.processedFiles.facebookSpecific.videos = { file, content };
        if (!converterState.processedFiles.facebook) {
          converterState.processedFiles.facebook = { file, content };
        }
      } else if (unknownHeaders.includes('post') && unknownHeaders.includes('instagram')) {
        converterState.processedFiles.instagramSpecific.posts = { file, content };
        if (!converterState.processedFiles.instagram) {
          converterState.processedFiles.instagram = { file, content };
        }
      } else if (unknownHeaders.includes('email campaign')) {
        converterState.processedFiles.email = { file, content };
      } else {
        // Store as generic Facebook file if filename contains FB
        if (file.name.includes('FB_') || file.name.includes('Facebook')) {
          converterState.processedFiles.facebook = { file, content };
        }
        // Store as generic Instagram file if filename contains IG
        else if (file.name.includes('IG_') || file.name.includes('Instagram')) {
          converterState.processedFiles.instagram = { file, content };
        }
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
      facebookVideos: 'Facebook (Videos)',
      facebookPosts: 'Facebook (Posts)',
      facebookReach: 'Facebook (Reach)',
      facebookAudience: 'Facebook (Audience)',
      facebookFollows: 'Facebook (Follows)',
      facebookInteractions: 'Facebook (Interactions)',
      facebookLinkClicks: 'Facebook (Link Clicks)',
      facebookViews: 'Facebook (Views)',
      facebookVisits: 'Facebook (Visits)',
      
      instagram: 'Instagram',
      instagramPosts: 'Instagram (Posts)',
      instagramReach: 'Instagram (Reach)',
      instagramAudience: 'Instagram (Audience)',
      instagramFollows: 'Instagram (Follows)',
      instagramInteractions: 'Instagram (Interactions)',
      instagramLinkClicks: 'Instagram (Link Clicks)',
      instagramViews: 'Instagram (Views)',
      instagramVisits: 'Instagram (Visits)',
      
      email: 'Email',
      
      youtubeAge: 'YouTube (Age)',
      youtubeGender: 'YouTube (Gender)',
      youtubeGeography: 'YouTube (Geography)',
      youtubeSubscription: 'YouTube (Subscription)',
      youtubeContent: 'YouTube (Content)',
      youtubeCities: 'YouTube (Cities)',
      
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
  
  // Check Facebook files
  if (converterState.processedFiles.facebook) {
    filesList.push({
      file: converterState.processedFiles.facebook.file,
      type: 'facebook'
    });
  }
  
  // Check Facebook specific files
  for (const type in converterState.processedFiles.facebookSpecific) {
    if (converterState.processedFiles.facebookSpecific[type]) {
      filesList.push({
        file: converterState.processedFiles.facebookSpecific[type].file,
        type: 'facebook' + type.charAt(0).toUpperCase() + type.slice(1)
      });
    }
  }
  
  // Check Instagram files
  if (converterState.processedFiles.instagram) {
    filesList.push({
      file: converterState.processedFiles.instagram.file,
      type: 'instagram'
    });
  }
  
  // Check Instagram specific files
  for (const type in converterState.processedFiles.instagramSpecific) {
    if (converterState.processedFiles.instagramSpecific[type]) {
      filesList.push({
        file: converterState.processedFiles.instagramSpecific[type].file,
        type: 'instagram' + type.charAt(0).toUpperCase() + type.slice(1)
      });
    }
  }
  
  // Check Email files
  if (converterState.processedFiles.email) {
    filesList.push({
      file: converterState.processedFiles.email.file,
      type: 'email'
    });
  }
  
  // Check YouTube files
  for (const type in converterState.processedFiles.youtube) {
    if (converterState.processedFiles.youtube[type]) {
      filesList.push({
        file: converterState.processedFiles.youtube[type].file,
        type: 'youtube' + type.charAt(0).toUpperCase() + type.slice(1)
      });
    }
  }
  
  // Check Google Analytics files
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
  } else if (type.startsWith('facebook') && type !== 'facebook') {
    const subtypeKey = type.replace('facebook', '');
    const key = subtypeKey.charAt(0).toLowerCase() + subtypeKey.slice(1);
    if (converterState.processedFiles.facebookSpecific[key]) {
      converterState.processedFiles.facebookSpecific[key] = null;
    }
  } else if (type === 'instagram') {
    converterState.processedFiles.instagram = null;
  } else if (type.startsWith('instagram') && type !== 'instagram') {
    const subtypeKey = type.replace('instagram', '');
    const key = subtypeKey.charAt(0).toLowerCase() + subtypeKey.slice(1);
    if (converterState.processedFiles.instagramSpecific[key]) {
      converterState.processedFiles.instagramSpecific[key] = null;
    }
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
      
      converterState.outputData.facebook_data = processFacebookData(csvData, options);
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
      
      converterState.outputData.instagram_data = processInstagramData(csvData, options);
      console.log('Instagram data processed');
    }
    
    // Process Email data
    if (converterState.processedFiles.email) {
      const csvData = converterState.processedFiles.email.content;
      converterState.outputData.email_data = processEmailData(csvData);
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
      
      // Process YouTube data using the csv-processor function
      converterState.outputData.youtube_data = processYouTubeData(
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
      
      // Process Google Analytics data using the csv-processor function
      converterState.outputData.google_analytics_data = processGoogleAnalyticsData(
        demographicsData, pagesData, trafficData, utmsData
      );
      console.log('Google Analytics data processed');
    }
    
    // Generate cross-channel data from processed platform data
    converterState.outputData.cross_channel_data = generateCrossChannelData(
      converterState.outputData.facebook_data,
      converterState.outputData.instagram_data,
      converterState.outputData.youtube_data,
      converterState.outputData.email_data,
      converterState.outputData.google_analytics_data
    );
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
         converterState.processedFiles.youtube.content ||
         converterState.processedFiles.youtube.cities;
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

// Clear all files
function clearAllFiles() {
  // Reset state
  converterState.files = [];
  converterState.processedFiles = {
    facebook: null,
    facebookSpecific: {
      posts: null,
      videos: null,
      reach: null,
      audience: null,
      follows: null,
      interactions: null,
      linkClicks: null,
      views: null,
      visits: null
    },
    instagram: null,
    instagramSpecific: {
      posts: null,
      reach: null,
      audience: null,
      follows: null,
      interactions: null,
      linkClicks: null,
      views: null,
      visits: null
    },
    email: null,
    youtube: {
      age: null,
      gender: null,
      geography: null,
      subscription: null,
      content: null,
      cities: null
    },
    googleAnalytics: {
      demographics: null,
      pagesAndScreens: null,
      trafficAcquisition: null,
      utms: null
    }
  };
  converterState.outputData = {};
  
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