/**
 * Main Dashboard Logic
 * Enhanced version with improved error handling and file loading
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard
    initDashboard();
});

// Dashboard state
const dashboardState = {
    timeframe: 'all', // Default to 'all' in case config isn't loaded
    activeDashboard: 'executive',
    data: {
        yearlyData: {}, // Data organized by year
        multiYearData: null, // Processed multi-year data
    },
    selectedYears: [],
    isLoading: false,
    dataCache: {} // Cache for loaded CSV data
};

// Test function for data loading diagnostics
function testDataLoading() {
    console.log("🧪 TESTING DATA LOADING PROCESS 🧪");

    // List of important files to test
    const filesToTest = ['FB_Posts.csv', 'IG_Posts.csv', 'Email_Campaign_Performance.csv', 'YouTube_Age.csv'];

    // Test each file
    filesToTest.forEach(file => {
        console.log(`\n📋 Testing file: ${file}`);

        // Try different paths to find the file
        const paths = ['./data/', '/data/', '../data/'];

        paths.forEach(path => {
            const fullPath = path + file;
            console.log(`🔍 Trying path: ${fullPath}`);

            fetch(fullPath)
                .then(response => {
                    if (response.ok) {
                        console.log(`✅ Found file at ${fullPath} (status: ${response.status})`);
                        return response.text();
                    } else {
                        console.warn(`❌ File not found at ${fullPath} (status: ${response.status})`);
                        throw new Error(`File not found at ${fullPath}`);
                    }
                })
                .then(text => {
                    console.log(`📄 First 50 chars: ${text.substring(0, 50)}`);

                    // Try parsing a sample
                    try {
                        const sample = Papa.parse(text.substring(0, 1000), { header: true });
                        console.log(`📊 Parse sample success - headers:`, sample.meta.fields);
                    } catch (e) {
                        console.error(`❌ Parse error:`, e);
                    }
                })
                .catch(error => {
                    // Already logged above
                });
        });
    });

    console.log("\n🧪 TEST COMPLETE - Check console for results 🧪");
}

// Initialize dashboard
async function initDashboard() {
    try {
        console.log("🚀 Initializing Marketing Dashboard...");

        // Apply safer chart functions
        createSafeChartFunctions();

        // Setup event listeners
        setupEventListeners();

        // Load data with error handling
        try {
            await loadAllData();
        } catch (loadError) {
            console.error("Failed to load data:", loadError);
            showErrorMessage("Failed to load dashboard data. Check console for details and reload the page.", "error", false);
            setLoading(false);
            return; // Stop initialization if data loading fails
        }

        // Validate loaded data for required structure but don't create defaults
        validateDataStructure();

        // Check for data quality issues
        if (dashboardState.dataQualityIssues && dashboardState.dataQualityIssues.length > 0) {
            console.warn(`Found ${dashboardState.dataQualityIssues.length} data quality issues`);
            showDataQualityWarnings();
        }

        // Render the active dashboard
        renderActiveDashboard();

        // Add a status indicator for debugging if requested
        if (window.location.search.includes('debug=true')) {
            addStatusIndicator();
        }

        console.log("✅ Dashboard initialized successfully");
    } catch (error) {
        console.error("Critical error during dashboard initialization:", error);
        showErrorMessage("Critical error initializing dashboard: " + error.message, "error", false);
    }
}

// Set up event listeners
function setupEventListeners() {
    // Timeframe selector
    const timeframeSelector = document.getElementById('timeframe-selector');
    if (timeframeSelector) {
        try {
            timeframeSelector.value = DASHBOARD_CONFIG?.defaultTimeframe || '30d';
            dashboardState.timeframe = timeframeSelector.value;
        } catch (e) {
            console.warn('Could not set timeframe selector value:', e);
            // Default to 30 days if config is missing
            timeframeSelector.value = '30d';
            dashboardState.timeframe = '30d';
        }

        timeframeSelector.addEventListener('change', async function () {
            dashboardState.timeframe = this.value;

            // If year-based timeframe, update selected years
            if (this.value === 'yoy' || this.value === '5y') {
                await loadYearlyData();
            } else {
                await loadAllData();
            }

            renderActiveDashboard();
        });
    }

    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const dashboard = this.id.replace('nav-', '');
            setActiveDashboard(dashboard);
        });
    });
}

// Set active dashboard
function setActiveDashboard(dashboard) {
    // Update state
    dashboardState.activeDashboard = dashboard;

    // Update UI
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const btnDashboard = btn.id.replace('nav-', '');
        if (btnDashboard === dashboard) {
            btn.classList.remove('text-gray-500');
            btn.classList.add('border-b-2', 'border-blue-500', 'text-gray-900');
        } else {
            btn.classList.add('text-gray-500');
            btn.classList.remove('border-b-2', 'border-blue-500', 'text-gray-900');
        }
    });

    // Show relevant dashboard
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('hidden');
    });

    const dashboardElement = document.getElementById(`${dashboard}-dashboard`);
    if (dashboardElement) {
        dashboardElement.classList.remove('hidden');
    } else {
        console.warn(`Dashboard element "${dashboard}-dashboard" not found`);
    }

    // Render the active dashboard
    renderActiveDashboard();
}


/**
 * Load a CSV file and parse it with PapaParse
 * Enhanced with better error handling and encoding fixes
 * @param {string} fileName - The name of the CSV file to load
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed CSV data
 */
async function loadCSV(fileName, options = {}) {
    // Add debug logging
    console.log(`⏳ Attempting to load ${fileName}...`);

    // Check if we already have this in the cache
    if (dashboardState.dataCache[fileName]) {
        console.log(`✅ Retrieved ${fileName} from cache`);
        return dashboardState.dataCache[fileName];
    }

    // Get repository name for GitHub Pages
    const pathParts = window.location.pathname.split('/').filter(part => part);
    const repoName = pathParts.length > 0 ? pathParts[0] : '';
    const repoPath = repoName ? `/${repoName}` : '';

    // Log current path information
    console.log(`🔍 Current path info - Location: ${window.location.pathname}, Repo: ${repoName}`);

    // Try different paths
    const paths = [
        `./data/${fileName}`,
        `${repoPath}/data/${fileName}`,
        `/data/${fileName}`,
        `../data/${fileName}`
    ];

    console.log(`🔍 Will try paths: ${JSON.stringify(paths)}`);

    let response = null;
    let data = null;

    for (const path of paths) {
        try {
            console.log(`🔄 Fetching from: ${path}`);
            response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                console.log(`📄 First 100 chars of ${fileName}: ${text.substring(0, 100)}`);

                // Use the improved parseCSV for better error handling
                data = await parseCSV(text, options);
                console.log(`✅ Successfully loaded from: ${path}`);

                // Cache the data for future use
                dashboardState.dataCache[fileName] = data;

                // Log a sample of the parsed data
                if (data && data.length > 0) {
                    console.log(`📊 Sample data from ${fileName}:`, data[0]);
                }

                return data;
            } else {
                console.warn(`⚠️ Failed with status ${response.status} from ${path}`);
            }
        } catch (error) {
            console.warn(`⚠️ Error fetching from ${path}:`, error);
        }
    }

    // JSON fallback
    console.log(`❌ Failed to load ${fileName} from any path, trying JSON fallback`);

    // Try JSON fallback
    try {
        const jsonFileName = fileName.replace('.csv', '.json');
        for (const path of [
            `./data/${jsonFileName}`,
            `${repoPath}/data/${jsonFileName}`,
            `/data/${jsonFileName}`,
            `../data/${jsonFileName}`
        ]) {
            try {
                console.log(`🔄 Trying JSON fallback: ${path}`);
                const jsonResponse = await fetch(path);
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();
                    console.log(`✅ Successfully loaded JSON fallback from: ${path}`);
                    dashboardState.dataCache[fileName] = jsonData;
                    return jsonData;
                }
            } catch (fallbackError) {
                console.warn(`⚠️ Error with JSON fallback from ${path}:`, fallbackError);
            }
        }
    } catch (jsonError) {
        console.error('❌ JSON fallback failed:', jsonError);
    }

    // Create and return empty data if all attempts fail
    console.error(`❌ Could not load ${fileName} - returning empty data`);
    return [];
}

/**
 * Parse CSV text using PapaParse with improved encoding handling and error recovery
 * @param {string} csvText - The CSV text to parse
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed CSV data
 */
