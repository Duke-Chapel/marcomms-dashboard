/**
 * Main Dashboard Logic
 * Modified for GitHub Pages deployment
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard
    initDashboard();
});

// Dashboard state
const dashboardState = {
    timeframe: DASHBOARD_CONFIG.defaultTimeframe,
    activeDashboard: 'executive',
    data: {
        yearlyData: {}, // Data organized by year
        multiYearData: null, // Processed multi-year data
    },
    selectedYears: [],
    isLoading: false,
    dataCache: {} // Cache for loaded CSV data
};

// Initialize dashboard
async function initDashboard() {
    setupEventListeners();
    await loadAllData();
    renderActiveDashboard();
}

// Set up event listeners
function setupEventListeners() {
    // Timeframe selector
    const timeframeSelector = document.getElementById('timeframe-selector');
    if (timeframeSelector) {
        timeframeSelector.value = dashboardState.timeframe;
        timeframeSelector.addEventListener('change', async function () {
            dashboardState.timeframe = this.value;
            await loadAllData();
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
    document.getElementById(`${dashboard}-dashboard`).classList.remove('hidden');

    // Render the active dashboard
    renderActiveDashboard();
}

/**
 * Get the base URL for the current GitHub Pages deployment
 * This helps handle various deployment scenarios (root domain, subpath, local dev)
 */
function getBaseUrl() {
    // Get the current URL path
    const path = window.location.pathname;
    
    // Check if we're on GitHub Pages (typically has a repository name in the path)
    const pathParts = path.split('/').filter(part => part !== '');
    
    // If we're at root or in local development
    if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === 'index.html')) {
        return './';
    }
    
    // If we're in a GitHub Pages repository
    return '/' + pathParts[0] + '/';
}

/**
 * Load a JSON file directly
 * @param {string} fileName - The name of the JSON file to load
 * @returns {Promise<Object>} - Parsed JSON data
 */
async function loadJSON(fileName) {
    // Check if we already have this in the cache
    if (dashboardState.dataCache[fileName]) {
        return dashboardState.dataCache[fileName];
    }
    
    // Try different possible paths for GitHub Pages compatibility
    const paths = [
        `./${DASHBOARD_CONFIG.dataPath}/${fileName}`,
        `${DASHBOARD_CONFIG.dataPath}/${fileName}`,
        `${getBaseUrl()}${DASHBOARD_CONFIG.dataPath}/${fileName}`,
        `/${DASHBOARD_CONFIG.dataPath}/${fileName}`
    ];
    
    let response = null;
    let data = null;
    
    for (const path of paths) {
        try {
            console.log('Trying to fetch JSON from:', path);
            response = await fetch(path);
            if (response.ok) {
                data = await response.json();
                console.log('Successfully loaded JSON from:', path);
                
                // Cache the data for future use
                dashboardState.dataCache[fileName] = data;
                
                return data;
            }
        } catch (error) {
            console.warn(`Error fetching JSON from ${path}:`, error);
        }
    }
    
    console.error(`Failed to load ${fileName} from any path`);
    throw new Error(`Could not load ${fileName}`);
}

/**
 * Load a CSV file and parse it with PapaParse
 * @param {string} fileName - The name of the CSV file to load
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed CSV data
 */
async function loadCSV(fileName, options = {}) {
    // Check if we already have this in the cache
    if (dashboardState.dataCache[fileName]) {
        return dashboardState.dataCache[fileName];
    }
    
    // Try different possible paths for GitHub Pages compatibility
    const paths = [
        `./${DASHBOARD_CONFIG.dataPath}/${fileName}`,
        `${DASHBOARD_CONFIG.dataPath}/${fileName}`,
        `${getBaseUrl()}${DASHBOARD_CONFIG.dataPath}/${fileName}`,
        `/${DASHBOARD_CONFIG.dataPath}/${fileName}`
    ];
    
    let response = null;
    let data = null;
    
    for (const path of paths) {
        try {
            console.log('Trying to fetch CSV from:', path);
            response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                data = await parseCSV(text, options);
                console.log('Successfully loaded CSV from:', path);
                
                // Cache the data for future use
                dashboardState.dataCache[fileName] = data;
                
                return data;
            }
        } catch (error) {
            console.warn(`Error fetching CSV from ${path}:`, error);
        }
    }
    
    console.error(`Failed to load ${fileName} from any path`);
    throw new Error(`Could not load ${fileName}`);
}

/**
 * Parse CSV text using PapaParse
 * @param {string} csvText - The CSV text to parse
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed CSV data
 */
function parseCSV(csvText, options = {}) {
    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            ...options,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
                reject(error);
            }
        });
    });
}

// Load all data
async function loadAllData() {
    setLoading(true);

    try {
        // For GitHub Pages, use the pre-processed JSON files instead of CSV processing
        // This is more efficient and avoids cross-origin issues
        
        // Load data from JSON files
        dashboardState.data.facebook = await loadJSON('facebook_data.json');
        dashboardState.data.instagram = await loadJSON('instagram_data.json');
        dashboardState.data.email = await loadJSON('email_data.json');
        dashboardState.data.youtube = await loadJSON('youtube_data.json');
        dashboardState.data.googleAnalytics = await loadJSON('google_analytics_data.json');
        dashboardState.data.crossChannel = await loadJSON('cross_channel_data.json');
        
        // Add to yearly data for current year
        const currentYear = new Date().getFullYear().toString();
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

        // Update last updated timestamp
        const lastUpdatedEl = document.getElementById('last-updated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = new Date().toLocaleString();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading dashboard data. Please check the console for details.');
    }

    setLoading(false);
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

// Set loading state
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

// Render active dashboard with safety checks
function renderActiveDashboard() {
    if (dashboardState.isLoading) return;

    switch (dashboardState.activeDashboard) {
        case 'executive':
            renderExecutiveDashboard(dashboardState.data);
            break;
        case 'social':
            renderSocialDashboard(dashboardState.data);
            break;
        case 'email':
            renderEmailDashboard(dashboardState.data);
            break;
        case 'youtube':
            renderYoutubeDashboard(dashboardState.data);
            break;
        case 'google-analytics':
            renderGoogleAnalyticsDashboard(dashboardState.data);
            break;
    }
}

// Clear data cache
function clearDataCache() {
    dashboardState.dataCache = {};
    console.log('Data cache cleared');
}