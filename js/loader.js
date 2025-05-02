/**
 * Marketing Dashboard Data Loader
 * 
 * This file handles loading and processing data for the marketing dashboard.
 * It fetches data from JSON files, processes it, and updates the dashboard UI.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Check that DASHBOARD_CONFIG is available
    if (typeof DASHBOARD_CONFIG === "undefined") {
        showError("DASHBOARD_CONFIG is not defined! Check your script order in index.html.");
        return;
    }

    // Initialize dashboard with configuration
    initDashboard(DASHBOARD_CONFIG);
});

/**
 * Initialize the dashboard with configuration
 * @param {Object} config - Dashboard configuration object
 */
function initDashboard(config) {
    console.log("Initializing dashboard with config:", config);
    const dataPath = config.data.dataPath || './data'; // Default to relative path
    const platforms = config.data.platforms;
    const kpis = config.kpis;
    
    // Register event listeners
    registerEventListeners();
    
    // Load all data and update the UI
    loadAllData(dataPath, platforms)
        .then(platformData => {
            console.log("All data loaded:", platformData);
            
            // Process and display data
            populateKPIs(platformData, kpis);
            initializeCharts(platformData);
            populateTables(platformData);
            
            // Hide loading overlay when complete
            hideLoadingOverlay();
        })
        .catch(error => {
            console.error("Failed to load dashboard data:", error);
            showError("Failed to load dashboard data. Check console for details.");
            hideLoadingOverlay();
        });
        
    // Set up date range in header
    updateDateRangeText(config.general.defaultDateRange);
}

/**
 * Register event listeners for dashboard interactions
 */
function registerEventListeners() {
    // Date range selector
    const dateRangeSelector = document.querySelector('.date-range-selector');
    if (dateRangeSelector) {
        dateRangeSelector.addEventListener('click', function() {
            // Date range selection functionality would go here
            console.log("Date range selector clicked");
        });
    }
    
    // Filter dropdowns
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const button = this.closest('.dropdown').querySelector('.dropdown-toggle');
            if (button) {
                button.textContent = this.textContent;
                // Filter functionality would go here
                console.log("Filter selected:", this.textContent);
            }
        });
    });
    
    // Channel tab switching
    document.querySelectorAll('#channelTabs .nav-link').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            console.log("Channel tab changed to:", e.target.textContent);
            // Resize charts on tab change to fix rendering issues
            window.dispatchEvent(new Event('resize'));
        });
    });
}

/**
 * Load all data files for all enabled platforms
 * @param {string} dataPath - Path to data files
 * @param {Object} platforms - Platform configuration
 * @returns {Promise<Object>} - Promise resolving to platform data object
 */
async function loadAllData(dataPath, platforms) {
    const platformData = {};
    
    for (const [platform, settings] of Object.entries(platforms)) {
        if (!settings.enabled) {
            console.log(`Platform ${platform} is disabled, skipping.`);
            continue;
        }
        
        console.log(`Loading ${platform} data...`);
        platformData[platform] = {};
        
        for (const file of settings.dataFiles) {
            try {
                console.log(`Fetching ${file}...`);
                updateLoadingMessage(`Loading ${platform} data: ${file}`);
                
                const response = await fetch(`${dataPath}/${file}`);
                
                if (!response.ok) {
                    console.error(`HTTP error ${response.status} for ${file}`);
                    continue;
                }
                
                const data = await response.json();
                console.log(`Successfully loaded ${file}, found ${Array.isArray(data) ? data.length : 'non-array'} entries`);
                
                const key = file.replace(/\.json$/, "");
                platformData[platform][key] = data;
                
                // Add a small delay between requests to avoid overwhelming the server
                await new Promise(resolve => setTimeout(resolve, 50));
            } catch (error) {
                console.error(`Failed to load ${file}:`, error);
                // Continue with other files rather than failing completely
            }
        }
    }
    
    return platformData;
}

/**
 * Fetch a JSON file from the server
 * @param {string} dataPath - Path to data directory
 * @param {string} file - Filename to fetch
 * @returns {Promise<Object>} - Promise resolving to parsed JSON data
 */