function parseCSV(csvText, options = {}) {
    console.log(`🔄 Parsing CSV text of length ${csvText.length}...`);

    // Handle empty content
    if (!csvText || csvText.trim() === '') {
        console.warn('Empty CSV content provided');
        return Promise.resolve([]);
    }

    // Fix encoding issues - remove BOM and handle Windows encoding
    let cleanedText = csvText;
    let cleanupOperations = [];

    // Check for Byte Order Mark (BOM) and special separators
    if (csvText.startsWith('\uFEFF') ||
        csvText.startsWith('ï»¿') ||
        csvText.includes('��')) {

        // First, try to fix the BOM
        const originalLength = cleanedText.length;
        cleanedText = cleanedText.replace(/^\uFEFF|^ï»¿|��/g, '');
        if (cleanedText.length < originalLength) {
            cleanupOperations.push('Removed BOM characters');
        }

        // Handle 'sep=' directive common in Windows CSVs
        if (cleanedText.includes('sep=,')) {
            const sepIndex = cleanedText.indexOf('sep=,');
            const newlineAfterSep = cleanedText.indexOf('\n', sepIndex);
            if (newlineAfterSep > -1) {
                cleanedText = cleanedText.substring(newlineAfterSep + 1);
                cleanupOperations.push('Removed separator declaration');
            }
        }

        if (cleanupOperations.length > 0) {
            console.log(`🔧 ${cleanupOperations.join(', ')}`);
        }
    }

    // Handle Google Analytics comment headers
    if (cleanedText.startsWith('# ----') || cleanedText.startsWith('#')) {
        // Some GA files have comments at the top
        const lines = cleanedText.split('\n');
        let dataStart = -1;

        // Find the first non-comment line
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i].startsWith('#')) {
                dataStart = i;
                break;
            }
        }

        if (dataStart > 0) {
            cleanedText = lines.slice(dataStart).join('\n');
            console.log('🔧 Removed Google Analytics comment headers');
        }
    }

    // Handle special characters in content
    cleanedText = cleanedText.replace(/\u0000/g, '');  // Remove NUL characters

    // Handle weird quotes by replacing them with standard quotes
    cleanedText = cleanedText.replace(/[\u201C\u201D]/g, '"');

    return new Promise((resolve, reject) => {
        Papa.parse(cleanedText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            delimitersToGuess: [',', '\t', '|', ';'],  // Try to guess delimiter if not clear
            ...options,
            complete: (results) => {
                console.log(`✅ CSV parsing complete - Found ${results.data.length} rows`);

                // Log errors but continue processing
                if (results.errors && results.errors.length > 0) {
                    console.warn(`⚠️ CSV parsing had ${results.errors.length} errors:`, results.errors);

                    // Add more detailed error reporting
                    const errorSummary = {};
                    results.errors.forEach(error => {
                        const type = error.type || 'Unknown';
                        errorSummary[type] = (errorSummary[type] || 0) + 1;
                    });

                    console.warn('Error breakdown by type:', errorSummary);
                }

                // Clean the data - remove empty rows and improperly parsed ones
                const cleanData = results.data.filter(row => {
                    // Skip if not an object
                    if (!row || typeof row !== 'object') return false;

                    // Check if the row has at least one non-empty value
                    return Object.values(row).some(val =>
                        val !== null && val !== undefined && val !== '');
                });

                // Report any rows that were removed
                if (cleanData.length < results.data.length) {
                    console.log(`🔧 Removed ${results.data.length - cleanData.length} empty or invalid rows`);
                }

                // Sanitize field values to remove any NaN or Infinity
                const sanitizedData = cleanData.map(row => {
                    const cleanRow = {};

                    Object.entries(row).forEach(([key, value]) => {
                        // Check for NaN, Infinity or extreme values
                        if (typeof value === 'number' && (!isFinite(value) || Math.abs(value) > 1e15)) {
                            cleanRow[key] = null;
                        } else {
                            cleanRow[key] = value;
                        }
                    });

                    return cleanRow;
                });

                resolve(sanitizedData);
            },
            error: (error) => {
                console.error('❌ Error parsing CSV:', error);
                // Instead of rejecting, resolve with empty array to prevent dashboard failure
                console.warn('⚠️ Returning empty array due to parsing error');
                resolve([]);
            }
        });
    });
}

/**
 * Special function to handle Google Analytics CSV files with improved compatibility
 * Replace the existing function in dashboard.js
 */
async function loadGoogleAnalyticsCSV(fileName, options = {}) {
    console.log(`🔍 Loading Google Analytics file: ${fileName}`);

    try {
        // Check cache first
        if (dashboardState.dataCache[fileName]) {
            return dashboardState.dataCache[fileName];
        }

        // Try the standard paths
        const paths = [
            `./data/${fileName}`,
            `/data/${fileName}`,
            `../data/${fileName}`
        ];

        let response;
        let successfulPath = null;

        for (const path of paths) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    successfulPath = path;
                    break;
                }
            } catch (e) {
                console.warn(`Failed to fetch from ${path}:`, e);
            }
        }

        if (!response || !response.ok) {
            console.error(`Could not fetch ${fileName} from any path`);
            return [];
        }

        console.log(`✅ Successfully loaded from: ${successfulPath}`);

        // Get the raw text
        const text = await response.text();

        // For Google Analytics files, we need special preprocessing
        const lines = text.split('\n');

        // Find where the actual data starts (after # comments)
        let dataStartIndex = 0;
        while (dataStartIndex < lines.length && lines[dataStartIndex].startsWith('#')) {
            dataStartIndex++;
        }

        if (dataStartIndex >= lines.length) {
            console.warn('No valid data found in GA file (all lines are comments)');
            return [];
        }

        // Extract headers and data
        const headers = lines[dataStartIndex].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataLines = lines.slice(dataStartIndex + 1);

        // Convert to CSV format with proper headers
        const properCsv = [
            headers.join(','),
            ...dataLines
        ].join('\n');

        // Parse with modified options
        const parsedData = await parseCSV(properCsv, {
            ...options,
            header: true,
            skipEmptyLines: true
        });

        // Cache the results
        dashboardState.dataCache[fileName] = parsedData;

        return parsedData;
    } catch (error) {
        console.error(`Error processing Google Analytics file ${fileName}:`, error);
        return [];
    }
}

/**
 * Improved error handling for loadCSV
 * This function now tracks successful paths to prioritize them in future loads
 */
const successfulPaths = new Map(); // Track which paths worked for which files

async function loadCSV(fileName, options = {}) {
    // Add debug logging
    console.log(`⏳ Attempting to load ${fileName}...`);

    // Check if we already have this in the cache
    if (dashboardState.dataCache[fileName]) {
        console.log(`✅ Retrieved ${fileName} from cache`);
        return dashboardState.dataCache[fileName];
    }

    // Check if we know a working path for this file from previous loads
    if (successfulPaths.has(fileName)) {
        try {
            const knownPath = successfulPaths.get(fileName);
            console.log(`🔄 Trying known working path: ${knownPath}`);
            const response = await fetch(knownPath);

            if (response.ok) {
                const text = await response.text();
                console.log(`📄 First 100 chars of ${fileName}: ${text.substring(0, 100)}`);

                // Use the improved parseCSV for better error handling
                const data = await parseCSV(text, options);
                console.log(`✅ Successfully loaded from known path: ${knownPath}`);

                // Cache the data for future use
                dashboardState.dataCache[fileName] = data;

                // Log a sample of the parsed data
                if (data && data.length > 0) {
                    console.log(`📊 Sample data from ${fileName}:`, data[0]);
                }

                return data;
            }
        } catch (error) {
            console.warn(`⚠️ Known path no longer working for ${fileName}. Trying alternatives...`);
            // Continue to try other paths if the known path fails
        }
    }

    // Get repository name for GitHub Pages
    const pathParts = window.location.pathname.split('/').filter(part => part);
    const repoName = pathParts.length > 0 ? pathParts[0] : '';
    const repoPath = repoName ? `/${repoName}` : '';

    // Log current path information
    console.log(`🔍 Current path info - Location: ${window.location.pathname}, Repo: ${repoName}`);

    // Prioritize the "./data/" path which seems to be working
    const paths = [
        `./data/${fileName}`,  // This path works most consistently based on logs
        `${repoPath}/data/${fileName}`,
        `/data/${fileName}`,
        `../data/${fileName}`
    ];

    console.log(`🔍 Will try paths: ${JSON.stringify(paths)}`);

    let response = null;
    let data = null;
    let workingPath = null;

    for (const path of paths) {
        try {
            console.log(`🔄 Fetching from: ${path}`);
            response = await fetch(path);
            if (response.ok) {
                workingPath = path;
                const text = await response.text();
                console.log(`📄 First 100 chars of ${fileName}: ${text.substring(0, 100)}`);

                // Use the improved parseCSV for better error handling
                data = await parseCSV(text, options);
                console.log(`✅ Successfully loaded from: ${path}`);

                // Remember this path worked for future loads
                successfulPaths.set(fileName, path);

                // Cache the data for future use
                dashboardState.dataCache[fileName] = data;

                // Log a sample of the parsed data
                if (data && data.length > 0) {
                    console.log(`📊 Sample data from ${fileName}:`, data[0]);
                }

                return data;
            } else {
                console.warn(`⚠️ Failed with status ${response.status} from ${path}`);
            }
        } catch (error) {
            console.warn(`⚠️ Error fetching from ${path}:`, error);
        }
    }

    // JSON fallback with simpler path strategy
    console.log(`❌ Failed to load ${fileName} from any path, trying JSON fallback`);

    // Try JSON fallback
    try {
        const jsonFileName = fileName.replace('.csv', '.json');
        // Only try the most likely paths for JSON
        for (const path of [
            `./data/${jsonFileName}`,
            `${repoPath}/data/${jsonFileName}`
        ]) {
            try {
                console.log(`🔄 Trying JSON fallback: ${path}`);
                const jsonResponse = await fetch(path);
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();
                    console.log(`✅ Successfully loaded JSON fallback from: ${path}`);
                    dashboardState.dataCache[fileName] = jsonData;
                    return jsonData;
                }
            } catch (fallbackError) {
                console.warn(`⚠️ Error with JSON fallback from ${path}:`, fallbackError);
            }
        }
    } catch (jsonError) {
        console.error('❌ JSON fallback failed:', jsonError);
    }

    // Create and return empty data if all attempts fail
    console.error(`❌ Could not load ${fileName} - returning empty data`);
    return [];
}

