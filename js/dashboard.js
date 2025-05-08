/**
 * Main Dashboard Logic
 * Enhanced for GitHub Pages compatibility
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
async function loadCSV(fileName, options = {}) {
    // Check if we already have this in the cache
    if (dashboardState.dataCache[fileName]) {
        return dashboardState.dataCache[fileName];
    }

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

    let response = null;
    let data = null;

    for (const path of paths) {
        try {
            console.log('Trying to fetch from:', path);
            response = await fetch(path);
            if (response.ok) {
                const text = await response.text();
                data = await parseCSV(text, options);
                console.log('Successfully loaded from:', path);

                // Cache the data for future use
                dashboardState.dataCache[fileName] = data;

                return data;
            }
        } catch (error) {
            console.warn(`Error fetching from ${path}:`, error);
        }
    }

    console.log(`Failed to load ${fileName} from any path, trying JSON fallback`);

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
                console.log('Trying JSON fallback:', path);
                const jsonResponse = await fetch(path);
                if (jsonResponse.ok) {
                    const jsonData = await jsonResponse.json();
                    console.log('Successfully loaded JSON fallback from:', path);
                    dashboardState.dataCache[fileName] = jsonData;
                    return jsonData;
                }
            } catch (fallbackError) {
                console.warn(`Error with JSON fallback from ${path}:`, fallbackError);
            }
        }
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
                } catch (error) {
                    console.error('Error loading YouTube data:', error);
                    // Create minimal empty YouTube data structure (no dummy data)
                    dashboardState.data.youtube = {
                        totalViews: 0,
                        totalWatchTime: 0,
                        averageViewDuration: '0:00',
                        demographics: {
                            age: [],
                            gender: []
                        },
                        subscriptionStatus: [],
                        performance_trend: []
                    };
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
            } catch (error) {
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

        // Load data for each year
        for (const year of years) {
            if (!dashboardState.data.yearlyData[year]) {
                try {
                    // Set the year in options for loading from year-specific folders
                    const yearOption = { year };

                    // Try loading from JSON files first for yearly data
                    try {
                        const yearData = await loadJSON(`${year}/year_data.json`);
                        dashboardState.data.yearlyData[year] = yearData;
                        continue; // Skip to the next year if successful
                    } catch (jsonError) {
                        console.warn(`No JSON yearly data found for ${year}, trying CSVs`);
                    }

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

                    // Load YouTube data with fallbacks
                    let youtubeData = {};
                    try {
                        // Try loading YouTube data with fallbacks for each file
                        const ytAge = await loadCSV(`${year}/YouTube_Age.csv`).catch(() => loadCSV('YouTube_Age.csv'));
                        const ytGender = await loadCSV(`${year}/YouTube_Gender.csv`).catch(() => loadCSV('YouTube_Gender.csv'));
                        const ytGeography = await loadCSV(`${year}/YouTube_Geography.csv`).catch(() => loadCSV('YouTube_Geography.csv'));

                        // For subscription data, use default if missing
                        let ytSubscription = [];
                        try {
                            ytSubscription = await loadCSV(`${year}/YouTube_Subscription_Status.csv`);
                        } catch (e) {
                            try {
                                ytSubscription = await loadCSV('YouTube_Subscription_Status.csv');
                            } catch (e2) {
                                console.warn('Could not load YouTube_Subscription_Status.csv, using default data');
                                ytSubscription = [
                                    { 'Subscription status': 'Subscribed', 'Views': 25000, 'Watch time (hours)': 2500 },
                                    { 'Subscription status': 'Not subscribed', 'Views': 75000, 'Watch time (hours)': 5000 },
                                    { 'Subscription status': 'Total', 'Views': 100000, 'Watch time (hours)': 7500 }
                                ];
                            }
                        }

                        const ytContent = await loadCSV(`${year}/YouTube_Content.csv`).catch(() => loadCSV('YouTube_Content.csv'));
                        const ytCities = await loadCSV(`${year}/YouTube_Cities.csv`).catch(() => loadCSV('YouTube_Cities.csv'));

                        // Process YouTube data
                        youtubeData = processYouTubeData(
                            convertArrayToCSV(ytAge),
                            convertArrayToCSV(ytGender),
                            convertArrayToCSV(ytGeography),
                            convertArrayToCSV(ytSubscription),
                            convertArrayToCSV(ytContent),
                            { year: parseInt(year), citiesData: convertArrayToCSV(ytCities) }
                        );
                    } catch (error) {
                        console.warn(`Could not load complete YouTube data for year ${year}:`, error);
                        // Set default YouTube data
                        youtubeData = {
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

// Clear data cache
function clearDataCache() {
    dashboardState.dataCache = {};
    console.log('Data cache cleared');
}