async function fetchData(dataPath, file) {
    try {
        const response = await fetch(`${dataPath}/${file}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Failed to load ${file}:`, error);
        return null;
    }
}

/**
 * Populate all KPIs from loaded data
 * @param {Object} platformData - Loaded platform data
 * @param {Object} kpis - KPI configuration object
 */
function populateKPIs(platformData, kpis) {
    console.log("Populating KPIs...");
    
    // Helper function to find and format KPI value
    function findKpiValue(platform, metric, format) {
        let value = null;
        
        // Special case for social platforms (combining Facebook and Instagram)
        if (platform === 'social') {
            for (const socialPlatform of ['facebook', 'instagram']) {
                if (platformData[socialPlatform]) {
                    for (const dataset of Object.values(platformData[socialPlatform])) {
                        if (dataset && Array.isArray(dataset)) {
                            // Try to find metric in array data
                            for (const item of dataset) {
                                if (item && item[metric] !== undefined) {
                                    value = item[metric];
                                    break;
                                }
                            }
                        } else if (dataset && dataset[metric] !== undefined) {
                            value = dataset[metric];
                            break;
                        }
                    }
                }
                if (value !== null) break;
            }
        } 
        // Normal case for other platforms
        else if (platformData[platform]) {
            for (const dataset of Object.values(platformData[platform])) {
                // Handle array data (common in JSON exports)
                if (dataset && Array.isArray(dataset)) {
                    // Try to find metric in array data
                    for (const item of dataset) {
                        if (item && item[metric] !== undefined) {
                            value = item[metric];
                            break;
                        }
                    }
                } else if (dataset && dataset[metric] !== undefined) {
                    value = dataset[metric];
                    break;
                }
            }
        }
        
        // Format the value appropriately
        if (value !== null) {
            switch (format) {
                case 'number':
                    return formatNumber(value);
                case 'percentage':
                    return formatPercentage(value);
                case 'time':
                    return formatTime(value);
                default:
                    return value;
            }
        }
        
        return "--";
    }
    
    // Overview KPIs
    if (kpis.overview) {
        kpis.overview.forEach(kpi => {
            const value = findKpiValue(kpi.platform, kpi.metric, kpi.format);
            const el = document.getElementById(kpi.id);
            if (el) el.textContent = value;
            
            // Also update the change indicator if available
            const changeEl = document.getElementById(`${kpi.id}-change`);
            if (changeEl) {
                // This would normally be calculated from historical data
                // For now, we'll just keep the default value
            }
        });
    }
    
    // Web Analytics KPIs
    if (kpis.web) {
        kpis.web.forEach(kpi => {
            const value = findKpiValue('web', kpi.metric, kpi.format);
            const el = document.getElementById(kpi.id);
            if (el) el.textContent = value;
        });
    }
    
    // Facebook KPIs
    if (kpis.facebook) {
        kpis.facebook.forEach(kpi => {
            const value = findKpiValue('facebook', kpi.metric, kpi.format);
            const el = document.getElementById(kpi.id);
            if (el) el.textContent = value;
        });
    }
    
    // Instagram KPIs
    if (kpis.instagram) {
        kpis.instagram.forEach(kpi => {
            const value = findKpiValue('instagram', kpi.metric, kpi.format);
            const el = document.getElementById(kpi.id);
            if (el) el.textContent = value;
        });
    }
    
    // Email KPIs
    if (kpis.email) {
        kpis.email.forEach(kpi => {
            const value = findKpiValue('email', kpi.metric, kpi.format);
            const el = document.getElementById(kpi.id);
            if (el) el.textContent = value;
        });
    }
    
    // YouTube KPIs
    if (kpis.youtube) {
        kpis.youtube.forEach(kpi => {
            const value = findKpiValue('youtube', kpi.metric, kpi.format);
            const el = document.getElementById(kpi.id);
            if (el) el.textContent = value;
        });
    }
}

/**
 * Initialize all charts with data
 * @param {Object} platformData - Loaded platform data
 */
