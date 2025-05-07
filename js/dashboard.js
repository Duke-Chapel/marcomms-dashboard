/**
 * Main Dashboard Logic
 * Enhanced with direct CSV processing for GitHub Pages
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
    document.getElementById(`${dashboard}-dashboard`).classList.remove('hidden');

    // Render the active dashboard
    renderActiveDashboard();
}

/**
 * Load a CSV file and parse it with PapaParse
 * @param {string} fileName - The name of the CSV file to load
 * @param {object} options - Options for parsing
 * @returns {Promise<Array>} - Parsed CSV data
 */

// Function to handle missing file gracefully with default data
async function loadCSVWithFallback(fileName, defaultData = []) {
    try {
        const data = await loadCSV(fileName);
        return data.length > 0 ? data : defaultData;
    } catch (error) {
        console.warn(`Could not load ${fileName}, using default data instead.`);
        return defaultData;
    }
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
        // Determine current year based on timeframe
        const currentYear = new Date().getFullYear().toString();

        // If timeframe is year-over-year or 5-year
        if (dashboardState.timeframe === 'yoy' || dashboardState.timeframe === '5y') {
            await loadYearlyData();
        } else {
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

            // Load YouTube data with fallbacks for missing files
            dashboardState.data.youtube = await loadYouTubeDataWithDefaults();

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

        // Load data for each year
        for (const year of years) {
            if (!dashboardState.data.yearlyData[year]) {
                try {
                    // Set the year in options for loading from year-specific folders
                    const yearOption = { year };

                    // Try to load from year-specific folder
                    const fbPosts = await loadCSV(`${year}/FB_Posts.csv`).catch(() => loadCSV('FB_Posts.csv'));
                    const fbVideos = await loadCSV(`${year}/FB_Videos.csv`).catch(() => loadCSV('FB_Videos.csv'));
                    const fbReach = await loadCSV(`${year}/FB_Reach.csv`).catch(() => loadCSV('FB_Reach.csv'));
                    const fbInteractions = await loadCSV(`${year}/FB_Interactions.csv`).catch(() => loadCSV('FB_Interactions.csv'));

                    // Process Facebook data
                    const facebookData = processFacebookData(
                        convertArrayToCSV(fbPosts),
                        {
                            postsData: convertArrayToCSV(fbPosts),
                            reachData: convertArrayToCSV(fbReach),
                            interactionsData: convertArrayToCSV(fbInteractions),
                            year: parseInt(year)
                        }
                    );

                    // Load Instagram data
                    const igPosts = await loadCSV(`${year}/IG_Posts.csv`).catch(() => loadCSV('IG_Posts.csv'));
                    const igReach = await loadCSV(`${year}/IG_Reach.csv`).catch(() => loadCSV('IG_Reach.csv'));
                    const igInteractions = await loadCSV(`${year}/IG_Interactions.csv`).catch(() => loadCSV('IG_Interactions.csv'));

                    // Process Instagram data
                    const instagramData = processInstagramData(
                        convertArrayToCSV(igPosts),
                        {
                            reachData: convertArrayToCSV(igReach),
                            interactionsData: convertArrayToCSV(igInteractions),
                            year: parseInt(year)
                        }
                    );

                    // Load Email data
                    const emailCsv = await loadCSV(`${year}/Email_Campaign_Performance.csv`).catch(() => loadCSV('Email_Campaign_Performance.csv'));

                    // Process Email data
                    const emailData = processEmailData(
                        convertArrayToCSV(emailCsv),
                        { year: parseInt(year) }
                    );

                    // Load YouTube data
                    const ytAge = await loadCSV(`${year}/YouTube_Age.csv`).catch(() => loadCSV('YouTube_Age.csv'));
                    const ytGender = await loadCSV(`${year}/YouTube_Gender.csv`).catch(() => loadCSV('YouTube_Gender.csv'));
                    const ytGeography = await loadCSV(`${year}/YouTube_Geography.csv`).catch(() => loadCSV('YouTube_Geography.csv'));
                    const ytSubscription = await loadCSV(`${year}/YouTube_Subscription_Status.csv`).catch(() => loadCSV('YouTube_Subscription_Status.csv'));
                    const ytContent = await loadCSV(`${year}/YouTube_Content.csv`).catch(() => loadCSV('YouTube_Content.csv'));

                    // Process YouTube data
                    const youtubeData = processYouTubeData(
                        convertArrayToCSV(ytAge),
                        convertArrayToCSV(ytGender),
                        convertArrayToCSV(ytGeography),
                        convertArrayToCSV(ytSubscription),
                        convertArrayToCSV(ytContent),
                        { year: parseInt(year) }
                    );

                    // Load Google Analytics data
                    const gaDemographics = await loadCSV(`${year}/GA_Demographics.csv`).catch(() => loadCSV('GA_Demographics.csv'));
                    const gaPages = await loadCSV(`${year}/GA_Pages_And_Screens.csv`).catch(() => loadCSV('GA_Pages_And_Screens.csv'));
                    const gaTraffic = await loadCSV(`${year}/GA_Traffic_Acquisition.csv`).catch(() => loadCSV('GA_Traffic_Acquisition.csv'));
                    const gaUTMs = await loadCSV(`${year}/GA_UTMs.csv`).catch(() => loadCSV('GA_UTMs.csv'));

                    // Process Google Analytics data
                    const googleAnalyticsData = processGoogleAnalyticsData(
                        convertArrayToCSV(gaDemographics),
                        convertArrayToCSV(gaPages),
                        convertArrayToCSV(gaTraffic),
                        convertArrayToCSV(gaUTMs),
                        { year: parseInt(year) }
                    );

                    // Generate cross-channel data
                    const crossChannelData = generateCrossChannelData(
                        facebookData,
                        instagramData,
                        youtubeData,
                        emailData,
                        googleAnalyticsData,
                        { year: parseInt(year) }
                    );

                    // Store year data
                    dashboardState.data.yearlyData[year] = {
                        facebook: facebookData,
                        instagram: instagramData,
                        youtube: youtubeData,
                        email: emailData,
                        googleAnalytics: googleAnalyticsData,
                        crossChannel: crossChannelData
                    };
                } catch (error) {
                    console.warn(`Could not load complete data for year ${year}. Using available data.`, error);

                    // Initialize with empty objects if loading fails
                    dashboardState.data.yearlyData[year] = {
                        facebook: {},
                        instagram: {},
                        youtube: {},
                        email: {},
                        googleAnalytics: {},
                        crossChannel: {}
                    };
                }
            }
        }

        // Process multi-year data
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
        alert('Error loading yearly data. Please check the console for details.');
    }

    setLoading(false);
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
// Updated YouTube data loading with default values for missing files
async function loadYouTubeDataWithDefaults() {
    const ytAge = await loadCSVWithFallback('YouTube_Age.csv');
    const ytGender = await loadCSVWithFallback('YouTube_Gender.csv');
    const ytGeography = await loadCSVWithFallback('YouTube_Geography.csv');

    // Use default subscription data if file is missing
    const ytSubscription = await loadCSVWithFallback('YouTube_Subscription_Status.csv', [
        { 'Subscription status': 'Subscribed', 'Views': 25000, 'Watch time (hours)': 2500 },
        { 'Subscription status': 'Not subscribed', 'Views': 75000, 'Watch time (hours)': 5000 },
        { 'Subscription status': 'Total', 'Views': 100000, 'Watch time (hours)': 7500 }
    ]);

    const ytContent = await loadCSVWithFallback('YouTube_Content.csv');
    const ytCities = await loadCSVWithFallback('YouTube_Cities.csv');

    // Process YouTube data with fallbacks
    return processYouTubeData(
        convertArrayToCSV(ytAge),
        convertArrayToCSV(ytGender),
        convertArrayToCSV(ytGeography),
        convertArrayToCSV(ytSubscription),
        convertArrayToCSV(ytContent),
        { citiesData: convertArrayToCSV(ytCities) }
    );
}
// Update the renderActiveDashboard function with safety checks
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
                // Show error message if function is missing
                const container = document.getElementById('multi-year-dashboard');
                if (container) {
                    container.innerHTML = `
              <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">Module Not Loaded</h2>
                <p class="text-yellow-700">The multi-year trends dashboard module could not be loaded. Please check your JavaScript files.</p>
              </div>
            `;
                }
            }
            break;
        case 'yoy':
            // Get current and previous year from selected years
            const years = dashboardState.selectedYears;
            if (typeof renderYearOverYearDashboard === 'function') {
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
                // Show error message if function is missing
                const container = document.getElementById('yoy-dashboard');
                if (container) {
                    container.innerHTML = `
              <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">Module Not Loaded</h2>
                <p class="text-yellow-700">The year-over-year dashboard module could not be loaded. Please check your JavaScript files.</p>
              </div>
            `;
                }
            }
            break;
        case 'converter':
            renderConverterDashboard();
            break;
    }
}

function renderConverterDashboard() {
    const container = document.getElementById('converter-dashboard');
    if (container) {
        container.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow">
                <h2 class="text-2xl font-bold text-gray-800">CSV Converter</h2>
                <p class="text-gray-600 my-4">The CSV converter allows you to upload and process your marketing data files.</p>
                
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <p class="text-yellow-700">Please upload your CSV files from your marketing platforms to begin processing.</p>
                </div>
                
                <!-- File upload area can be added here later -->
            </div>
        `;
    }
}

// Clear data cache
function clearDataCache() {
    dashboardState.dataCache = {};
    console.log('Data cache cleared');
}