/**
 * Special function to handle Google Analytics CSV files
 * These files have special headers and comment lines
 * @param {string} fileName - The Google Analytics CSV file to load
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed Google Analytics data
 */
async function loadGoogleAnalyticsCSV(fileName, options = {}) {
    console.log(`🔍 Loading Google Analytics file: ${fileName}`);

    try {
        // Check cache first
        if (dashboardState.dataCache[fileName]) {
            return dashboardState.dataCache[fileName];
        }

        // Try the standard paths
        const paths = [
            `./data/${fileName}`,
            `/data/${fileName}`,
            `../data/${fileName}`
        ];

        let response;
        for (const path of paths) {
            try {
                response = await fetch(path);
                if (response.ok) {
                    break;
                }
            } catch (e) {
                console.warn(`Failed to fetch from ${path}:`, e);
            }
        }

        if (!response || !response.ok) {
            console.error(`Could not fetch ${fileName} from any path`);
            return [];
        }

        // Get the raw text
        const text = await response.text();

        // Skip all lines starting with #
        const lines = text.split('\n');
        const dataStartIndex = lines.findIndex(line => !line.trim().startsWith('#'));

        if (dataStartIndex === -1) {
            console.warn('No valid data found in GA file');
            return [];
        }

        // Extract headers and data
        const headers = lines[dataStartIndex].split(',').map(h => h.trim());
        const dataLines = lines.slice(dataStartIndex + 1);

        // Convert to CSV format with proper headers
        const properCsv = [
            headers.join(','),
            ...dataLines
        ].join('\n');

        // Parse with modified options
        const parsedData = await parseCSV(properCsv, {
            ...options,
            header: true,
            skipEmptyLines: true
        });

        // Cache the results
        dashboardState.dataCache[fileName] = parsedData;

        return parsedData;
    } catch (error) {
        console.error(`Error processing Google Analytics file ${fileName}:`, error);
        return [];
    }
}

// Load all data
async function loadAllData() {
    setLoading(true);

    try {
        // Determine current year based on timeframe
        const currentYear = new Date().getFullYear().toString();

        // If timeframe is year-over-year or 5-year
        if (dashboardState.timeframe === 'yoy' || dashboardState.timeframe === '5y') {
            await loadYearlyData();
        } else {
            // Try loading with CSV files
            try {
                // Load Facebook data
                const fbPosts = await loadCSV('FB_Posts.csv');
                const fbVideos = await loadCSV('FB_Videos.csv');
                const fbReach = await loadCSV('FB_Reach.csv');
                const fbInteractions = await loadCSV('FB_Interactions.csv');

                // Process Facebook data
                dashboardState.data.facebook = processFacebookData(
                    convertArrayToCSV(fbPosts),
                    {
                        postsData: convertArrayToCSV(fbPosts),
                        reachData: convertArrayToCSV(fbReach),
                        interactionsData: convertArrayToCSV(fbInteractions)
                    }
                );

                // Load Instagram data
                const igPosts = await loadCSV('IG_Posts.csv');
                const igReach = await loadCSV('IG_Reach.csv');
                const igInteractions = await loadCSV('IG_Interactions.csv');

                // Process Instagram data
                dashboardState.data.instagram = processInstagramData(
                    convertArrayToCSV(igPosts),
                    {
                        reachData: convertArrayToCSV(igReach),
                        interactionsData: convertArrayToCSV(igInteractions)
                    }
                );

                // Load Email data
                const emailData = await loadCSV('Email_Campaign_Performance.csv');

                // Process Email data
                dashboardState.data.email = processEmailData(convertArrayToCSV(emailData));

                // Try loading YouTube data with fallbacks
                try {
                    // First try to load data normally
                    const ytAge = await loadCSV('YouTube_Age.csv');
                    const ytGender = await loadCSV('YouTube_Gender.csv');
                    const ytGeography = await loadCSV('YouTube_Geography.csv');
                    const ytSubscription = await loadCSV('YouTube_Subscription_Status.csv');
                    const ytContent = await loadCSV('YouTube_Content.csv');
                    const ytCities = await loadCSV('YouTube_Cities.csv');

                    // Process YouTube data
                    dashboardState.data.youtube = processYouTubeData(
                        convertArrayToCSV(ytAge),
                        convertArrayToCSV(ytGender),
                        convertArrayToCSV(ytGeography),
                        convertArrayToCSV(ytSubscription),
                        convertArrayToCSV(ytContent),
                        { citiesData: convertArrayToCSV(ytCities) }
                    );
                } catch (error) {
                    console.error('Error loading YouTube data:', error);
                    // Create minimal default YouTube data structure
                    dashboardState.data.youtube = createDefaultYouTubeData();
                }

                // Load Google Analytics data with special handling
                try {
                    // Use special loader for GA files
                    const gaDemographics = await loadGoogleAnalyticsCSV('GA_Demographics.csv');
                    const gaPages = await loadGoogleAnalyticsCSV('GA_Pages_And_Screens.csv');
                    const gaTraffic = await loadGoogleAnalyticsCSV('GA_Traffic_Acquisition.csv');
                    const gaUTMs = await loadGoogleAnalyticsCSV('GA_UTMs.csv');

                    // Process Google Analytics data
                    dashboardState.data.googleAnalytics = processGoogleAnalyticsData(
                        convertArrayToCSV(gaDemographics),
                        convertArrayToCSV(gaPages),
                        convertArrayToCSV(gaTraffic),
                        convertArrayToCSV(gaUTMs)
                    );
                } catch (gaError) {
                    console.error('Error loading Google Analytics data:', gaError);
                    dashboardState.data.googleAnalytics = createDefaultGoogleAnalyticsData();
                }

                // Generate cross-channel data
                dashboardState.data.crossChannel = generateCrossChannelData(
                    dashboardState.data.facebook,
                    dashboardState.data.instagram,
                    dashboardState.data.youtube,
                    dashboardState.data.email,
                    dashboardState.data.googleAnalytics
                );
            } catch (csvError) {
                console.warn('CSV loading failed, trying direct JSON loading:', csvError);

                // Attempt to load JSON files directly as fallback
                try {
                    // Try loading from pre-processed JSON files
                    dashboardState.data.facebook = await loadJSON('facebook_data.json');
                    dashboardState.data.instagram = await loadJSON('instagram_data.json');
                    dashboardState.data.email = await loadJSON('email_data.json');
                    dashboardState.data.youtube = await loadJSON('youtube_data.json');
                    dashboardState.data.googleAnalytics = await loadJSON('google_analytics_data.json');
                    dashboardState.data.crossChannel = await loadJSON('cross_channel_data.json');
                } catch (jsonError) {
                    console.error('Both CSV and JSON loading failed:', jsonError);
                    console.log('Creating default data instead');

                    // Create default data when all else fails
                    dashboardState.data.facebook = createDefaultFacebookData();
                    dashboardState.data.instagram = createDefaultInstagramData();
                    dashboardState.data.email = createDefaultEmailData();
                    dashboardState.data.youtube = createDefaultYouTubeData();
                    dashboardState.data.googleAnalytics = createDefaultGoogleAnalyticsData();
                    dashboardState.data.crossChannel = createDefaultCrossChannelData();
                }
            }

            // Add to yearly data for current year
            if (!dashboardState.data.yearlyData) {
                dashboardState.data.yearlyData = {};
            }

            dashboardState.data.yearlyData[currentYear] = {
                facebook: dashboardState.data.facebook,
                instagram: dashboardState.data.instagram,
                youtube: dashboardState.data.youtube,
                email: dashboardState.data.email,
                googleAnalytics: dashboardState.data.googleAnalytics,
                crossChannel: dashboardState.data.crossChannel
            };
        }

        // Update last updated timestamp
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            if (dashboardState.data.crossChannel && dashboardState.data.crossChannel.meta) {
                const lastUpdated = new Date(dashboardState.data.crossChannel.meta.last_updated);
                lastUpdatedEl.textContent = lastUpdated.toLocaleString();
            } else {
                lastUpdatedEl.textContent = new Date().toLocaleString();
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading dashboard data. Please check the console for details.');
    }

    setLoading(false);
}

/**
 * Load JSON file directly
 * @param {string} fileName - The JSON file to load
 * @returns {Promise<Object>} - Parsed JSON data
 */
async function loadJSON(fileName) {
    // Get repository name for GitHub Pages
    const pathParts = window.location.pathname.split('/').filter(part => part);
    const repoName = pathParts.length > 0 ? pathParts[0] : '';
    const repoPath = repoName ? `/${repoName}` : '';

    // Try different paths
    const paths = [
        `./data/${fileName}`,
        `${repoPath}/data/${fileName}`,
        `/data/${fileName}`,
        `../data/${fileName}`
    ];

    for (const path of paths) {
        try {
            console.log(`🔄 Trying to fetch JSON from: ${path}`);
            const response = await fetch(path);
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Successfully loaded JSON from: ${path}`);
                return data;
            }
        } catch (error) {
            console.warn(`⚠️ Error fetching JSON from ${path}:`, error);
        }
    }

    throw new Error(`Could not load JSON file: ${fileName}`);
}

/**
 * Convert an array of objects to CSV string
 * This helps reuse existing processing functions that expect CSV strings
 * @param {Array} array - Array of objects
 * @returns {string} - CSV string
 */
function convertArrayToCSV(array) {
    if (!array || array.length === 0) return '';

    // Get headers from the first object
    const headers = Object.keys(array[0]);

    // Create CSV header row
    let csv = headers.join(',') + '\n';

    // Add data rows
    array.forEach(obj => {
        const row = headers.map(header => {
            const value = obj[header];

            // Handle different value types
            if (value === null || value === undefined) {
                return '';
            } else if (typeof value === 'string') {
                // Escape quotes and wrap in quotes if it contains comma or quotes
                if (value.includes(',') || value.includes('"')) {
                    return `"${value.replace(/"/g, '""')}"`;
                } else {
                    return value;
                }
            } else {
                return value.toString();
            }
        });

        csv += row.join(',') + '\n';
    });

    return csv;
}