function initializeCharts(platformData) {
    console.log("Initializing charts...");
    
    // Initialize cross-channel performance chart (example)
    initCrossChannelChart(platformData);
    
    // Initialize web analytics charts
    if (platformData.web) {
        initTrafficSourcesChart(platformData.web);
        initDemographicsChart(platformData.web);
    }
    
    // Initialize Facebook charts
    if (platformData.facebook) {
        initFacebookDemographicsChart(platformData.facebook);
        initFacebookPostPerformanceChart(platformData.facebook);
    }
    
    // Initialize Instagram charts
    if (platformData.instagram) {
        initInstagramDemographicsChart(platformData.instagram);
        initInstagramPostPerformanceChart(platformData.instagram);
    }
    
    // Initialize Email charts
    if (platformData.email) {
        initEmailPerformanceChart(platformData.email);
        initEmailSubscribersChart(platformData.email);
    }
    
    // Initialize YouTube charts
    if (platformData.youtube) {
        initYouTubeDemographicsChart(platformData.youtube);
        initYouTubeGeographyChart(platformData.youtube);
    }
}

/**
 * Initialize cross-channel performance chart
 * @param {Object} platformData - Loaded platform data
 */
function initCrossChannelChart(platformData) {
    const ctx = document.getElementById('cross-channel-chart');
    if (!ctx) return;
    
    // Chart.js configuration
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Website',
                    data: generateDummyData(12),
                    borderColor: '#34A853',
                    backgroundColor: 'rgba(52, 168, 83, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Facebook',
                    data: generateDummyData(12),
                    borderColor: '#4267B2',
                    backgroundColor: 'rgba(66, 103, 178, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Instagram',
                    data: generateDummyData(12),
                    borderColor: '#C13584',
                    backgroundColor: 'rgba(193, 53, 132, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'YouTube',
                    data: generateDummyData(12),
                    borderColor: '#FF0000',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    tension: 0.3
                },
                {
                    label: 'Email',
                    data: generateDummyData(12),
                    borderColor: '#5851DB',
                    backgroundColor: 'rgba(88, 81, 219, 0.1)',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/**
 * Populate data tables with content
 * @param {Object} platformData - Loaded platform data
 */
function populateTables(platformData) {
    console.log("Populating tables...");
    
    // Top content table
    populateTopContentTable(platformData);
    
    // Web analytics tables
    if (platformData.web) {
        populateLandingPagesTable(platformData.web);
    }
    
    // Facebook tables
    if (platformData.facebook) {
        populateFacebookPostsTable(platformData.facebook);
    }
    
    // Instagram tables
    if (platformData.instagram) {
        populateInstagramPostsTable(platformData.instagram);
    }
    
    // Email tables
    if (platformData.email) {
        populateEmailCampaignsTable(platformData.email);
    }
    
    // YouTube tables
    if (platformData.youtube) {
        populateYouTubeVideosTable(platformData.youtube);
    }
}

/**
 * Populate top content table with data from all platforms
 * @param {Object} platformData - Loaded platform data
 */
function populateTopContentTable(platformData) {
    const tableEl = document.getElementById('top-content-table');
    if (!tableEl) return;
    
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Dummy data for now - this would be populated from actual data
    const topContent = [
        { title: 'Summer Sale Announcement', channel: 'Email', format: 'Newsletter', reach: '15,420', engagement: '4,210', ctr: '27.3%' },
        { title: 'Product Demo Video', channel: 'YouTube', format: 'Video', reach: '8,750', engagement: '2,340', ctr: '26.7%' },
        { title: 'Customer Success Story', channel: 'Facebook', format: 'Post', reach: '7,620', engagement: '1,950', ctr: '25.6%' },
        { title: 'Behind the Scenes Photo', channel: 'Instagram', format: 'Image', reach: '6,840', engagement: '1,730', ctr: '25.3%' },
        { title: 'Industry Trend Analysis', channel: 'Website', format: 'Blog Post', reach: '5,230', engagement: '890', ctr: '17.0%' }
    ];
    
    // Add rows to table
    topContent.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.channel}</td>
            <td>${item.format}</td>
            <td>${item.reach}</td>
            <td>${item.engagement}</td>
            <td>${item.ctr}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Populate Facebook posts table
 * @param {Object} fbData - Facebook data
 */
function populateFacebookPostsTable(fbData) {
    const tableEl = document.getElementById('fb-posts-table');
    if (!tableEl) return;
    
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Check if we have posts data
    if (!fbData.fb_posts || !Array.isArray(fbData.fb_posts)) {
        console.log("No Facebook posts data available");
        return;
    }
    
    // Sort posts by engagement (if available)
    const posts = [...fbData.fb_posts].sort((a, b) => {
        const aEngagement = a.reactions + a.comments + a.shares || 0;
        const bEngagement = b.reactions + b.comments + b.shares || 0;
        return bEngagement - aEngagement;
    }).slice(0, 10); // Get top 10
    
    // Add rows to table
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.description || 'No description'}</td>
            <td>${post.post_type || 'Unknown'}</td>
            <td>${formatDate(post.date)}</td>
            <td>${formatNumber(post.reach)}</td>
            <td>${formatNumber(post.reactions + post.comments + post.shares)}</td>
            <td>${formatNumber(post.reactions)}</td>
            <td>${formatNumber(post.comments)}</td>
            <td>${formatNumber(post.shares)}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Populate Instagram posts table
 * @param {Object} igData - Instagram data
 */
function populateInstagramPostsTable(igData) {
    const tableEl = document.getElementById('ig-posts-table');
    if (!tableEl) return;
    
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Check if we have posts data
    const postsData = igData.ig_posts;
    if (!postsData || !Array.isArray(postsData)) {
        console.log("No Instagram posts data available");
        return;
    }
    
    // Sort posts by engagement (likes + comments)
    const posts = [...postsData].sort((a, b) => {
        const aEngagement = (a.likes || 0) + (a.comments || 0);
        const bEngagement = (b.likes || 0) + (b.comments || 0);
        return bEngagement - aEngagement;
    }).slice(0, 10); // Get top 10
    
    // Add rows to table
    posts.forEach(post => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.description || 'No description'}</td>
            <td>${post.post_type || 'Unknown'}</td>
            <td>${formatDate(post.date)}</td>
            <td>${formatNumber(post.reach)}</td>
            <td>${formatNumber(post.likes)}</td>
            <td>${formatNumber(post.comments)}</td>
            <td>${formatNumber(post.saves)}</td>
            <td>${formatNumber(post.shares)}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Populate email campaigns table
 * @param {Object} emailData - Email data
 */
function populateEmailCampaignsTable(emailData) {
    const tableEl = document.getElementById('email-campaigns-table');
    if (!tableEl) return;
    
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Check if we have email campaign data
    const campaignsData = emailData.email_campaigns;
    if (!campaignsData || !Array.isArray(campaignsData)) {
        console.log("No email campaigns data available");
        return;
    }
    
    // Sort campaigns by open rate
    const campaigns = [...campaignsData].sort((a, b) => {
        return parseFloat(b.email_open_rate) - parseFloat(a.email_open_rate);
    }).slice(0, 10); // Get top 10
    
    // Add rows to table
    campaigns.forEach(campaign => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${campaign.campaign || 'Unnamed Campaign'}</td>
            <td>${formatDate(campaign.metric_date)}</td>
            <td>${formatNumber(campaign.emails_sent)}</td>
            <td>${formatNumber(campaign.email_deliveries)}</td>
            <td>${formatNumber(campaign.email_opened)}</td>
            <td>${campaign.email_open_rate}</td>
            <td>${formatNumber(campaign.email_clicked)}</td>
            <td>${campaign.email_click_rate}</td>
            <td>${formatNumber(campaign.email_bounces)}</td>
            <td>${formatNumber(campaign.email_unsubscribes)}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Update the date range text in the header
 * @param {number} days - Number of days in the range
 */
function updateDateRangeText(days) {
    const el = document.getElementById('date-range-text');
    if (el) {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);
        
        const formatOptions = { month: 'short', day: 'numeric' };
        const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
        const endFormatted = today.toLocaleDateString('en-US', formatOptions);
        
        el.textContent = `${startFormatted} - ${endFormatted}`;
    }
}

/**
 * Hide the loading overlay
 */
function hideLoadingOverlay() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        overlay.style.opacity = 0;
        setTimeout(() => {
            overlay.style.display = "none";
        }, 500);
    }
}

/**
 * Show an error message to the user
 * @param {string} message - Error message to display
 */
function showError(message) {
    alert(message);
    // A more sophisticated error UI could be implemented here
}

/**
 * Update loading message in the loading overlay
 * @param {string} message - Loading status message
 */
function updateLoadingMessage(message) {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) {
        // Check if message element exists, if not create it
        let messageEl = overlay.querySelector('.loading-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.className = 'loading-message';
            messageEl.style.marginTop = '20px';
            messageEl.style.color = '#3498db';
            overlay.appendChild(messageEl);
        }
        messageEl.textContent = message;
    }
}

