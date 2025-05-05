/**
 * Enhanced Marketing CSV Converter Interface
 * 
 * This script creates a user-friendly interface for converting marketing CSV files
 * to JSON format, with improved support for YouTube content and cross-channel metrics.
 */

// Initialize converter state
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
        content: null  // Added YouTube content type
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
  
  // Render the enhanced CSV converter dashboard
  function renderEnhancedConverter() {
    const container = document.getElementById('converter-dashboard');
    
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow mb-6">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Enhanced Marketing CSV Converter</h2>
          <p class="text-gray-600">Convert your marketing data CSVs into dashboard-ready JSON files</p>
        </div>
        
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
          <h3 class="font-medium text-blue-800 mb-2">Enhanced Features</h3>
          <ul class="list-disc ml-6 text-blue-700 text-sm">
            <li>Improved file type detection</li>
            <li>Enhanced YouTube content support</li>
            <li>Better cross-channel data integration</li>
            <li>Robust error handling and validation</li>
            <li>Google Analytics data optimization</li>
          </ul>
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
              <div class="text-gray-600 ml-3 font-bold">YouTube_Content.csv (New!)</div>
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
          <div id="file-list" class="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0">
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
          
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <div class="inline-flex items-center mr-2">
              <input type="checkbox" id="validate-files" class="rounded text-blue-600" checked>
              <label for="validate-files" class="ml-2 text-sm text-gray-700">Validate files before processing</label>
            </div>
            
            <div class="inline-flex items-center mr-2">
              <input type="checkbox" id="zip-output" class="rounded text-blue-600" checked>
              <label for="zip-output" class="ml-2 text-sm text-gray-700">Package output files as ZIP</label>
            </div>
            
            <div class="inline-flex items-center">
              <input type="checkbox" id="show-progress" class="rounded text-blue-600" checked>
              <label for="show-progress" class="ml-2 text-sm text-gray-700">Show detailed processing log</label>
            </div>
          </div>
          
          <div class="mt-4 flex flex-wrap gap-2">
            <button id="process-button" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Process Files
            </button>
            
            <button id="clear-button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
              Clear All
            </button>
            
            <button id="help-button" class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
              View Sample CSV Format
            </button>
          </div>
        </div>
        
        <div id="processing-log-container" class="mt-6 hidden">
          <h3 class="font-medium text-gray-800 mb-2">Processing Log</h3>
          <div id="processing-log" class="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-md h-48 overflow-y-auto">
            <!-- Processing log will appear here -->
          </div>
        </div>
        
        <div id="error-message" class="mt-4 hidden p-3 bg-red-50 text-red-800 rounded-md"></div>
      </div>
      
      <div id="results-container" class="bg-white p-6 rounded-lg shadow mb-6 hidden">
        <div class="mb-6 text-center">
          <svg class="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h2 class="mt-4 text-2xl font-bold text-gray-800">Processing Complete!</h2>
          <p class="mt-2 text-gray-600">Your marketing dashboard data is ready for download</p>
        </div>
        
        <div id="data-summary" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-800 mb-2">Data Summary</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-sm text-blue-500">Facebook</div>
              <div id="facebook-metrics" class="mt-1 font-medium">Waiting...</div>
            </div>
            <div class="bg-pink-50 p-3 rounded-lg">
              <div class="text-sm text-pink-500">Instagram</div>
              <div id="instagram-metrics" class="mt-1 font-medium">Waiting...</div>
            </div>
            <div class="bg-red-50 p-3 rounded-lg">
              <div class="text-sm text-red-500">YouTube</div>
              <div id="youtube-metrics" class="mt-1 font-medium">Waiting...</div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
              <div class="text-sm text-purple-500">Email</div>
              <div id="email-metrics" class="mt-1 font-medium">Waiting...</div>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <div class="text-sm text-green-500">Cross-Channel</div>
              <div id="cross-metrics" class="mt-1 font-medium">Waiting...</div>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col space-y-4">
          <button id="download-zip-button" class="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m-3-3V4m-7 5h14"></path>
            </svg>
            Download All Files (ZIP)
          </button>
          
          <div class="p-4 bg-gray-50 rounded-lg">
            <h4 class="text-sm font-medium text-gray-700 mb-3">Or download individual files:</h4>
            <div id="download-links" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <!-- Download links will be added here -->
            </div>
          </div>
        </div>
        
        <div class="mt-8 border-t border-gray-200 pt-6">
          <h3 class="font-medium text-gray-800 mb-2">Next Steps</h3>
          <ol class="list-decimal pl-6 text-gray-700 space-y-2">
            <li>Upload the generated JSON files to your <code class="px-1 py-0.5 bg-gray-100 rounded">/data</code> folder in your dashboard repository</li>
            <li>Make sure all files are in the correct location that the dashboard expects</li>
            <li>Check that all files are named correctly: <code class="px-1 py-0.5 bg-gray-100 rounded">facebook_data.json</code>, <code class="px-1 py-0.5 bg-gray-100 rounded">instagram_data.json</code>, etc.</li>
            <li>Refresh your dashboard to see the updated visualizations</li>
          </ol>
        </div>
        
        <div class="mt-6">
          <button id="start-over-button" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Start Over
          </button>
        </div>
      </div>
      
      <div id="sample-container" class="bg-white p-6 rounded-lg shadow mb-6 hidden">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-800">Sample CSV Formats</h3>
          <button id="close-samples" class="text-gray-500 hover:text-gray-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div class="mb-4">
          <label for="sample-selector" class="block text-sm font-medium text-gray-700">Select platform:</label>
          <select id="sample-selector" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="email">Email</option>
            <option value="youtube">YouTube</option>
            <option value="google-analytics">Google Analytics</option>
          </select>
        </div>
        
        <div class="bg-gray-50 p-4 rounded overflow-x-auto">
          <pre id="sample-content" class="text-xs text-gray-800 whitespace-pre"></pre>
        </div>
        
        <button id="back-to-converter" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Back to Converter
        </button>
      </div>
    `;
    
    // Initialize the converter functionality
    initializeEnhancedConverter();
  }
  
  // Initialize the enhanced converter
  function initializeEnhancedConverter() {
    // Setup drag and drop functionality
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    
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
    document.getElementById('process-button').addEventListener('click', processFiles);
    
    // Handle clear button click
    document.getElementById('clear-button').addEventListener('click', clearAllFiles);
    
    // Handle help button click
    document.getElementById('help-button').addEventListener('click', showSamples);
    
    // Handle close samples button click
    document.getElementById('close-samples').addEventListener('click', hideSamples);
    
    // Handle back to converter button click
    document.getElementById('back-to-converter').addEventListener('click', hideSamples);
    
    // Handle sample selector change
    document.getElementById('sample-selector').addEventListener('change', updateSampleContent);
    
    // Handle start over button click
    document.getElementById('start-over-button').addEventListener('click', resetConverter);
    
    // Handle download zip button click
    document.getElementById('download-zip-button').addEventListener('click', downloadZip);
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
    uploadProgress.classList.remove('hidden');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
    
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
        
        // Log the detected file type
        console.log(`Detected file type for ${file.name}: ${fileType.type} (Confidence: ${fileType.confidence})`);
        
        // Store file in the appropriate category
        storeFileByType(file, content, fileType.type);
        
        // Update progress
        filesProcessed++;
        const progress = Math.round((filesProcessed / csvFiles.length) * 100);
        progressBar.style.width = progress + '%';
        progressText.textContent = progress + '%';
        
        // If all files processed, update the UI
        if (filesProcessed === csvFiles.length) {
          updateFileList();
          document.getElementById('file-list-container').classList.remove('hidden');
          
          setTimeout(() => {
            uploadProgress.classList.add('hidden');
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
    
    // Check filename patterns first (more reliable)
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
          headers.includes('reactions') && headers.includes('comments') && headers.includes('shares')) {
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
      } else if (headers.includes('age') && headers.includes('gender') && headers.includes('country')) {
        type = 'gaDemographics';
        confidence = 'medium';
      } else if (headers.includes('page path') || headers.includes('page title')) {
        type = 'gaPages';
        confidence = 'medium';
      } else if (headers.includes('source') && headers.includes('medium')) {
        type = 'gaTraffic';
        confidence = 'medium';
      } else if (headers.includes('campaign') && headers.includes('source') && headers.includes('medium')) {
        type = 'gaUtms';
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
      document.getElementById('file-list-container').classList.add('hidden');
    }
  };
  
  // Process files and generate JSON
  function processFiles() {
    // Check if we have at least one file to process
    if (converterState.files.length === 0) {
      showError('Please upload at least one CSV file to process');
      return;
    }
    
    // Set loading state
    converterState.loading = true;
    toggleProcessingState(true);
    
    // Clear previous processing log
    const logElement = document.getElementById('processing-log');
    logElement.innerHTML = '';
    
    // Show processing log if option is checked
    if (document.getElementById('show-progress').checked) {
      document.getElementById('processing-log-container').classList.remove('hidden');
    } else {
      document.getElementById('processing-log-container').classList.add('hidden');
    }
    
    // Log starting
    appendToLog('Starting CSV to JSON conversion...', 'info');
    appendToLog('Detecting file types and validating content...', 'info');
    
    // Validate files if option is checked
    const shouldValidate = document.getElementById('validate-files').checked;
    if (shouldValidate) {
      const validationResult = validateFiles();
      if (!validationResult.valid) {
        appendToLog('⚠️ Validation failed: ' + validationResult.message, 'error');
        showError('Validation failed: ' + validationResult.message);
        toggleProcessingState(false);
        return;
      }
      appendToLog('✓ Validation successful', 'success');
    }
    
    try {
      // Process the data
      appendToLog('Processing Facebook data...', 'info');
      if (converterState.processedFiles.facebook) {
        converterState.outputData.facebook_data = processFacebookData(converterState.processedFiles.facebook.content);
        appendToLog('✓ Facebook data processed successfully', 'success');
      } else {
        appendToLog('ℹ️ No Facebook data to process', 'info');
      }
      
      appendToLog('Processing Instagram data...', 'info');
      if (converterState.processedFiles.instagram) {
        converterState.outputData.instagram_data = processInstagramData(converterState.processedFiles.instagram.content);
        appendToLog('✓ Instagram data processed successfully', 'success');
      } else {
        appendToLog('ℹ️ No Instagram data to process', 'info');
      }
      
      appendToLog('Processing Email data...', 'info');
      if (converterState.processedFiles.email) {
        converterState.outputData.email_data = processEmailData(converterState.processedFiles.email.content);
        appendToLog('✓ Email data processed successfully', 'success');
      } else {
        appendToLog('ℹ️ No Email data to process', 'info');
      }
      
      appendToLog('Processing YouTube data...', 'info');
      if (hasYoutubeData()) {
        const youtubeData = processYoutubeData(
          converterState.processedFiles.youtube.age?.content || null,
          converterState.processedFiles.youtube.gender?.content || null,
          converterState.processedFiles.youtube.geography?.content || null,
          converterState.processedFiles.youtube.subscription?.content || null,
          converterState.processedFiles.youtube.content?.content || null
        );
        converterState.outputData.youtube_data = youtubeData;
        appendToLog('✓ YouTube data processed successfully', 'success');
      } else {
        appendToLog('ℹ️ No YouTube data to process', 'info');
      }
      
      appendToLog('Processing Google Analytics data...', 'info');
      if (hasGoogleAnalyticsData()) {
        const gaData = processGoogleAnalyticsData(
          converterState.processedFiles.googleAnalytics.demographics?.content || null,
          converterState.processedFiles.googleAnalytics.pagesAndScreens?.content || null,
          converterState.processedFiles.googleAnalytics.trafficAcquisition?.content || null,
          converterState.processedFiles.googleAnalytics.utms?.content || null
        );
        converterState.outputData.google_analytics_data = gaData;
        appendToLog('✓ Google Analytics data processed successfully', 'success');
      } else {
        appendToLog('ℹ️ No Google Analytics data to process', 'info');
      }
      
      appendToLog('Generating cross-channel data...', 'info');
      converterState.outputData.cross_channel_data = generateCrossChannelData(
        converterState.outputData.facebook_data,
        converterState.outputData.instagram_data,
        converterState.outputData.youtube_data,
        converterState.outputData.email_data,
        converterState.outputData.google_analytics_data
      );
      appendToLog('✓ Cross-channel data generated successfully', 'success');
      
      // Processing complete
      appendToLog('🎉 All data processed successfully!', 'success');
      
      // Update UI with results
      updateResultsView();
      
      // Show results view
      document.getElementById('results-container').classList.remove('hidden');
      
      // Scroll to results
      document.getElementById('results-container').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error processing data:', error);
      appendToLog('❌ Error processing data: ' + error.message, 'error');
      showError('Error processing files: ' + error.message);
    }
    
    // Reset loading state
    converterState.loading = false;
    toggleProcessingState(false);
  }
  
  // Toggle processing state (loading/disabled UI elements)
  function toggleProcessingState(isProcessing) {
    const processButton = document.getElementById('process-button');
    const clearButton = document.getElementById('clear-button');
    const helpButton = document.getElementById('help-button');
    
    if (isProcessing) {
      processButton.disabled = true;
      processButton.textContent = 'Processing...';
      processButton.classList.add('opacity-70', 'cursor-not-allowed');
      clearButton.disabled = true;
      clearButton.classList.add('opacity-70', 'cursor-not-allowed');
      helpButton.disabled = true;
      helpButton.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
      processButton.disabled = false;
      processButton.textContent = 'Process Files';
      processButton.classList.remove('opacity-70', 'cursor-not-allowed');
      clearButton.disabled = false;
      clearButton.classList.remove('opacity-70', 'cursor-not-allowed');
      helpButton.disabled = false;
      helpButton.classList.remove('opacity-70', 'cursor-not-allowed');
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
  
  // Validate uploaded files
  function validateFiles() {
    // Check if we have at least one file to process
    if (converterState.files.length === 0) {
      return { valid: false, message: 'No files uploaded' };
    }
    
    // Check for CSV file format validity
    for (const file of converterState.files) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        return { valid: false, message: `File ${file.name} is not a CSV file` };
      }
    }
    
    // Specific platform validation
    
    // YouTube - check if we have at least the essential files
    if (hasYoutubeData()) {
      // Need at least age, gender, and subscription data
      if (!converterState.processedFiles.youtube.age) {
        appendToLog('⚠️ Warning: Missing YouTube age demographics data', 'warning');
      }
      
      if (!converterState.processedFiles.youtube.gender) {
        appendToLog('⚠️ Warning: Missing YouTube gender demographics data', 'warning');
      }
      
      if (!converterState.processedFiles.youtube.subscription) {
        appendToLog('⚠️ Warning: Missing YouTube subscription status data', 'warning');
      }
    }
    
    // All validation passed
    return { valid: true, message: 'All files are valid' };
  }
  
  // Add message to processing log
  function appendToLog(message, type = 'info') {
    const logElement = document.getElementById('processing-log');
    const timestamp = new Date().toLocaleTimeString();
    
    // Style based on message type
    let style = '';
    if (type === 'error') {
      style = 'color: #f87171;'; // red
    } else if (type === 'success') {
      style = 'color: #34d399;'; // green
    } else if (type === 'warning') {
      style = 'color: #fbbf24;'; // yellow
    } else {
      style = 'color: #60a5fa;'; // blue
    }
    
    const logItem = document.createElement('div');
    logItem.innerHTML = `<span style="color: #9ca3af;">[${timestamp}]</span> <span style="${style}">${message}</span>`;
    logElement.appendChild(logItem);
    
    // Scroll to bottom
    logElement.scrollTop = logElement.scrollHeight;
  }
  
  // Update the results view with metrics
  function updateResultsView() {
    // Update metrics summaries
    const fbMetrics = document.getElementById('facebook-metrics');
    const igMetrics = document.getElementById('instagram-metrics');
    const ytMetrics = document.getElementById('youtube-metrics');
    const emailMetrics = document.getElementById('email-metrics');
    const crossMetrics = document.getElementById('cross-metrics');
    
    // Format helper
    const formatNumber = (num) => {
      if (num === undefined || num === null) return 'N/A';
      return num.toLocaleString();
    };
    
    // Facebook metrics
    if (converterState.outputData.facebook_data) {
      const fb = converterState.outputData.facebook_data;
      fbMetrics.innerHTML = `
        Reach: ${formatNumber(fb.reach)}<br>
        Engagement: ${formatNumber(fb.engagement)}<br>
        Posts: ${formatNumber(fb.posts?.length || 0)}
      `;
    } else {
      fbMetrics.innerHTML = 'No data';
    }
    
    // Instagram metrics
    if (converterState.outputData.instagram_data) {
      const ig = converterState.outputData.instagram_data;
      igMetrics.innerHTML = `
        Reach: ${formatNumber(ig.reach)}<br>
        Engagement: ${formatNumber(ig.engagement)}<br>
        Posts: ${formatNumber(ig.posts?.length || 0)}
      `;
    } else {
      igMetrics.innerHTML = 'No data';
    }
    
    // YouTube metrics
    if (converterState.outputData.youtube_data) {
      const yt = converterState.outputData.youtube_data;
      ytMetrics.innerHTML = `
        Views: ${formatNumber(yt.totalViews)}<br>
        Watch time: ${formatNumber(yt.totalWatchTime)} hours<br>
        Avg duration: ${yt.averageViewDuration || 'N/A'}
      `;
    } else {
      ytMetrics.innerHTML = 'No data';
    }
    
    // Email metrics
    if (converterState.outputData.email_data) {
      const email = converterState.outputData.email_data;
      emailMetrics.innerHTML = `
        Sent: ${formatNumber(email.totalSent)}<br>
        Open rate: ${email.openRate}%<br>
        Click rate: ${email.clickRate}%
      `;
    } else {
      emailMetrics.innerHTML = 'No data';
    }
    
    // Cross-channel metrics
    if (converterState.outputData.cross_channel_data) {
      const cross = converterState.outputData.cross_channel_data;
      crossMetrics.innerHTML = `
        Total reach: ${formatNumber(cross.reach?.total || 0)}<br>
        Total engagement: ${formatNumber(cross.engagement?.total || 0)}<br>
        Overall engagement rate: ${cross.engagement_rate?.overall?.toFixed(2) || 0}%
      `;
    } else {
      crossMetrics.innerHTML = 'No data';
    }
    
    // Update download links
    updateDownloadLinks();
  }
  
  // Update download links
  function updateDownloadLinks() {
    const downloadLinks = document.getElementById('download-links');
    downloadLinks.innerHTML = '';
    
    // Platform colors for buttons
    const platformColors = {
      facebook_data: 'bg-blue-600 hover:bg-blue-700',
      instagram_data: 'bg-pink-600 hover:bg-pink-700',
      youtube_data: 'bg-red-600 hover:bg-red-700',
      email_data: 'bg-purple-600 hover:bg-purple-700',
      google_analytics_data: 'bg-green-600 hover:bg-green-700',
      cross_channel_data: 'bg-yellow-600 hover:bg-yellow-700'
    };
    
    // Create download links for each output file
    Object.entries(converterState.outputData).forEach(([key, data]) => {
      if (!data) return;
      
      const fileName = `${key}.json`;
      const buttonClass = platformColors[key] || 'bg-gray-600 hover:bg-gray-700';
      
      const link = document.createElement('button');
      link.className = `px-4 py-2 text-white rounded-md ${buttonClass} text-sm flex items-center`;
      link.innerHTML = `
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        ${fileName}
      `;
      
      link.addEventListener('click', () => {
        downloadFile(key, fileName);
      });
      
      downloadLinks.appendChild(link);
    });
    
    // Enable/disable ZIP download button based on if we have files
    const downloadZipButton = document.getElementById('download-zip-button');
    if (Object.keys(converterState.outputData).length === 0) {
      downloadZipButton.disabled = true;
      downloadZipButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      downloadZipButton.disabled = false;
      downloadZipButton.classList.remove('opacity-50', 'cursor-not-allowed');
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
    
    appendToLog(`Downloaded file: ${fileName}`, 'success');
  }
  
  // Download all files as ZIP
  function downloadZip() {
    if (!window.JSZip) {
      showError('JSZip library not loaded. Please refresh the page and try again.');
      return;
    }
    
    const zip = new JSZip();
    
    // Add each output file to the ZIP
    Object.entries(converterState.outputData).forEach(([key, data]) => {
      if (!data) return;
      
      const fileName = `${key}.json`;
      const jsonString = JSON.stringify(data, null, 2);
      zip.file(fileName, jsonString);
    });
    
    // Generate the ZIP file
    zip.generateAsync({ type: 'blob' })
      .then(function(content) {
        // Create download link
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'marketing_dashboard_data.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        appendToLog('Downloaded all files as ZIP', 'success');
      })
      .catch(function(error) {
        console.error('Error creating ZIP file:', error);
        showError('Error creating ZIP file: ' + error.message);
      });
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
    document.getElementById('file-input').value = '';
    
    // Hide the file list and results
    document.getElementById('file-list-container').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('processing-log-container').classList.add('hidden');
    
    // Clear error message
    document.getElementById('error-message').classList.add('hidden');
    
    appendToLog('Cleared all files', 'info');
  }
  
  // Reset the converter (from results view)
  function resetConverter() {
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
    converterState.outputData = {};
    
    // Reset file input
    document.getElementById('file-input').value = '';
    
    // Hide the file list and results
    document.getElementById('file-list-container').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('processing-log-container').classList.add('hidden');
    
    // Clear error message
    document.getElementById('error-message').classList.add('hidden');
  }
  
  // Show sample CSV formats
  function showSamples() {
    document.getElementById('sample-container').classList.remove('hidden');
    document.getElementById('sample-selector').value = 'facebook';
    updateSampleContent();
  }
  
  // Hide sample CSV formats
  function hideSamples() {
    document.getElementById('sample-container').classList.add('hidden');
  }
  
  // Update sample content based on selected platform
  function updateSampleContent() {
    const platform = document.getElementById('sample-selector').value;
    const sampleContent = document.getElementById('sample-content');
    
    // Sample CSV formats
    const samples = {
      facebook: `Video asset ID,Page ID,Page name,Title,Duration (sec),Publish time,Reach,3-second video views,1-minute video views,Reactions,Comments,Shares
  1234567890,987654321,Your Page,Example Video 1,180,2023-01-15T14:30:00,5243,1423,852,35,12,8
  1234567891,987654321,Your Page,Example Video 2,240,2023-02-20T10:15:00,7651,2536,1543,62,28,15`,
      instagram: `Post ID,Account ID,Account username,Account name,Description,Post type,Publish time,Reach,Likes,Comments,Shares,Saves
  1234567890,987654321,youraccount,Your Account,Example post with a beautiful image,Photo,2023-03-10T09:45:00,3241,128,18,5,12
  1234567891,987654321,youraccount,Your Account,Check out our latest product!,Carousel,2023-03-25T16:20:00,5642,215,32,8,24`,
      email: `Campaign,Emails sent,Email deliveries,Email opened (MPP excluded),Email open rate (MPP excluded),Email clicked,Email click rate,Email bounce rate,Email unsubscribe rate
  Monthly Newsletter January,5000,4950,1485,30.0%,297,6.0%,1.0%,0.2%
  Product Announcement,7500,7425,2598,35.0%,742,10.0%,1.0%,0.1%`,
      youtube: `Viewer age,Views (%),Average view duration,Average percentage viewed (%),Watch time (hours) (%)
  age 18-24,12.5,2:45,42.3,11.8
  age 25-34,28.3,3:12,48.7,30.2
  age 35-44,22.9,3:05,46.9,24.3
  
  Viewer gender,Views (%),Average view duration,Average percentage viewed (%),Watch time (hours) (%)
  Female,45.2,3:10,47.8,48.3
  Male,54.8,2:58,45.1,51.7
  
  Geography,Views,Watch time (hours),Average view duration
  United States,12543,1245.6,3:35
  United Kingdom,5432,498.7,3:18
  Canada,3214,302.5,3:24
  
  Subscription status,Views,Watch time (hours),Average view duration
  Subscribed,15243,1632.5,3:45
  Not subscribed,28765,2543.8,2:58
  Total,44008,4176.3,3:18`,
      'google-analytics': `Dimension,Value,Users,New users,Sessions
  Age,18-24,1523,842,3214
  Age,25-34,4215,2134,10542
  Age,35-44,3652,1732,8765
  
  Default channel group,Source,Medium,Sessions,Users,Engaged sessions,Engagement rate
  Organic Search,google,organic,12543,8765,10254,81.75
  Direct,direct,none,8765,6543,6932,79.09
  Social,facebook,social,4325,3216,3621,83.72
  
  Page path,Page title,Pageviews,Unique pageviews,Average time on page
  /home,Home Page,15243,12534,00:02:45
  /products,Products,8765,7653,00:01:58
  /about-us,About Us,4532,4215,00:01:32`
    };
    
    sampleContent.textContent = samples[platform] || 'No sample available for this platform';
  }
  
  // Show error message
  function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // Scroll to error message
    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide message after a few seconds
    setTimeout(() => {
      errorElement.classList.add('hidden');
    }, 7000);
  }
  
  // Process data functions are included from the Enhanced Marketing CSV Processor script
  // These functions would be imported or defined elsewhere in a real implementation
  
  // Dummy implementation for this example
  function processFacebookData(content) {
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
        shares: 5 + Math.random() * 25,
        views: Math.random() > 0.5 ? 3000 + Math.random() * 2000 : 0
      })),
      performance_trend: Array(12).fill().map((_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        reach: 15000 + i * 1000 + Math.random() * 500,
        engagement: 1500 + i * 100 + Math.random() * 50
      }))
    };
  }
  
  function processInstagramData(content) {
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
  }
  
  function processEmailData(content) {
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
  }
  
  function processYoutubeData(ageContent, genderContent, geoContent, subContent, contentData) {
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
  }
  
  function processGoogleAnalyticsData(demoContent, pagesContent, trafficContent, utmsContent) {
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
        })),
        cities: Array(10).fill().map((_, i) => ({
          city: ['New York', 'London', 'Los Angeles', 'Toronto', 'Sydney', 'Paris', 'Berlin', 'Tokyo', 'São Paulo', 'Mexico City'][i],
          users: 7500 - i * 600 + Math.random() * 300,
          sessions: 16250 - i * 1300 + Math.random() * 650,
          percentage: 5 - i * 0.4 + Math.random() * 0.2
        }))
      },
      topPages: Array(20).fill().map((_, i) => ({
        pagePath: [`/home`, `/products`, `/about`, `/contact`, `/blog`, `/services`, `/pricing`, `/support`, `/faq`, `/gallery`, 
                   `/events`, `/team`, `/careers`, `/testimonials`, `/portfolio`, `/resources`, `/partners`, `/case-studies`, `/news`, `/login`][i],
        pageTitle: [`Home`, `Products`, `About Us`, `Contact`, `Blog`, `Services`, `Pricing`, `Support`, `FAQ`, `Gallery`, 
                    `Events`, `Our Team`, `Careers`, `Testimonials`, `Portfolio`, `Resources`, `Partners`, `Case Studies`, `News`, `Login`][i],
        pageviews: 16250 - i * 750 + Math.random() * 375,
        uniquePageviews: 14625 - i * 675 + Math.random() * 338,
        averageTimeOnPage: `${Math.floor(2 - i * 0.09)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
      })),
      trafficSources: [
        { source: 'google', medium: 'organic', channel: 'Organic Search', sessions: 130000, users: 60000, engagedSessions: 104000, engagementRate: 80.0, percentage: 40.0 },
        { source: 'direct', medium: 'none', channel: 'Direct', sessions: 65000, users: 30000, engagedSessions: 52000, engagementRate: 80.0, percentage: 20.0 },
        { source: 'facebook', medium: 'social', channel: 'Social', sessions: 32500, users: 15000, engagedSessions: 26000, engagementRate: 80.0, percentage: 10.0 },
        { source: 'newsletter', medium: 'email', channel: 'Email', sessions: 32500, users: 15000, engagedSessions: 26000, engagementRate: 80.0, percentage: 10.0 },
        { source: 'linkedin', medium: 'social', channel: 'Social', sessions: 16250, users: 7500, engagedSessions: 13000, engagementRate: 80.0, percentage: 5.0 },
        { source: 'instagram', medium: 'social', channel: 'Social', sessions: 16250, users: 7500, engagedSessions: 13000, engagementRate: 80.0, percentage: 5.0 },
        { source: 'bing', medium: 'organic', channel: 'Organic Search', sessions: 16250, users: 7500, engagedSessions: 13000, engagementRate: 80.0, percentage: 5.0 },
        { source: 'google', medium: 'cpc', channel: 'Paid Search', sessions: 16250, users: 7500, engagedSessions: 13000, engagementRate: 80.0, percentage: 5.0 }
      ],
      campaigns: Array(10).fill().map((_, i) => ({
        campaign: [`Spring Sale ${new Date().getFullYear()}`, `Product Launch`, `Newsletter`, `Blog Promotion`, `Holiday Special`, 
                   `Webinar Registration`, `eBook Download`, `Free Trial`, `Customer Testimonials`, `Brand Awareness`][i],
        source: ['google', 'facebook', 'newsletter', 'linkedin', 'instagram', 'twitter', 'bing', 'youtube', 'partner', 'referral'][i],
        medium: ['cpc', 'social', 'email', 'social', 'social', 'social', 'cpc', 'video', 'referral', 'referral'][i],
        users: 7500 - i * 600 + Math.random() * 300,
        sessions: 16250 - i * 1300 + Math.random() * 650,
        conversions: 750 - i * 60 + Math.random() * 30,
        conversionRate: 10 - i * 0.5 + Math.random() * 0.25
      }))
    };
  }
  
  function generateCrossChannelData(facebook, instagram, youtube, email, googleAnalytics) {
    const totalReach = (facebook?.reach || 0) + (instagram?.reach || 0) + (youtube?.totalViews || 0);
    const totalEngagement = (facebook?.engagement || 0) + (instagram?.engagement || 0) + (youtube?.totalViews * 0.1 || 0);
    
    return {
      reach: {
        total: totalReach,
        byPlatform: {
          facebook: facebook?.reach || 0,
          instagram: instagram?.reach || 0,
          youtube: youtube?.totalViews || 0,
          web: googleAnalytics?.totalUsers || 0
        }
      },
      engagement: {
        total: totalEngagement,
        byPlatform: {
          facebook: facebook?.engagement || 0,
          instagram: instagram?.engagement || 0,
          youtube: youtube?.totalViews * 0.1 || 0,
          web: googleAnalytics?.engagedSessions || 0
        }
      },
      engagement_rate: {
        overall: totalReach > 0 ? parseFloat(((totalEngagement / totalReach) * 100).toFixed(2)) : 0,
        byPlatform: {
          facebook: facebook?.engagement_rate || 0,
          instagram: instagram?.engagement_rate || 0,
          email: email?.clickRate || 0,
          web: googleAnalytics?.engagementRate || 0
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
          { age: '25-34', facebook: 28, instagram: 35, youtube: 31, web: 30 },
          { age: '35-44', facebook: 22, instagram: 20, youtube: 23, web: 25 },
          { age: '45-54', facebook: 18, instagram: 10, youtube: 14, web: 15 },
          { age: '55-64', facebook: 12, instagram: 3, youtube: 8, web: 10 },
          { age: '65+', facebook: 5, instagram: 2, youtube: 6, web: 5 }
        ]
      },
      meta: {
        lastUpdated: new Date().toISOString(),
        dataSourcesIncluded: {
          facebook: !!facebook,
          instagram: !!instagram,
          youtube: !!youtube,
          email: !!email,
          googleAnalytics: !!googleAnalytics
        }
      }
    };
  }