// Load data for multiple years
async function loadYearlyData() {
    setLoading(true);

    try {
        // Initialize yearly data if not exists
        if (!dashboardState.data.yearlyData) {
            dashboardState.data.yearlyData = {};
        }

        // Determine years to load based on timeframe
        let years = [];
        const currentYear = new Date().getFullYear();

        if (dashboardState.timeframe === 'yoy') {
            // Last two years for year-over-year
            years = [(currentYear - 1).toString(), currentYear.toString()];
        } else if (dashboardState.timeframe === '5y') {
            // Last 5 years for multi-year trends
            for (let i = 0; i < 5; i++) {
                years.push((currentYear - 4 + i).toString());
            }
        }

        // Update selected years
        dashboardState.selectedYears = years;

        // For each year, either load real data or generate synthetic data
        for (const year of years) {
            if (!dashboardState.data.yearlyData[year]) {
                try {
                    // Attempt to load year_data.json first - this is the most efficient approach
                    let yearData = null;
                    try {
                        yearData = await loadJSON(`${year}/year_data.json`);
                        console.log(`Loaded year_data.json for ${year}`);
                        dashboardState.data.yearlyData[year] = yearData;
                        continue; // Skip to next year if successful
                    } catch (jsonError) {
                        console.log(`No year_data.json for ${year}, trying individual files`);
                    }

                    // Try only one file per platform to reduce network traffic
                    const fbPosts = await loadCSV(`${year}/FB_Posts.csv`).catch(() => loadCSV('FB_Posts.csv'));
                    const igPosts = await loadCSV(`${year}/IG_Posts.csv`).catch(() => loadCSV('IG_Posts.csv'));
                    const emailCsv = await loadCSV(`${year}/Email_Campaign_Performance.csv`).catch(() => loadCSV('Email_Campaign_Performance.csv'));
                    const ytAge = await loadCSV(`${year}/YouTube_Age.csv`).catch(() => loadCSV('YouTube_Age.csv'));
                    const gaTraffic = await loadCSV(`${year}/GA_Traffic_Acquisition.csv`).catch(() => loadCSV('GA_Traffic_Acquisition.csv'));

                    // Check if we got actual year data or current data
                    const isHistoricalFbData = fbPosts && fbPosts.some(item => item.year === parseInt(year));
                    const isHistoricalIgData = igPosts && igPosts.some(item => item.year === parseInt(year));
                    const isHistoricalEmailData = emailCsv && emailCsv.some(item => item.year === parseInt(year));

                    // If no actual historical data found, generate synthetic data
                    if (!isHistoricalFbData && !isHistoricalIgData && !isHistoricalEmailData) {
                        console.log(`Generating synthetic data for ${year}`);

                        // Scale factor - older years have progressively less engagement (15% less per year)
                        const yearDiff = currentYear - parseInt(year);
                        const scaleFactor = Math.pow(0.85, yearDiff);

                        // Create a synthetic version of data scaled by year
                        const syntheticData = {};

                        // Use current year data as base if available, otherwise use defaults
                        const baseData = {
                            facebook: dashboardState.data.facebook || createDefaultFacebookData(),
                            instagram: dashboardState.data.instagram || createDefaultInstagramData(),
                            youtube: dashboardState.data.youtube || createDefaultYouTubeData(),
                            email: dashboardState.data.email || createDefaultEmailData(),
                            googleAnalytics: dashboardState.data.googleAnalytics || createDefaultGoogleAnalyticsData(),
                            crossChannel: dashboardState.data.crossChannel || createDefaultCrossChannelData()
                        };

                        // Clone and scale down values
                        syntheticData.facebook = scaleMetrics(baseData.facebook, scaleFactor);
                        syntheticData.instagram = scaleMetrics(baseData.instagram, scaleFactor);
                        syntheticData.youtube = scaleMetrics(baseData.youtube, scaleFactor);
                        syntheticData.email = scaleMetrics(baseData.email, scaleFactor);
                        syntheticData.googleAnalytics = scaleMetrics(baseData.googleAnalytics, scaleFactor);

                        // Generate cross-channel data based on synthetic platform data
                        syntheticData.crossChannel = generateCrossChannelData(
                            syntheticData.facebook,
                            syntheticData.instagram,
                            syntheticData.youtube,
                            syntheticData.email,
                            syntheticData.googleAnalytics,
                            { year: parseInt(year) }
                        );

                        // Store synthetic data for this year
                        dashboardState.data.yearlyData[year] = syntheticData;
                    } else {
                        // Process whatever real data we found
                        console.log(`Processing available data for ${year}`);

                        // Process each platform with whatever data we have
                        const facebookData = isHistoricalFbData ?
                            processFacebookData(convertArrayToCSV(fbPosts), { year: parseInt(year) }) :
                            scaleMetrics(dashboardState.data.facebook || createDefaultFacebookData(), 0.8);

                        const instagramData = isHistoricalIgData ?
                            processInstagramData(convertArrayToCSV(igPosts), { year: parseInt(year) }) :
                            scaleMetrics(dashboardState.data.instagram || createDefaultInstagramData(), 0.8);

                        const emailData = isHistoricalEmailData ?
                            processEmailData(convertArrayToCSV(emailCsv), { year: parseInt(year) }) :
                            scaleMetrics(dashboardState.data.email || createDefaultEmailData(), 0.8);

                        // Use default models for YouTube and GA if no historical data
                        const youtubeData = {
                            totalViews: 90000 * Math.pow(0.8, currentYear - parseInt(year)),
                            totalWatchTime: 6500 * Math.pow(0.8, currentYear - parseInt(year)),
                            averageViewDuration: '4:10',
                            performance_trend: generateYouTubePerformanceTrend({ Views: 90000 }, year)
                        };

                        const googleAnalyticsData = {
                            totalUsers: 120000 * Math.pow(0.8, currentYear - parseInt(year)),
                            engagementRate: 65.5,
                            performance_trend: generateGAPerformanceTrend(parseInt(year))
                        };

                        // Generate cross-channel data
                        const crossChannelData = generateCrossChannelData(
                            facebookData,
                            instagramData,
                            youtubeData,
                            emailData,
                            googleAnalyticsData,
                            { year: parseInt(year) }
                        );

                        // Store data for this year
                        dashboardState.data.yearlyData[year] = {
                            facebook: facebookData,
                            instagram: instagramData,
                            youtube: youtubeData,
                            email: emailData,
                            googleAnalytics: googleAnalyticsData,
                            crossChannel: crossChannelData
                        };
                    }
                } catch (error) {
                    console.warn(`Could not generate complete data for year ${year}. Using default values.`);

                    // Create minimal placeholder data with reasonable values
                    dashboardState.data.yearlyData[year] = createDefaultYearData(year, currentYear);
                }
            }
        }

        // Process multi-year data for comparison
        dashboardState.data.multiYearData = processMultiYearData(dashboardState.data.yearlyData);

        // Set currently active data to most recent year
        const mostRecentYear = years[years.length - 1];
        if (dashboardState.data.yearlyData[mostRecentYear]) {
            dashboardState.data.facebook = dashboardState.data.yearlyData[mostRecentYear].facebook;
            dashboardState.data.instagram = dashboardState.data.yearlyData[mostRecentYear].instagram;
            dashboardState.data.youtube = dashboardState.data.yearlyData[mostRecentYear].youtube;
            dashboardState.data.email = dashboardState.data.yearlyData[mostRecentYear].email;
            dashboardState.data.googleAnalytics = dashboardState.data.yearlyData[mostRecentYear].googleAnalytics;
            dashboardState.data.crossChannel = dashboardState.data.yearlyData[mostRecentYear].crossChannel;
        }

    } catch (error) {
        console.error('Error loading yearly data:', error);
    }

    setLoading(false);
}

