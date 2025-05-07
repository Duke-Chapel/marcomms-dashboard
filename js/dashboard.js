/**
 * Main Dashboard Logic
 * Enhanced with multi-year and Google Analytics support
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
    isLoading: false
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

// Load all data
async function loadAllData() {
    setLoading(true);

    try {
        // Determine current year based on timeframe
        let currentYear = new Date().getFullYear().toString();
        let previousYear = (parseInt(currentYear) - 1).toString();

        // If timeframe is year-over-year or 5-year
        if (dashboardState.timeframe === 'yoy' || dashboardState.timeframe === '5y') {
            await loadYearlyData();
        } else {
            // Load data for current timeframe
            dashboardState.data.facebook = await fetchData('facebook_data.json');
            dashboardState.data.instagram = await fetchData('instagram_data.json');
            dashboardState.data.youtube = await fetchData('youtube_data.json');
            dashboardState.data.email = await fetchData('email_data.json');
            dashboardState.data.googleAnalytics = await fetchData('google_analytics_data.json');
            dashboardState.data.crossChannel = await fetchData('cross_channel_data.json');

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
                    // Try to load specific year's data
                    const yearData = {
                        facebook: await fetchData(`${year}/facebook_data.json`),
                        instagram: await fetchData(`${year}/instagram_data.json`),
                        youtube: await fetchData(`${year}/youtube_data.json`),
                        email: await fetchData(`${year}/email_data.json`),
                        googleAnalytics: await fetchData(`${year}/google_analytics_data.json`),
                        crossChannel: await fetchData(`${year}/cross_channel_data.json`)
                    };

                    dashboardState.data.yearlyData[year] = yearData;
                } catch (error) {
                    console.warn(`Could not load data for year ${year}. Using default data.`);

                    // Use default data for year
                    dashboardState.data.yearlyData[year] = {
                        facebook: dashboardState.data.facebook || await fetchData('facebook_data.json'),
                        instagram: dashboardState.data.instagram || await fetchData('instagram_data.json'),
                        youtube: dashboardState.data.youtube || await fetchData('youtube_data.json'),
                        email: dashboardState.data.email || await fetchData('email_data.json'),
                        googleAnalytics: dashboardState.data.googleAnalytics || await fetchData('google_analytics_data.json'),
                        crossChannel: dashboardState.data.crossChannel || await fetchData('cross_channel_data.json')
                    };
                }
            }
        }

        // Process multi-year data
        dashboardState.data.multiYearData = processMultiYearData(dashboardState.data.yearlyData);

        // Set currently active data to most recent year
        const mostRecentYear = years[years.length - 1];
        dashboardState.data.facebook = dashboardState.data.yearlyData[mostRecentYear].facebook;
        dashboardState.data.instagram = dashboardState.data.yearlyData[mostRecentYear].instagram;
        dashboardState.data.youtube = dashboardState.data.yearlyData[mostRecentYear].youtube;
        dashboardState.data.email = dashboardState.data.yearlyData[mostRecentYear].email;
        dashboardState.data.googleAnalytics = dashboardState.data.yearlyData[mostRecentYear].googleAnalytics;
        dashboardState.data.crossChannel = dashboardState.data.yearlyData[mostRecentYear].crossChannel;

    } catch (error) {
        console.error('Error loading yearly data:', error);
        alert('Error loading yearly data. Please check the console for details.');
    }

    setLoading(false);
}

// Fetch data from JSON file
async function fetchData(filename) {
    try {
        const response = await fetch(`${DASHBOARD_CONFIG.dataPath}/${filename}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`Could not fetch ${filename}:`, error);
        throw error;
    }
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

// Render active dashboard
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
            renderMultiYearTrendsDashboard(dashboardState.data, dashboardState.selectedYears);
            break;
        case 'yoy':
            // Get current and previous year from selected years
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
            break;
        case 'converter':
            renderConverterDashboard();
            break;
    }
    function renderConverterDashboard() {
        const container = document.getElementById('converter-dashboard');

        if (!container) return;

        container.innerHTML = `
          <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">CSV to JSON Converter</h2>
            <p class="text-gray-600">Upload your marketing data CSV files to convert them to dashboard-ready JSON</p>
          </div>
          
          <div class="bg-white p-4 rounded-lg shadow mb-6">
            <h3 class="font-bold text-gray-800 mb-4">Upload Files</h3>
            
            <div class="flex flex-col space-y-4">
              <div class="file-upload-container">
                <label class="block text-sm font-medium text-gray-700 mb-1">Facebook Data</label>
                <input type="file" class="csv-file-input" data-type="facebook" accept=".csv">
              </div>
              
              <div class="file-upload-container">
                <label class="block text-sm font-medium text-gray-700 mb-1">Instagram Data</label>
                <input type="file" class="csv-file-input" data-type="instagram" accept=".csv">
              </div>
              
              <div class="file-upload-container">
                <label class="block text-sm font-medium text-gray-700 mb-1">Email Data</label>
                <input type="file" class="csv-file-input" data-type="email" accept=".csv">
              </div>
              
              <div class="file-upload-container">
                <label class="block text-sm font-medium text-gray-700 mb-1">YouTube Data</label>
                <input type="file" class="csv-file-input" data-type="youtube" accept=".csv">
              </div>
              
              <div class="file-upload-container">
                <label class="block text-sm font-medium text-gray-700 mb-1">Google Analytics Data</label>
                <input type="file" class="csv-file-input" data-type="googleAnalytics" accept=".csv">
              </div>
            </div>
            
            <div class="mt-4">
              <button id="process-files-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Process Files
              </button>
            </div>
          </div>
          
          <div id="results-container" class="hidden bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Conversion Results</h3>
            
            <div id="download-links" class="flex flex-col space-y-2">
              <!-- Download links will appear here -->
            </div>
            
            <div class="mt-4">
              <button id="download-all-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                Download All as ZIP
              </button>
            </div>
          </div>
        `;

        // Add event listeners
        document.getElementById('process-files-btn')?.addEventListener('click', processFiles);
        document.getElementById('download-all-btn')?.addEventListener('click', downloadZip);

        // Initialize converter state
        if (typeof initializeConverter === 'function') {
            initializeConverter();
        }
    }

}