/**
 * Format a number with thousands separators
 * @param {number|string} value - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(value) {
    if (value === undefined || value === null) return "--";
    
    // Parse value to number if it's a string
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(num)) return value;
    
    // Format with thousands separator
    return num.toLocaleString();
}

/**
 * Format a decimal as a percentage
 * @param {number|string} value - Value to format as percentage
 * @returns {string} - Formatted percentage
 */
function formatPercentage(value) {
    if (value === undefined || value === null) return "--";
    
    // Parse value to number if it's a string
    let num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(num)) return value;
    
    // If the value is already in percentage format (e.g. "42.3%"), return as is
    if (typeof value === 'string' && value.includes('%')) {
        return value;
    }
    
    // If the value is a decimal (e.g. 0.423), convert to percentage
    if (num < 1) {
        num = num * 100;
    }
    
    // Format with one decimal place and % sign
    return num.toFixed(1) + '%';
}

/**
 * Format a time value (seconds) as mm:ss or hh:mm:ss
 * @param {number|string} value - Time value in seconds
 * @returns {string} - Formatted time
 */
function formatTime(value) {
    if (value === undefined || value === null) return "--";
    
    // Parse value to number if it's a string
    const seconds = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(seconds)) return value;
    
    // Format as time
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Format a date string for display
 * @param {string} dateStr - Date string to format
 * @returns {string} - Formatted date
 */