/**
 * Validate loaded data and create defaults where needed
 * This ensures the dashboard always has something to show
 */
function validateDataStructure() {
    // Initialize data quality issues tracker if it doesn't exist
    if (!dashboardState.dataQualityIssues) {
        dashboardState.dataQualityIssues = [];
    }

    // Check if we have the minimum required data structures
    // Facebook data
    if (!dashboardState.data.facebook || typeof dashboardState.data.facebook !== 'object') {
        console.error('❌ Facebook data is missing or invalid');
        dashboardState.dataQualityIssues.push({
            metric: 'Facebook Data',
            issue: 'Missing or invalid data structure',
            severity: 'high'
        });
    }

    // Instagram data
    if (!dashboardState.data.instagram || typeof dashboardState.data.instagram !== 'object') {
        console.error('❌ Instagram data is missing or invalid');
        dashboardState.dataQualityIssues.push({
            metric: 'Instagram Data',
            issue: 'Missing or invalid data structure',
            severity: 'high'
        });
    }

    // Email data
    if (!dashboardState.data.email || typeof dashboardState.data.email !== 'object') {
        console.error('❌ Email data is missing or invalid');
        dashboardState.dataQualityIssues.push({
            metric: 'Email Data',
            issue: 'Missing or invalid data structure',
            severity: 'high'
        });
    }

    // YouTube data
    if (!dashboardState.data.youtube || typeof dashboardState.data.youtube !== 'object') {
        console.error('❌ YouTube data is missing or invalid');
        dashboardState.dataQualityIssues.push({
            metric: 'YouTube Data',
            issue: 'Missing or invalid data structure',
            severity: 'high'
        });
    }

    // Google Analytics data
    if (!dashboardState.data.googleAnalytics || typeof dashboardState.data.googleAnalytics !== 'object') {
        console.error('❌ Google Analytics data is missing or invalid');
        dashboardState.dataQualityIssues.push({
            metric: 'Google Analytics Data',
            issue: 'Missing or invalid data structure',
            severity: 'high'
        });
    }

    // Cross-channel data
    if (!dashboardState.data.crossChannel || typeof dashboardState.data.crossChannel !== 'object') {
        console.error('❌ Cross-channel data is missing or invalid');
        dashboardState.dataQualityIssues.push({
            metric: 'Cross-Channel Data',
            issue: 'Missing or invalid data structure',
            severity: 'high'
        });
    }

    // Check for realistic values but don't create defaults
    checkMetricRealism();

    console.log('✅ Data structure validation complete');
}
/**
 * Check for unrealistic or invalid metric values
 * Flags problematic values and adds them to data quality issues
 */
function checkMetricRealism() {
    // Reasonable threshold values
    const MAX_REASONABLE_REACH = 1000000000; // 1 billion
    const MAX_REASONABLE_ENGAGEMENT = 100000000; // 100 million
    const MAX_REASONABLE_ENGAGEMENT_RATE = 100; // 100%

    // Check reach value
    if (dashboardState.data.crossChannel?.reach?.total > MAX_REASONABLE_REACH) {
        console.error('⚠️ Unrealistic reach value detected:', dashboardState.data.crossChannel.reach.total);

        // Cap the value instead of nullifying it
        dashboardState.data.crossChannel.reach.total = MAX_REASONABLE_REACH;

        // Add to data quality issues
        dashboardState.dataQualityIssues.push({
            metric: 'Total Reach',
            issue: 'Unrealistic value detected and capped at 1B',
            severity: 'high'
        });
    }

    // Check engagement value
    if (dashboardState.data.crossChannel?.engagement?.total > MAX_REASONABLE_ENGAGEMENT) {
        console.error('⚠️ Unrealistic engagement value detected:', dashboardState.data.crossChannel.engagement.total);

        // Cap the value instead of nullifying it
        dashboardState.data.crossChannel.engagement.total = MAX_REASONABLE_ENGAGEMENT;

        // Add to data quality issues
        dashboardState.dataQualityIssues.push({
            metric: 'Total Engagement',
            issue: 'Unrealistic value detected and capped at 100M',
            severity: 'high'
        });
    }

    // Check engagement rate
    if (dashboardState.data.crossChannel?.engagement_rate?.overall > MAX_REASONABLE_ENGAGEMENT_RATE) {
        console.error('⚠️ Unrealistic engagement rate detected:', dashboardState.data.crossChannel.engagement_rate.overall);

        // Cap the value instead of nullifying it
        dashboardState.data.crossChannel.engagement_rate.overall = MAX_REASONABLE_ENGAGEMENT_RATE;

        // Add to data quality issues
        dashboardState.dataQualityIssues.push({
            metric: 'Engagement Rate',
            issue: 'Unrealistic value detected (>100%) and capped',
            severity: 'high'
        });
    }

    // Check performance trend values in crossChannel data
    if (dashboardState.data.crossChannel?.performance_trend) {
        dashboardState.data.crossChannel.performance_trend.forEach(item => {
            ['facebook', 'instagram', 'youtube', 'email'].forEach(platform => {
                if (item[platform] && item[platform] > MAX_REASONABLE_REACH) {
                    console.warn(`⚠️ Unrealistic ${platform} value in month ${item.month}:`, item[platform]);
                    // Cap the value instead of nullifying it
                    item[platform] = MAX_REASONABLE_REACH;
                }
            });
        });
    }

    // Additional platform-specific checks
    if (dashboardState.data.facebook?.reach > MAX_REASONABLE_REACH) {
        dashboardState.data.facebook.reach = MAX_REASONABLE_REACH;
        dashboardState.dataQualityIssues.push({
            metric: 'Facebook Reach',
            issue: 'Unrealistic value detected and capped',
            severity: 'medium'
        });
    }

    if (dashboardState.data.instagram?.reach > MAX_REASONABLE_REACH) {
        dashboardState.data.instagram.reach = MAX_REASONABLE_REACH;
        dashboardState.dataQualityIssues.push({
            metric: 'Instagram Reach',
            issue: 'Unrealistic value detected and capped',
            severity: 'medium'
        });
    }

    if (dashboardState.data.youtube?.totalViews > MAX_REASONABLE_REACH) {
        dashboardState.data.youtube.totalViews = MAX_REASONABLE_REACH;
        dashboardState.dataQualityIssues.push({
            metric: 'YouTube Total Views',
            issue: 'Unrealistic value detected and capped',
            severity: 'medium'
        });
    }
}

/**
 * Ensure an object has all required properties, setting defaults if missing
 * @param {object} obj - Object to check
 * @param {object} defaults - Default values for missing properties
 */
