/**
 * CSV Converter Component for Marketing Dashboard
 * Handles file uploads, processing, and JSON downloads
 */

// Initialize converter state
window.converterState = {
  files: [],
  processedFiles: {
      facebook: null,
      facebookSpecific: {
          posts: null,
          reach: null,
          interactions: null
      },
      instagram: null,
      instagramSpecific: {
          reach: null,
          interactions: null
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
  step: 'upload',
  error: null
};

/**
* Render the CSV Converter Dashboard
*/
function renderConverterDashboard() {
  const container = document.getElementById('converter-dashboard');
  if (!container) return;

  // Render the converter UI
  container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-lg">
          <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-800 mb-2">Marketing Data CSV Converter</h2>
              <p class="text-gray-600">
                  Upload your marketing data CSV files, and this tool will convert them into standardized JSON formats for the dashboard.
              </p>
          </div>
          
          <!-- Step indicator -->
          <div class="mb-8">
              <div class="flex items-center">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center ${window.converterState.step === 'upload' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-500'}">1</div>
                  <div class="flex-1 h-1 mx-2 bg-gray-200">
                      <div class="h-full ${window.converterState.step !== 'upload' ? 'bg-blue-500' : 'bg-gray-200'}" style="width: ${window.converterState.step === 'upload' ? '0%' : '100%'}"></div>
                  </div>
                  <div class="w-8 h-8 rounded-full flex items-center justify-center ${window.converterState.step === 'processing' ? 'bg-blue-500 text-white' : window.converterState.step === 'results' || window.converterState.step === 'error' ? 'bg-blue-100 text-blue-500' : 'bg-gray-200 text-gray-500'}">2</div>
                  <div class="flex-1 h-1 mx-2 bg-gray-200">
                      <div class="h-full ${window.converterState.step === 'results' || window.converterState.step === 'error' ? 'bg-blue-500' : 'bg-gray-200'}" style="width: ${window.converterState.step === 'results' || window.converterState.step === 'error' ? '100%' : '0%'}"></div>
                  </div>
                  <div class="w-8 h-8 rounded-full flex items-center justify-center ${window.converterState.step === 'results' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}">3</div>
              </div>
              <div class="flex text-sm mt-2">
                  <div class="flex-1 text-center">Upload Files</div>
                  <div class="flex-1 text-center">Process Data</div>
                  <div class="flex-1 text-center">Download Results</div>
              </div>
          </div>
          
          ${renderConverterStep()}
      </div>
  `;

  // Add event listeners after rendering the UI
  attachConverterEventListeners();
}

// Render the appropriate step based on the current state
function renderConverterStep() {
  switch(window.converterState.step) {
      case 'upload':
          return renderUploadStep();
      case 'processing':
          return renderProcessingStep();
      case 'error':
          return renderErrorStep();
      case 'results':
          return renderResultsStep();
      default:
          return renderUploadStep();
  }
}

// Render the upload files step
function renderUploadStep() {
  const filesList = window.converterState.files.length > 0 ? `
      <div class="mt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Uploaded Files (${window.converterState.files.length})</h3>
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <ul class="divide-y divide-gray-200">
                  ${window.converterState.files.map((file, index) => `
                      <li class="px-4 py-3 flex items-center justify-between">
                          <div class="flex items-center">
                              <svg class="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span class="text-sm font-medium text-gray-800">${file.name}</span>
                          </div>
                          <span class="text-sm text-gray-500">${Math.round(file.size / 1024)} KB</span>
                      </li>
                  `).join('')}
              </ul>
          </div>
          
          <div class="mt-4 flex justify-between">
              <button
                  id="converter-clear-btn"
                  class="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
              >
                  Clear All
              </button>
              <button
                  id="converter-process-btn"
                  class="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition ${window.converterState.files.length === 0 || window.converterState.loading ? 'opacity-50 cursor-not-allowed' : ''}"
              >
                  ${window.converterState.loading ? 'Processing...' : 'Process Files'}
              </button>
          </div>
      </div>
  ` : '';

  return `
      <div class="upload-section">
          <div class="max-w-xl mx-auto">
              <div class="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                  <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p class="mt-1 text-sm text-gray-600">
                          Drag and drop your CSV files, or <span class="text-blue-500 font-medium">browse</span>
                      </p>
                  </div>
                  
                  <div class="mt-4">
                      <input
                          type="file"
                          id="file-upload"
                          class="hidden"
                          multiple
                          accept=".csv"
                      />
                      <label
                          for="file-upload"
                          class="cursor-pointer w-full bg-blue-500 text-white font-medium py-2 px-4 rounded text-center block hover:bg-blue-600 transition"
                      >
                          Select CSV Files
                      </label>
                  </div>
              </div>
              
              ${filesList}
          </div>
      </div>
  `;
}

// Render the processing step with progress tracking
function renderProcessingStep() {
  const totalTasks = countProcessingTasks();
  
  return `
      <div class="processing-section flex flex-col items-center justify-center py-8">
          <div class="mb-6 w-full max-w-md">
              <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700" id="processing-progress-text">Processing... 0%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                  <div id="processing-progress" class="bg-blue-600 h-2.5 rounded-full" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
          </div>
          
          <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          
          <div class="text-center">
              <h3 class="text-lg font-medium text-gray-800 mb-2">Processing Files</h3>
              <p class="text-gray-600 mb-2">Currently processing:</p>
              <p class="font-medium text-blue-600" id="current-task-name">Preparing data...</p>
          </div>
          
          <div class="mt-8 text-sm text-gray-500">
              This may take a few moments depending on the file size and complexity.
          </div>
      </div>
  `;
}

// Render the error step
function renderErrorStep() {
  return `
      <div class="error-section bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-medium text-red-800 mb-2">Processing Error</h3>
          <p class="text-red-700 mb-4">${window.converterState.error || 'An unknown error occurred'}</p>
          <button
              id="converter-reset-btn"
              class="bg-red-100 text-red-700 py-2 px-4 rounded hover:bg-red-200 transition"
          >
              Go Back and Try Again
          </button>
      </div>
  `;
}

// Render the results step
function renderResultsStep() {
  const outputKeys = Object.keys(window.converterState.outputData);
  
  return `
      <div class="results-section">
          <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div class="flex items-start">
                  <div class="mr-3 bg-green-100 rounded-full p-2">
                      <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                  </div>
                  <div>
                      <h3 class="text-lg font-medium text-green-800">Processing Successful!</h3>
                      <p class="text-green-700">Your data has been successfully processed. You can now download the results.</p>
                  </div>
              </div>
          </div>
          
          <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 class="text-lg font-medium text-gray-800 mb-4">Download Options</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div class="p-4 border border-gray-200 rounded-lg">
                      <h4 class="font-medium text-gray-700 mb-2">Individual Files</h4>
                      ${outputKeys.map(key => `
                          <button
                              class="download-file-btn block w-full text-left px-3 py-2 mt-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                              data-key="${key}"
                          >
                              ${key}.json
                          </button>
                      `).join('')}
                  </div>
                  
                  <div class="p-4 border border-gray-200 rounded-lg">
                      <h4 class="font-medium text-gray-700 mb-2">Download All</h4>
                      <p class="text-sm text-gray-600 mb-4">
                          Download all processed data files in a single ZIP archive.
                      </p>
                      <button
                          id="download-zip-btn"
                          class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                      >
                          Download ZIP Archive
                      </button>
                  </div>
              </div>
              
              <div class="mt-6">
                  <h4 class="font-medium text-gray-700 mb-2">Data Preview</h4>
                  <div class="bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
                      <pre class="text-xs text-gray-700 whitespace-pre-wrap">
${JSON.stringify(outputKeys.reduce((acc, key) => {
  acc[key] = {
      type: 'json',
      size: JSON.stringify(window.converterState.outputData[key]).length,
      sample: '...'
  };
  return acc;
}, {}), null, 2)}
                      </pre>
                  </div>
              </div>
          </div>
          
          <div class="flex justify-between">
              <button
                  id="converter-reset-btn"
                  class="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition"
              >
                  Process New Files
              </button>
          </div>
      </div>
  `;
}

// Count the number of processing tasks based on available data
function countProcessingTasks() {
  let count = 0;
  
  // Count platform-specific tasks
  if (window.converterState.processedFiles.facebook) count++;
  if (window.converterState.processedFiles.instagram) count++;
  if (window.converterState.processedFiles.email) count++;
  if (hasYoutubeData()) count++;
  if (hasGoogleAnalyticsData()) count++;
  
  // Add standard tasks
  count += 2; // Cross-channel analysis and data normalization
  
  return count;
}

// Show error message
function showError(message) {
  window.converterState.error = message;
  window.converterState.step = 'error';
  renderConverterDashboard();
}

// Toggle processing state
function toggleProcessingState(isProcessing) {
  window.converterState.loading = isProcessing;
  window.converterState.step = isProcessing ? 'processing' : 'upload';
  renderConverterDashboard();
}

// Handle file upload
function handleFileUpload(event) {
  const files = Array.from(event.target.files);
  
  // Validate files
  const { errors, csvFiles } = validateFiles(files);
  
  // Show errors if any
  if (errors.length > 0) {
      showError('File validation errors:\n' + errors.join('\n'));
      return;
  }
  
  // If no valid CSV files, show error
  if (csvFiles.length === 0) {
      showError('Please upload at least one valid CSV file.');
      return;
  }
  
  // Add to state and categorize
  window.converterState.files = [...window.converterState.files, ...csvFiles];
  categorizeFiles(csvFiles);
  
  // Re-render the converter UI
  renderConverterDashboard();
}

// Enhanced file validation
function validateFiles(files) {
  const errors = [];
  const csvFiles = [];
  
  for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
          errors.push(`File "${file.name}" is not a CSV file.`);
          continue;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10 MB limit
          errors.push(`File "${file.name}" exceeds the maximum size limit of 10 MB.`);
          continue;
      }
      
      csvFiles.push(file);
  }
  
  return { errors, csvFiles };
}

// Categorize uploaded files based on filename
function categorizeFiles(newFiles) {
  const updatedProcessedFiles = { ...window.converterState.processedFiles };

  newFiles.forEach(file => {
      const fileName = file.name.toLowerCase();
      
      // Read the file content
      const reader = new FileReader();
      reader.onload = (e) => {
          const content = e.target.result;
          
          // Facebook files
          if (fileName.includes('fb_posts') || fileName.includes('facebook_posts')) {
              updatedProcessedFiles.facebookSpecific.posts = { file, content };
              updatedProcessedFiles.facebook = { file, content };
          } else if (fileName.includes('fb_reach') || fileName.includes('facebook_reach')) {
              updatedProcessedFiles.facebookSpecific.reach = { file, content };
          } else if (fileName.includes('fb_interactions') || fileName.includes('facebook_interactions')) {
              updatedProcessedFiles.facebookSpecific.interactions = { file, content };
          } 
          // Instagram files
          else if (fileName.includes('ig_posts') || fileName.includes('instagram_posts')) {
              updatedProcessedFiles.instagram = { file, content };
          } else if (fileName.includes('ig_reach') || fileName.includes('instagram_reach')) {
              updatedProcessedFiles.instagramSpecific.reach = { file, content };
          } else if (fileName.includes('ig_interactions') || fileName.includes('instagram_interactions')) {
              updatedProcessedFiles.instagramSpecific.interactions = { file, content };
          } 
          // Email files
          else if (fileName.includes('email') || fileName.includes('campaign_performance')) {
              updatedProcessedFiles.email = { file, content };
          } 
          // YouTube files
          else if (fileName.includes('youtube_age')) {
              updatedProcessedFiles.youtube.age = { file, content };
          } else if (fileName.includes('youtube_gender')) {
              updatedProcessedFiles.youtube.gender = { file, content };
          } else if (fileName.includes('youtube_geography')) {
              updatedProcessedFiles.youtube.geography = { file, content };
          } else if (fileName.includes('youtube_subscription')) {
              updatedProcessedFiles.youtube.subscription = { file, content };
          } else if (fileName.includes('youtube_content')) {
              updatedProcessedFiles.youtube.content = { file, content };
          } else if (fileName.includes('youtube_cities')) {
              updatedProcessedFiles.youtube.cities = { file, content };
          } 
          // Google Analytics files
          else if (fileName.includes('ga_demographics')) {
              updatedProcessedFiles.googleAnalytics.demographics = { file, content };
          } else if (fileName.includes('ga_pages')) {
              updatedProcessedFiles.googleAnalytics.pagesAndScreens = { file, content };
          } else if (fileName.includes('ga_traffic')) {
              updatedProcessedFiles.googleAnalytics.trafficAcquisition = { file, content };
          } else if (fileName.includes('ga_utms')) {
              updatedProcessedFiles.googleAnalytics.utms = { file, content };
          }
          
          window.converterState.processedFiles = updatedProcessedFiles;
      };
      
      reader.readAsText(file);
  });
}

// Check if we have YouTube data
function hasYoutubeData() {
  return window.converterState.processedFiles.youtube.age || 
         window.converterState.processedFiles.youtube.gender || 
         window.converterState.processedFiles.youtube.geography || 
         window.converterState.processedFiles.youtube.subscription || 
         window.converterState.processedFiles.youtube.content;
}

// Check if we have Google Analytics data
function hasGoogleAnalyticsData() {
  return window.converterState.processedFiles.googleAnalytics.demographics || 
         window.converterState.processedFiles.googleAnalytics.pagesAndScreens || 
         window.converterState.processedFiles.googleAnalytics.trafficAcquisition || 
         window.converterState.processedFiles.googleAnalytics.utms;
}

// Process files with progress tracking
function processFiles() {
  // Check if we have at least one file to process
  if (window.converterState.files.length === 0) {
      showError('Please upload at least one CSV file to process');
      return;
  }
  
  // Set loading state
  window.converterState.loading = true;
  window.converterState.step = 'processing';
  window.converterState.error = null;
  
  // Re-render to show processing state
  renderConverterDashboard();
  
  // Use setTimeout to allow the UI to update before processing starts
  setTimeout(() => {
      processFilesWithProgress();
  }, 100);
}

// Process files with progress tracking
function processFilesWithProgress() {
  // Create an array of processing tasks
  const tasks = [];
  const result = {};
  
  // Facebook task
  if (window.converterState.processedFiles.facebook) {
      tasks.push({
          name: 'Facebook',
          execute: () => {
              const options = {
                  postsData: window.converterState.processedFiles.facebookSpecific.posts?.content,
                  reachData: window.converterState.processedFiles.facebookSpecific.reach?.content,
                  interactionsData: window.converterState.processedFiles.facebookSpecific.interactions?.content
              };
              
              result.facebook_data = window.processFacebookData(
                  window.converterState.processedFiles.facebook.content, 
                  options
              );
              return 'Facebook data processed';
          }
      });
  }
  
  // Instagram task
  if (window.converterState.processedFiles.instagram) {
      tasks.push({
          name: 'Instagram',
          execute: () => {
              const options = {
                  reachData: window.converterState.processedFiles.instagramSpecific.reach?.content,
                  interactionsData: window.converterState.processedFiles.instagramSpecific.interactions?.content
              };
              
              result.instagram_data = window.processInstagramData(
                  window.converterState.processedFiles.instagram.content, 
                  options
              );
              return 'Instagram data processed';
          }
      });
  }
  
  // Email task
  if (window.converterState.processedFiles.email) {
      tasks.push({
          name: 'Email',
          execute: () => {
              result.email_data = window.processEmailData(
                  window.converterState.processedFiles.email.content
              );
              return 'Email data processed';
          }
      });
  }
  
  // YouTube task
  if (hasYoutubeData()) {
      tasks.push({
          name: 'YouTube',
          execute: () => {
              const ageData = window.converterState.processedFiles.youtube.age?.content || '';
              const genderData = window.converterState.processedFiles.youtube.gender?.content || '';
              const geoData = window.converterState.processedFiles.youtube.geography?.content || '';
              const subscriptionData = window.converterState.processedFiles.youtube.subscription?.content || '';
              const contentData = window.converterState.processedFiles.youtube.content?.content || '';
              
              const options = {
                  citiesData: window.converterState.processedFiles.youtube.cities?.content
              };
              
              result.youtube_data = window.processYouTubeData(
                  ageData, genderData, geoData, subscriptionData, contentData, options
              );
              return 'YouTube data processed';
          }
      });
  }
  
  // Google Analytics task
  if (hasGoogleAnalyticsData()) {
      tasks.push({
          name: 'Google Analytics',
          execute: () => {
              const demographicsData = window.converterState.processedFiles.googleAnalytics.demographics?.content || '';
              const pagesData = window.converterState.processedFiles.googleAnalytics.pagesAndScreens?.content || '';
              const trafficData = window.converterState.processedFiles.googleAnalytics.trafficAcquisition?.content || '';
              const utmsData = window.converterState.processedFiles.googleAnalytics.utms?.content || '';
              
              result.google_analytics_data = window.processGoogleAnalyticsData(
                  demographicsData, pagesData, trafficData, utmsData
              );
              return 'Google Analytics data processed';
          }
      });
  }
  
  // Cross-channel task
  tasks.push({
      name: 'Cross-Channel Analysis',
      execute: () => {
          result.cross_channel_data = window.generateCrossChannelData(
              result.facebook_data,
              result.instagram_data,
              result.youtube_data,
              result.email_data,
              result.google_analytics_data
          );
          return 'Cross-channel data generated';
      }
  });
  
  // Data normalization task
  tasks.push({
      name: 'Data Normalization',
      execute: () => {
          const normalizedResult = {};
          Object.keys(result).forEach(key => {
              if (result[key]) {
                  normalizedResult[key] = window.normalizeObject(result[key]);
              }
          });
          window.converterState.outputData = normalizedResult;
          return 'Data normalized';
      }
  });
  
  // Execute tasks sequentially with progress updates
  executeTasksSequentially(tasks)
      .then(() => {
          // Success - show results
          window.converterState.step = 'results';
          renderConverterDashboard();
      })
      .catch(error => {
          // Error - show error message
          showError('Error processing files: ' + error.message);
      })
      .finally(() => {
          // Reset loading state
          window.converterState.loading = false;
      });
}

// Execute tasks sequentially with progress updates
function executeTasksSequentially(tasks) {
  let completedTasks = 0;
  const totalTasks = tasks.length;
  
  // Function to update progress
  function updateProgress() {
      // Calculate progress percentage
      const progress = (completedTasks / totalTasks) * 100;
      
      // Update progress in the UI
      const progressElement = document.getElementById('processing-progress');
      if (progressElement) {
          progressElement.style.width = `${progress}%`;
          progressElement.setAttribute('aria-valuenow', progress);
      }
      
      // Update progress text
      const progressTextElement = document.getElementById('processing-progress-text');
      if (progressTextElement) {
          progressTextElement.textContent = `Processing... ${Math.round(progress)}%`;
      }
      
      // Update current task name
      const currentTaskElement = document.getElementById('current-task-name');
      if (currentTaskElement && completedTasks < totalTasks) {
          currentTaskElement.textContent = tasks[completedTasks].name;
      }
  }
  
  // Execute tasks one by one
  return new Promise((resolve, reject) => {
      // Create recursive function to execute tasks
      function executeNext() {
          if (completedTasks >= totalTasks) {
              // All tasks completed
              resolve();
              return;
          }
          
          // Get the next task
          const task = tasks[completedTasks];
          
          try {
              // Execute the task
              const result = task.execute();
              console.log(result);
              
              // Update completed tasks counter
              completedTasks++;
              
              // Update progress
              updateProgress();
              
              // Schedule the next task
              setTimeout(executeNext, 50);
          } catch (error) {
              console.error(`Error executing task "${task.name}":`, error);
              reject(error);
          }
      }
      
      // Start executing tasks
      updateProgress();
      executeNext();
  });
}

// Download a single file
function downloadFile(key) {
  if (!window.converterState.outputData[key]) return;
  
  // Ensure the data is normalized
  const data = window.normalizeObject(window.converterState.outputData[key]);
  
  // Convert to JSON string with proper formatting
  const jsonString = JSON.stringify(data, null, 2);
  
  // Create and trigger download
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${key}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

// Download all files as ZIP
function downloadZip() {
  try {
      if (typeof JSZip === 'undefined') {
          showError('JSZip library not loaded. Please make sure all dependencies are loaded.');
          return;
      }
      
      const zip = new JSZip();
      
      // Add each file to the ZIP, ensuring data is normalized
      Object.entries(window.converterState.outputData).forEach(([key, data]) => {
          const fileName = `${key}.json`;
          const normalizedData = window.normalizeObject(data);
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
  } catch (error) {
      console.error('Error creating ZIP:', error);
      showError('Error creating ZIP file: ' + error.message);
  }
}

// Reset the converter
function resetConverter() {
  window.converterState = {
      files: [],
      processedFiles: {
          facebook: null,
          facebookSpecific: {
              posts: null,
              reach: null,
              interactions: null
          },
          instagram: null,
          instagramSpecific: {
              reach: null,
              interactions: null
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
      step: 'upload',
      error: null
  };
  
  // Re-render the converter UI
  renderConverterDashboard();
}

// Set up drag and drop functionality
function setupDragDropEvents() {
  const dropZone = document.querySelector('.border-dashed');
  
  if (!dropZone) return;
  
  // Prevent default behavior for drag events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
  });
  
  function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
  }
  
  // Highlight drop zone when dragging over it
  ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false);
  });
  
  // Remove highlight when dragging leaves
  ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false);
  });
  
  function highlight() {
      dropZone.classList.add('bg-blue-50', 'border-blue-300');
      dropZone.classList.remove('bg-gray-50', 'border-gray-300');
  }
  
  function unhighlight() {
      dropZone.classList.remove('bg-blue-50', 'border-blue-300');
      dropZone.classList.add('bg-gray-50', 'border-gray-300');
  }
  
  // Handle file drop
  dropZone.addEventListener('drop', handleDrop, false);
  
  function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length === 0) return;
      
      // Filter for CSV files only
      const csvFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.csv'));
      
      if (csvFiles.length === 0) {
          window.converterState.error = 'No CSV files found in the dropped files. Please upload CSV files only.';
          window.converterState.step = 'error';
          renderConverterDashboard();
          return;
      }
      
      // Add to state and categorize
      window.converterState.files = [...window.converterState.files, ...csvFiles];
      categorizeFiles(csvFiles);
      
      // Re-render the converter UI
      renderConverterDashboard();
  }
}

// Attach event listeners for the converter
function attachConverterEventListeners() {
  // File upload
  const fileUpload = document.getElementById('file-upload');
  if (fileUpload) {
      fileUpload.addEventListener('change', handleFileUpload);
  }
  
  // Set up drag and drop
  setupDragDropEvents();
  
  // Clear all button
  const clearBtn = document.getElementById('converter-clear-btn');
  if (clearBtn) {
      clearBtn.addEventListener('click', resetConverter);
  }
  
  // Process button
  const processBtn = document.getElementById('converter-process-btn');
  if (processBtn) {
      processBtn.addEventListener('click', processFiles);
  }
  
  // Reset button
  const resetBtn = document.getElementById('converter-reset-btn');
  if (resetBtn) {
      resetBtn.addEventListener('click', resetConverter);
  }
  
  // Download ZIP button
  const downloadZipBtn = document.getElementById('download-zip-btn');
  if (downloadZipBtn) {
      downloadZipBtn.addEventListener('click', downloadZip);
  }
  
  // Individual file download buttons
  const downloadFileBtns = document.querySelectorAll('.download-file-btn');
  downloadFileBtns.forEach(btn => {
      btn.addEventListener('click', function() {
          const key = this.getAttribute('data-key');
          downloadFile(key);
      });
  });
}