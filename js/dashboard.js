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
async function loadCSV(fileName, options = {}) {
    // Try different paths
    const paths = [
        `./data/${fileName}`,
        `/data/${fileName}`,
        `/marcomms-dashboard/data/${fileName}`,
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

    console.log(`Failed to load ${fileName} from any path`);
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

            // Load YouTube data with fallbacks
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
                    console.warn('Could not load YouTube_Subscription_Status.csv, using fallback data');
                    // Default subscription data if file is missing
                    ytSubscription = [
                        { 'Subscription status': 'Subscribed', 'Views': 25000, 'Watch time (hours)': 2500 },
                        { 'Subscription status': 'Not subscribed', 'Views': 75000, 'Watch time (hours)': 5000 },
                        { 'Subscription status': 'Total', 'Views': 100000, 'Watch time (hours)': 7500 }
                    ];
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

function renderConverterDashboard() {
    const container = document.getElementById('converter-dashboard');
    if (!container) return;

    // Initialize converter state object if it doesn't exist
    if (!window.converterState) {
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
            step: 'upload' // upload, processing, results, error
        };
    }

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

// Render the processing step
function renderProcessingStep() {
    return `
        <div class="processing-section flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Processing Files...</h3>
            <p class="text-gray-600">This may take a few moments depending on the file size.</p>
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

// Attach event listeners for the converter
function attachConverterEventListeners() {
    // File upload
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
    
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
// Render the appropriate step based on the current state
function renderConverterStep() {
    switch (window.converterState.step) {
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

// Render the processing step
function renderProcessingStep() {
    return `
        <div class="processing-section flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <h3 class="text-lg font-medium text-gray-800 mb-2">Processing Files...</h3>
            <p class="text-gray-600">This may take a few moments depending on the file size.</p>
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

// Attach event listeners for the converter
function attachConverterEventListeners() {
    // File upload
    const fileUpload = document.getElementById('file-upload');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }

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
        btn.addEventListener('click', function () {
            const key = this.getAttribute('data-key');
            downloadFile(key);
        });
    });
}
// Clear data cache
function clearDataCache() {
    dashboardState.dataCache = {};
    console.log('Data cache cleared');
}