function ensureRequiredProperties(obj, defaults) {
    if (!obj) return;

    for (const [key, defaultValue] of Object.entries(defaults)) {
        if (obj[key] === undefined) {
            obj[key] = defaultValue;
        } else if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
            // Recursively ensure properties for nested objects
            ensureRequiredProperties(obj[key], defaultValue);
        }
    }
}

/**
 * Helper function to scale metrics for synthetic data
 * @param {object} data - Original data object
 * @param {number} factor - Scaling factor (0.8 = 80% of original values)
 * @returns {object} - Scaled data object
 */
function scaleMetrics(data, factor) {
    if (!data) return {};

    // Create a deep copy to avoid modifying the original
    const scaledData = JSON.parse(JSON.stringify(data));

    // Scale numerical properties recursively
    const scaleValues = (obj) => {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'number') {
                // Scale numeric values
                obj[key] = Math.round(obj[key] * factor);
            } else if (Array.isArray(obj[key])) {
                // Handle arrays
                obj[key].forEach(item => {
                    if (typeof item === 'object') scaleValues(item);
                });
            } else if (typeof obj[key] === 'object') {
                // Recursively scale nested objects
                scaleValues(obj[key]);
            }
        });
    };

    scaleValues(scaledData);
    return scaledData;
}

/**
 * Create default Facebook data
 * @returns {object} - Default Facebook data
 */
function createDefaultFacebookData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
        reach: 150000,
        engagement: 15000,
        engagement_rate: 10,
        views: 85000,
        posts: [
            {
                title: 'Sample Facebook Post 1',
                date: new Date().toISOString(),
                reach: 5000,
                reactions: 120,
                comments: 45,
                shares: 28
            },
            {
                title: 'Sample Facebook Post 2',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                reach: 4500,
                reactions: 110,
                comments: 35,
                shares: 22
            },
            {
                title: 'Sample Facebook Post 3',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                reach: 4800,
                reactions: 130,
                comments: 40,
                shares: 25
            }
        ],
        performance_trend: months.map((month, index) => ({
            month,
            reach: 10000 + (index * 500),
            engagement: 1000 + (index * 50)
        }))
    };
}

/**
 * Create default Instagram data
 * @returns {object} - Default Instagram data
 */
function createDefaultInstagramData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
        reach: 120000,
        engagement: 12000,
        engagement_rate: 10,
        likes: 9500,
        posts: [
            {
                description: 'Sample Instagram Post 1',
                date: new Date().toISOString(),
                type: 'Image',
                reach: 4000,
                likes: 350,
                comments: 45,
                shares: 28,
                saves: 120
            },
            {
                description: 'Sample Instagram Post 2',
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'Video',
                reach: 5500,
                likes: 420,
                comments: 55,
                shares: 35,
                saves: 140
            },
            {
                description: 'Sample Instagram Post 3',
                date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                type: 'Carousel',
                reach: 3800,
                likes: 310,
                comments: 38,
                shares: 22,
                saves: 95
            }
        ],
        performance_trend: months.map((month, index) => ({
            month,
            reach: 8000 + (index * 400),
            engagement: 800 + (index * 40)
        }))
    };
}

/**
 * Create default Email data
 * @returns {object} - Default Email data
 */
function createDefaultEmailData() {
    return {
        campaigns: 25,
        totalSent: 50000,
        totalDelivered: 48000,
        totalOpens: 20000,
        totalClicks: 5000,
        openRate: 40,
        clickRate: 10,
        bounceRate: 4,
        unsubscribeRate: 0.5,
        campaigns: [
            {
                name: 'Sample Newsletter #1',
                sent: 5000,
                delivered: 4800,
                opened: 2000,
                clicked: 500,
                openRate: 41.7,
                clickRate: 25.0,
                bounceRate: 4.0,
                unsubscribeRate: 0.5
            },
            {
                name: 'Sample Newsletter #2',
                sent: 5200,
                delivered: 5000,
                opened: 2100,
                clicked: 520,
                openRate: 42.0,
                clickRate: 24.8,
                bounceRate: 3.8,
                unsubscribeRate: 0.4
            },
            {
                name: 'Product Announcement',
                sent: 4800,
                delivered: 4650,
                opened: 2300,
                clicked: 650,
                openRate: 49.5,
                clickRate: 28.3,
                bounceRate: 3.1,
                unsubscribeRate: 0.3
            }
        ],
        performance_trend: [
            { month: 'Jan', openRate: 38.5, clickRate: 9.2 },
            { month: 'Feb', openRate: 39.2, clickRate: 9.5 },
            { month: 'Mar', openRate: 39.8, clickRate: 9.7 },
            { month: 'Apr', openRate: 40.1, clickRate: 9.9 },
            { month: 'May', openRate: 40.5, clickRate: 10.0 },
            { month: 'Jun', openRate: 40.7, clickRate: 10.2 },
            { month: 'Jul', openRate: 41.0, clickRate: 10.3 },
            { month: 'Aug', openRate: 41.2, clickRate: 10.5 },
            { month: 'Sep', openRate: 41.5, clickRate: 10.6 },
            { month: 'Oct', openRate: 41.8, clickRate: 10.7 },
            { month: 'Nov', openRate: 42.0, clickRate: 10.8 },
            { month: 'Dec', openRate: 42.5, clickRate: 11.0 }
        ]
    };
}

/**
 * Create default YouTube data
 * @returns {object} - Default YouTube data
 */
function createDefaultYouTubeData() {
    return {
        totalViews: 100000,
        totalWatchTime: 7500,
        averageViewDuration: '4:30',
        demographics: {
            age: [
                { group: '13-17', viewPercentage: 5.2, watchTimePercentage: 4.0 },
                { group: '18-24', viewPercentage: 18.5, watchTimePercentage: 16.3 },
                { group: '25-34', viewPercentage: 32.1, watchTimePercentage: 33.5 },
                { group: '35-44', viewPercentage: 24.7, watchTimePercentage: 26.2 },
                { group: '45-54', viewPercentage: 12.3, watchTimePercentage: 13.0 },
                { group: '55-64', viewPercentage: 5.2, watchTimePercentage: 5.8 },
                { group: '65+', viewPercentage: 2.0, watchTimePercentage: 1.2 }
            ],
            gender: [
                { group: 'Female', viewPercentage: 45.2, watchTimePercentage: 43.8 },
                { group: 'Male', viewPercentage: 54.8, watchTimePercentage: 56.2 }
            ]
        },
        geography: [
            { country: 'United States', views: 45000, watchTime: 3500, averageDuration: '4:40' },
            { country: 'United Kingdom', views: 12500, watchTime: 950, averageDuration: '4:35' },
            { country: 'Canada', views: 8500, watchTime: 650, averageDuration: '4:20' },
            { country: 'Australia', views: 7500, watchTime: 580, averageDuration: '4:15' },
            { country: 'Germany', views: 6500, watchTime: 480, averageDuration: '4:10' }
        ],
        subscriptionStatus: [
            { status: 'Subscribed', views: 25000, watchTime: 2500, percentage: 25 },
            { status: 'Not subscribed', views: 75000, watchTime: 5000, percentage: 75 }
        ],
        performance_trend: [
            { month: 'Jan', views: 7500, watchTime: 560 },
            { month: 'Feb', views: 7800, watchTime: 580 },
            { month: 'Mar', views: 8100, watchTime: 610 },
            { month: 'Apr', views: 8300, watchTime: 620 },
            { month: 'May', views: 8450, watchTime: 630 },
            { month: 'Jun', views: 8600, watchTime: 640 },
            { month: 'Jul', views: 8750, watchTime: 650 },
            { month: 'Aug', views: 8900, watchTime: 665 },
            { month: 'Sep', views: 9050, watchTime: 675 },
            { month: 'Oct', views: 9200, watchTime: 685 },
            { month: 'Nov', views: 9350, watchTime: 700 },
            { month: 'Dec', views: 9500, watchTime: 715 }
        ]
    };
}

/**
 * Create default Google Analytics data
 * @returns {object} - Default Google Analytics data
 */