function formatDate(dateStr) {
    if (!dateStr) return "--";
    
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

/**
 * Generate dummy data for demonstrations and testing
 * @param {number} count - Number of data points to generate
 * @param {number} min - Minimum value (default: 100)
 * @param {number} max - Maximum value (default: 1000)
 * @returns {Array<number>} - Array of random numbers
 */
function generateDummyData(count, min = 100, max = 1000) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min) + min)
    );
}

// For brevity, these functions are stubs - they would be implemented similarly to initCrossChannelChart
function initTrafficSourcesChart(webData) {
    const ctx = document.getElementById('traffic-sources-chart');
    if (!ctx) return;
    
    // Initialize chart with actual data when available
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Direct', 'Organic Search', 'Social', 'Referral', 'Email', 'Paid Search'],
            datasets: [{
                data: [30, 25, 15, 10, 12, 8],
                backgroundColor: [
                    '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8F00FF', '#FF5722'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function initDemographicsChart(webData) {
    const ctx = document.getElementById('demographics-chart');
    if (!ctx) return;
    
    // Initialize chart with dummy data for now
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'],
            datasets: [{
                label: 'Users',
                data: [15, 30, 25, 17, 8, 5],
                backgroundColor: '#34A853'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Stub functions for other charts - would be implemented with actual data
function initFacebookDemographicsChart(fbData) {}
function initFacebookPostPerformanceChart(fbData) {}
function initInstagramDemographicsChart(igData) {}
function initInstagramPostPerformanceChart(igData) {}
function initEmailPerformanceChart(emailData) {}
function initEmailSubscribersChart(emailData) {}
function initYouTubeDemographicsChart(ytData) {}
function initYouTubeGeographyChart(ytData) {}
function populateLandingPagesTable(webData) {}
function populateYouTubeVideosTable(ytData) {}