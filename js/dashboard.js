/**
 * Main Dashboard Logic
 * Enhanced for GitHub Pages compatibility
 */
document.addEventListener('DOMContentLoaded', function () {
    // Initialize dashboard
    initDashboard();
});

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

// Add this line to call the test function when the page loads
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(testDataLoading, 1000); // Delay by 1 second to let other scripts load
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
    // Add a status indicator to the page
    function addStatusIndicator() {
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
        statusDiv.innerHTML = 'Checking data status...';
        document.body.appendChild(statusDiv);

        // Update status every second
        setInterval(updateDataStatus, 1000);
    }

    function updateDataStatus() {
        const statusDiv = document.getElementById('data-status-indicator');
        if (!statusDiv) return;

        // Count loaded files
        const loadedFiles = Object.keys(dashboardState.dataCache).length;

        statusDiv.innerHTML = `
        <strong>Data Status:</strong><br>
        Files loaded: ${loadedFiles}<br>
        Dashboard state: ${dashboardState.isLoading ? 'Loading...' : 'Ready'}<br>
        Active view: ${dashboardState.activeDashboard}
    `;
    }
    // Call this at the end of initDashboard
    addStatusIndicator();

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
    }

    // Render the active dashboard
    renderActiveDashboard();
}


/**
 * Load a CSV file and parse it with PapaParse
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

    // Rest of the function remains the same...
    console.log(`❌ Failed to load ${fileName} from any path, trying JSON fallback`);

    // Try JSON fallback
    try {
        const jsonFileName = fileName.replace('.csv', '.json');
        // ... existing JSON fallback code ...
    } catch (jsonError) {
        console.error('JSON fallback failed:', jsonError);
    }

    throw new Error(`Could not load ${fileName}`);
}

/**
 * Parse CSV text using PapaParse
 * @param {string} csvText - The CSV text to parse
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed CSV data
 */
function parseCSV(csvText, options = {}) {
    console.log(`🔄 Parsing CSV text of length ${csvText.length}...`);

    return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            ...options,
            complete: (results) => {
                console.log(`✅ CSV parsing complete - Found ${results.data.length} rows`);
                if (results.errors && results.errors.length > 0) {
                    console.warn(`⚠️ CSV parsing had ${results.errors.length} errors:`, results.errors);
                }
                resolve(results.data);
            },
            error: (error) => {
                console.error('❌ Error parsing CSV:', error);
                reject(error);
            }
        });
    });
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
            // Try loading with CSV files first
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
                    let ytSubscription = [];

                    try {
                        // Try to load subscription data
                        ytSubscription = await loadCSV('YouTube_Subscription_Status.csv');
                    } catch (e) {
                        console.warn('Could not load YouTube_Subscription_Status.csv, using empty data');
                        // Empty array instead of dummy data
                        ytSubscription = [];
                    }

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
                }
                // End of YouTube data loading try
                catch (error) {
                    console.error('Error loading YouTube data:', error);
                    // Create minimal default YouTube data structure
                    dashboardState.data.youtube = {
                        totalViews: 100000,
                        totalWatchTime: 7500,
                        averageViewDuration: '4:30',
                        demographics: {
                            age: [],
                            gender: []
                        },
                        subscriptionStatus: [
                            { status: 'Subscribed', views: 25000, watchTime: 2500, percentage: 25 },
                            { status: 'Not subscribed', views: 75000, watchTime: 5000, percentage: 75 }
                        ],
                        performance_trend: []
                    };
                }

                // Load Google Analytics data
                const gaDemographics = await loadCSV('GA_Demographics.csv');
                const gaPages = await loadCSV('GA_Pages_And_Screens.csv');
                const gaTraffic = await loadCSV('GA_Traffic_Acquisition.csv');
                const gaUTMs = await loadCSV('GA_UTMs.csv');

                // Process Google Analytics data
                dashboardState.data.googleAnalytics = processGoogleAnalyticsData(
                    convertArrayToCSV(gaDemographics),
                    convertArrayToCSV(gaPages),
                    convertArrayToCSV(gaTraffic),
                    convertArrayToCSV(gaUTMs)
                );

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
                    throw new Error('Could not load data from either CSV or JSON sources');
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
            console.log('Trying to fetch JSON from:', path);
            const response = await fetch(path);
            if (response.ok) {
                const data = await response.json();
                console.log('Successfully loaded JSON from:', path);
                return data;
            }
        } catch (error) {
            console.warn(`Error fetching JSON from ${path}:`, error);
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

                        // Use current year data as base if available
                        const baseData = {
                            facebook: dashboardState.data.facebook,
                            instagram: dashboardState.data.instagram,
                            youtube: dashboardState.data.youtube,
                            email: dashboardState.data.email,
                            googleAnalytics: dashboardState.data.googleAnalytics,
                            crossChannel: dashboardState.data.crossChannel
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
                            scaleMetrics(dashboardState.data.facebook, 0.8);

                        const instagramData = isHistoricalIgData ?
                            processInstagramData(convertArrayToCSV(igPosts), { year: parseInt(year) }) :
                            scaleMetrics(dashboardState.data.instagram, 0.8);

                        const emailData = isHistoricalEmailData ?
                            processEmailData(convertArrayToCSV(emailCsv), { year: parseInt(year) }) :
                            scaleMetrics(dashboardState.data.email, 0.8);

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
        // Don't show alert to users, just log to console
    }

    setLoading(false);
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
        case 'multi-year':
            // Check if the function exists before calling it
            if (typeof renderMultiYearTrendsDashboard === 'function') {
                renderMultiYearTrendsDashboard(dashboardState.data, dashboardState.selectedYears);
            } else {
                showModuleNotLoadedMessage('multi-year-dashboard');
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
                showModuleNotLoadedMessage('yoy-dashboard');
            }
            break;
        case 'converter':
            renderConverterDashboard();
            break;
        case 'data-generator':
            renderHistoricalDataGenerator();
            break;
    }
}

// Helper function to show module not loaded message
function showModuleNotLoadedMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">Module Not Loaded</h2>
                <p class="text-yellow-700">This dashboard module could not be loaded. Please check your JavaScript files.</p>
            </div>
        `;
    }
}
// Helper function to show/hide loading indicator
function setLoading(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        if (isLoading) {
            loadingIndicator.classList.remove('hidden');
        } else {
            loadingIndicator.classList.add('hidden');
        }
    }
}


// Clear data cache
function clearDataCache() {
    dashboardState.dataCache = {};
    console.log('Data cache cleared');
}