function createDefaultGoogleAnalyticsData() {
    return {
        totalUsers: 350000,
        totalSessions: 750000,
        engagedSessions: 525000,
        engagementRate: 70,
        demographics: {
            ageGroups: [
                { ageRange: '18-24', users: 52500, percentage: 15 },
                { ageRange: '25-34', users: 105000, percentage: 30 },
                { ageRange: '35-44', users: 87500, percentage: 25 },
                { ageRange: '45-54', users: 52500, percentage: 15 },
                { ageRange: '55-64', users: 35000, percentage: 10 },
                { ageRange: '65+', users: 17500, percentage: 5 }
            ],
            genderGroups: [
                { gender: 'Female', users: 175000, percentage: 50 },
                { gender: 'Male', users: 175000, percentage: 50 }
            ],
            countries: [
                { country: 'United States', users: 175000, percentage: 50 },
                { country: 'United Kingdom', users: 45500, percentage: 13 },
                { country: 'Canada', users: 31500, percentage: 9 },
                { country: 'Australia', users: 21000, percentage: 6 },
                { country: 'Germany', users: 17500, percentage: 5 }
            ]
        },
        trafficSources: [
            { source: 'Google', medium: 'organic', channel: 'Organic Search', sessions: 300000, percentage: 40 },
            { source: 'Direct', medium: 'none', channel: 'Direct', sessions: 150000, percentage: 20 },
            { source: 'Facebook', medium: 'social', channel: 'Social', sessions: 112500, percentage: 15 },
            { source: 'Email', medium: 'email', channel: 'Email', sessions: 75000, percentage: 10 },
            { source: 'Referral', medium: 'referral', channel: 'Referral', sessions: 56250, percentage: 7.5 },
            { source: 'Google', medium: 'cpc', channel: 'Paid Search', sessions: 37500, percentage: 5 }
        ],
        topPages: [
            { pagePath: '/', pageTitle: 'Home', pageviews: 250000, uniquePageviews: 175000, averageTimeOnPage: '2:30' },
            { pagePath: '/products', pageTitle: 'Products', pageviews: 150000, uniquePageviews: 87500, averageTimeOnPage: '3:10' },
            { pagePath: '/about', pageTitle: 'About Us', pageviews: 100000, uniquePageviews: 75000, averageTimeOnPage: '2:20' },
            { pagePath: '/blog', pageTitle: 'Blog', pageviews: 87500, uniquePageviews: 62500, averageTimeOnPage: '4:05' },
            { pagePath: '/contact', pageTitle: 'Contact', pageviews: 75000, uniquePageviews: 56250, averageTimeOnPage: '1:50' }
        ],
        campaigns: [
            { campaign: 'Spring_Sale_2023', source: 'Google', medium: 'cpc', sessions: 22500, conversions: 1125, conversionRate: 5.0 },
            { campaign: 'Newsletter_April', source: 'Email', medium: 'email', sessions: 15000, conversions: 825, conversionRate: 5.5 },
            { campaign: 'SummerPromo', source: 'Facebook', medium: 'social', sessions: 12000, conversions: 600, conversionRate: 5.0 }
        ],
        performance_trend: [
            { month: 'Jan', users: 27500, sessions: 58750, engagementRate: 68.5 },
            { month: 'Feb', users: 28000, sessions: 59500, engagementRate: 68.7 },
            { month: 'Mar', users: 28500, sessions: 60750, engagementRate: 69.0 },
            { month: 'Apr', users: 29000, sessions: 61500, engagementRate: 69.2 },
            { month: 'May', users: 29500, sessions: 62750, engagementRate: 69.5 },
            { month: 'Jun', users: 30000, sessions: 63750, engagementRate: 69.8 },
            { month: 'Jul', users: 30500, sessions: 64750, engagementRate: 70.0 },
            { month: 'Aug', users: 31000, sessions: 65750, engagementRate: 70.2 },
            { month: 'Sep', users: 31500, sessions: 66750, engagementRate: 70.5 },
            { month: 'Oct', users: 32000, sessions: 67750, engagementRate: 70.7 },
            { month: 'Nov', users: 32500, sessions: 68750, engagementRate: 70.9 },
            { month: 'Dec', users: 33000, sessions: 70000, engagementRate: 71.0 }
        ]
    };
}

/**
 * Create default cross-channel data
 * @returns {object} - Default cross-channel data
 */
function createDefaultCrossChannelData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return {
        year: new Date().getFullYear(),
        reach: {
            total: 0,
            byPlatform: {
                facebook: 0,
                instagram: 0,
                youtube: 0,
                web: 0
            }
        },
        engagement: {
            total: 0,
            byPlatform: {
                facebook: 0,
                instagram: 0,
                youtube: 0,
                web: 0
            }
        },
        engagement_rate: {
            overall: 0,
            byPlatform: {
                facebook: 0,
                instagram: 0,
                email: 0,
                web: 0
            }
        },
        performance_trend: months.map(month => ({
            month,
            facebook: 0,
            instagram: 0,
            youtube: 0,
            email: 0,
            web: 0
        })),
        attribution: [],
        content_performance: [],
        demographics: {
            age: [],
            countries: [],
            cities: [],
            languages: []
        },
        meta: {
            last_updated: new Date().toISOString(),
            year: new Date().getFullYear()
        }
    };
}

/**
 * Create default data structure for a year when no data is available
 * @param {string} year - Year to create data for
 * @param {number} currentYear - Current year for scaling calculations
 * @returns {object} - Default data structure
 */
function createDefaultYearData(year, currentYear) {
    const yearInt = parseInt(year);
    const scaleFactor = Math.pow(0.85, currentYear - yearInt);

    // Calculate base values scaled by year difference
    const baseReach = Math.round(120000 * scaleFactor);
    const baseEngagement = Math.round(15000 * scaleFactor);
    const baseViews = Math.round(90000 * scaleFactor);

    // Create trend data for each month
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = monthNames.map((month, idx) => {
        // Add some variation by month (seasonality)
        const monthFactor = 0.8 + (Math.sin(idx / 11 * Math.PI) * 0.2 + 0.2);

        return {
            month,
            facebook: Math.round(baseReach * 0.4 * monthFactor),
            instagram: Math.round(baseReach * 0.6 * monthFactor),
            youtube: Math.round(baseViews * monthFactor),
            email: Math.round(baseEngagement * 0.3 * monthFactor),
            web: Math.round(baseReach * 0.7 * monthFactor)
        };
    });

    return {
        facebook: {
            reach: Math.round(baseReach * 0.4),
            engagement: Math.round(baseEngagement * 0.4),
            engagement_rate: 3.5,
            posts: [],
            performance_trend: trend
        },
        instagram: {
            reach: Math.round(baseReach * 0.6),
            engagement: Math.round(baseEngagement * 0.6),
            engagement_rate: 4.2,
            posts: [],
            performance_trend: trend
        },
        youtube: {
            totalViews: baseViews,
            totalWatchTime: Math.round(baseViews * 0.08),
            averageViewDuration: '4:15',
            performance_trend: trend
        },
        email: {
            totalSent: Math.round(50000 * scaleFactor),
            openRate: 19.5 + (Math.random() * 3),
            clickRate: 2.1 + (Math.random() * 0.8),
            campaigns: [],
            performance_trend: trend
        },
        googleAnalytics: {
            totalUsers: Math.round(baseReach * 0.9),
            engagementRate: 68.5 + (Math.random() * 5),
            performance_trend: trend
        },
        crossChannel: {
            year: yearInt,
            reach: {
                total: baseReach,
                byPlatform: {
                    facebook: Math.round(baseReach * 0.4),
                    instagram: Math.round(baseReach * 0.6),
                    youtube: baseViews,
                    web: Math.round(baseReach * 0.9),
                    email: Math.round(50000 * scaleFactor)
                }
            },
            engagement: {
                total: baseEngagement,
                byPlatform: {
                    facebook: Math.round(baseEngagement * 0.4),
                    instagram: Math.round(baseEngagement * 0.6),
                    youtube: Math.round(baseViews * 0.1),
                    web: Math.round(baseReach * 0.9 * 0.65),
                    email: Math.round(50000 * scaleFactor * 0.021)
                }
            },
            engagement_rate: {
                overall: 3.8,
                byPlatform: {
                    facebook: 3.5,
                    instagram: 4.2,
                    youtube: 5.8,
                    web: 2.3,
                    email: 2.1
                }
            },
            performance_trend: trend,
            meta: {
                last_updated: new Date().toISOString(),
                year: yearInt
            }
        }
    };
}

// Render active dashboard with safety checks
function renderActiveDashboard() {
    if (dashboardState.isLoading) return;

    try {
        switch (dashboardState.activeDashboard) {
            case 'executive':
                if (typeof renderExecutiveDashboard === 'function') {
                    renderExecutiveDashboard(dashboardState.data);
                } else {
                    showModuleNotLoadedMessage('executive-dashboard');
                }
                break;
            case 'social':
                if (typeof renderSocialDashboard === 'function') {
                    renderSocialDashboard(dashboardState.data);
                } else {
                    showModuleNotLoadedMessage('social-dashboard');
                }
                break;
            case 'email':
                if (typeof renderEmailDashboard === 'function') {
                    renderEmailDashboard(dashboardState.data);
                } else {
                    showModuleNotLoadedMessage('email-dashboard');
                }
                break;
            case 'youtube':
                if (typeof renderYoutubeDashboard === 'function') {
                    renderYoutubeDashboard(dashboardState.data);
                } else {
                    showModuleNotLoadedMessage('youtube-dashboard');
                }
                break;
            case 'google-analytics':
                if (typeof renderGoogleAnalyticsDashboard === 'function') {
                    renderGoogleAnalyticsDashboard(dashboardState.data);
                } else {
                    showModuleNotLoadedMessage('google-analytics-dashboard');
                }
                break;
            case 'multi-year':
                // Check if the function exists before calling it
                if (typeof renderMultiYearTrendsDashboard === 'function') {
                    renderMultiYearTrendsDashboard(dashboardState.data, dashboardState.selectedYears);
                } else {
                    showModuleNotLoadedMessage('multi-year-dashboard', 'Multi-Year Trends Dashboard');
                }
                break;
            case 'yoy':
                // Year-over-year handling
                if (typeof renderYearOverYearDashboard === 'function') {
                    const years = dashboardState.selectedYears;
                    if (years.length >= 2) {
                        const currentYear = years[years.length - 1];
                        const previousYear = years[years.length - 2];
                        renderYearOverYearDashboard(dashboardState.data, currentYear, previousYear);
                    } else {
                        // Default to current year and previous year
                        const currentYear = new Date().getFullYear().toString();
                        const previousYear = (parseInt(currentYear) - 1).toString();
                        renderYearOverYearDashboard(dashboardState.data, currentYear, previousYear);
                    }
                } else {
                    showModuleNotLoadedMessage('yoy-dashboard', 'Year-over-Year Dashboard');
                }
                break;
            case 'converter':
                if (typeof renderConverterDashboard === 'function') {
                    renderConverterDashboard();
                } else {
                    showModuleNotLoadedMessage('converter-dashboard', 'CSV Converter');
                }
                break;
            case 'data-generator':
                if (typeof renderHistoricalDataGenerator === 'function') {
                    renderHistoricalDataGenerator();
                } else {
                    showModuleNotLoadedMessage('historical-data-generator', 'Historical Data Generator');
                }
                break;
            default:
                console.warn(`Unknown dashboard: ${dashboardState.activeDashboard}`);
        }
    } catch (error) {
        console.error(`Error rendering ${dashboardState.activeDashboard} dashboard:`, error);
        showErrorMessage(`Error loading ${dashboardState.activeDashboard} dashboard: ${error.message}`);
    }
}

// Helper function to show module not loaded message
function showModuleNotLoadedMessage(containerId, moduleName = 'Dashboard Module') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg my-6">
                <h2 class="text-xl font-bold text-gray-800 mb-2">${moduleName} Not Loaded</h2>
                <p class="text-gray-600 mb-4">
                    This dashboard module could not be loaded. This might be due to missing JavaScript files 
                    or network issues.
                </p>
                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 class="font-medium text-yellow-800 mb-2">Troubleshooting Tips</h3>
                    <ul class="list-disc pl-5 text-yellow-700 text-sm">
                        <li>Check that all JavaScript files are properly loaded</li>
                        <li>Ensure the file '${moduleName.toLowerCase().replace(/\s+/g, '-')}.js' exists</li>
                        <li>Try refreshing the page</li>
                        <li>Check browser console for specific errors</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Helper function to show error message
function showErrorMessage(message) {
    // Create error element if it doesn't exist
    let errorEl = document.getElementById('dashboard-error-message');
    if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.id = 'dashboard-error-message';
        errorEl.className = 'bg-red-50 p-4 rounded-lg border border-red-200 my-4';

        // Insert at the top of the dashboard container
        const dashboardContainer = document.getElementById('dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.prepend(errorEl);
        } else {
            document.body.prepend(errorEl);
        }
    }

    // Update error message
    errorEl.innerHTML = `
        <div class="flex items-start">
            <div class="mr-3 bg-red-100 rounded-full p-2">
                <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <div>
                <h3 class="text-lg font-medium text-red-800">Dashboard Error</h3>
                <p class="mt-1 text-sm text-red-700">${message}</p>
                <button id="dismiss-error" class="mt-2 text-sm text-red-600 hover:text-red-800 underline">Dismiss</button>
            </div>
        </div>
    `;

    // Add event listener to dismiss button
    document.getElementById('dismiss-error').addEventListener('click', function () {
        errorEl.remove();
    });
}

// Helper function to show/hide loading indicator
function setLoading(isLoading) {
    dashboardState.isLoading = isLoading;

    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}

// Add a status indicator for debugging
function addStatusIndicator() {
    // Create a status div for debugging
    const statusDiv = document.createElement('div');
    statusDiv.id = 'data-status-indicator';
    statusDiv.style.position = 'fixed';
    statusDiv.style.bottom = '10px';
    statusDiv.style.right = '10px';
    statusDiv.style.padding = '10px';
    statusDiv.style.background = '#f8f9fa';
    statusDiv.style.border = '1px solid #dee2e6';
    statusDiv.style.borderRadius = '5px';
    statusDiv.style.zIndex = '1000';
    statusDiv.style.maxWidth = '300px';
    statusDiv.style.fontSize = '12px';
    statusDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    statusDiv.innerHTML = 'Checking data status...';
    document.body.appendChild(statusDiv);

    // Update status every second
    setInterval(updateDataStatus, 1000);
}

// Update the status indicator with current state
function updateDataStatus() {
    const statusDiv = document.getElementById('data-status-indicator');
    if (!statusDiv) return;

    // Count loaded files
    const loadedFiles = Object.keys(dashboardState.dataCache).length;

    // Count available platforms with data
    const platformsWithData = [
        dashboardState.data.facebook ? 'Facebook' : null,
        dashboardState.data.instagram ? 'Instagram' : null,
        dashboardState.data.email ? 'Email' : null,
        dashboardState.data.youtube ? 'YouTube' : null,
        dashboardState.data.googleAnalytics ? 'Google Analytics' : null
    ].filter(Boolean);

    statusDiv.innerHTML = `
        <strong>Dashboard Status</strong><br>
        Files loaded: ${loadedFiles}<br>
        Dashboard state: ${dashboardState.isLoading ? 'Loading...' : 'Ready'}<br>
        Active view: ${dashboardState.activeDashboard}<br>
        Platforms: ${platformsWithData.join(', ')}<br>
        <a href="#" onclick="toggleDebugInfo()" style="text-decoration: underline; color: blue;">Toggle Debug</a>
        <div id="debug-info" style="display: none; margin-top: 5px;">
            <strong>Debug Info:</strong><br>
            ${Object.keys(dashboardState.dataCache).join('<br>')}
        </div>
    `;
}

// Toggle debug information visibility
window.toggleDebugInfo = function () {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        debugInfo.style.display = debugInfo.style.display === 'none' ? 'block' : 'none';
    }
};

// Clear data cache
function clearDataCache() {
    dashboardState.dataCache = {};
    console.log('Data cache cleared');
}

// Minimal implementation of MultiYearTrendsDashboard in case it's missing
if (typeof renderMultiYearTrendsDashboard !== 'function') {
    window.renderMultiYearTrendsDashboard = function (data, years = []) {
        const container = document.getElementById('multi-year-dashboard');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-gray-800">Multi-Year Analysis</h2>
                <p class="text-gray-600 mt-2">
                    The multi-year analysis module is currently being upgraded.
                    Basic dashboard functionality is available in other tabs.
                </p>
                <div class="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-medium text-blue-800">Missing Module</h3>
                    <p class="mt-2 text-sm text-blue-700">
                        The file multi-year-dashboard.js appears to be missing or could not be loaded.
                        Please check that all JavaScript files are properly included.
                    </p>
                </div>
            </div>
        `;
    };
}

// Fallback implementation of YearOverYearDashboard in case it's missing
if (typeof renderYearOverYearDashboard !== 'function') {
    window.renderYearOverYearDashboard = function (data, currentYear, previousYear) {
        const container = document.getElementById('yoy-dashboard');
        if (!container) return;

        container.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg">
                <h2 class="text-2xl font-bold text-gray-800">Year-over-Year Comparison</h2>
                <p class="text-gray-600 mt-2">
                    ${previousYear} vs ${currentYear} performance analysis
                </p>
                <div class="mt-4 bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-medium text-blue-800">Missing Module</h3>
                    <p class="mt-2 text-sm text-blue-700">
                        The file yoy-dashboard.js appears to be missing or could not be loaded.
                        Please check that all JavaScript files are properly included.
                    </p>
                </div>
            </div>
        `;
    };
}