/**
 * Main dashboard initialization and event handling
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize dashboard
    await initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

/**
 * Initialize the dashboard
 */
async function initializeDashboard() {
    // Show loading indicator
    showLoadingMessage('Loading dashboard data...');
    
    // Load data
    const success = await dataLoader.loadAllData();
    if (!success) {
        showError('Failed to load dashboard data. Please check the console for details.');
        return;
    }
    
    // Initialize charts
    dashboardCharts.initializeCharts();
    
    // Update dashboard with data
    updateDashboard();
    
    // Hide loading indicator
    hideLoadingMessage();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Date filter button
    document.getElementById('filter-btn').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (startDate && endDate) {
            dataLoader.setDateFilter(startDate, endDate);
            updateDashboard();
        } else {
            alert('Please select both start and end dates');
        }
    });
    
    // Tab change event for chart resizing
    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
        tab.addEventListener('shown.bs.tab', function() {
            // Resize charts when tab is shown
            window.dispatchEvent(new Event('resize'));
        });
    });
}

/**
 * Update dashboard with current data
 */
function updateDashboard() {
    // Get filtered data
    const gaData = dataLoader.getData('ga');
    const socialData = dataLoader.getData('social');
    const emailData = dataLoader.getData('email');
    const youtubeData = dataLoader.getData('youtube');
    const overview = dataLoader.data.overview;
    
    // Update last updated timestamp
    document.getElementById('last-updated').textContent = 
        `Last updated: ${dataLoader.getLastUpdated()}`;
    
    // Update overview metrics
    updateOverviewMetrics(overview, gaData, socialData, emailData, youtubeData);
    
    // Update charts
    dashboardCharts.updateCharts({
        ga: gaData,
        social: socialData,
        email: emailData,
        youtube: youtubeData
    });
    
    // Update tables
    updateTables(gaData, emailData);
}

/**
 * Update overview metric cards
 */
function updateOverviewMetrics(overview, gaData, socialData, emailData, youtubeData) {
    // Website metrics
    document.getElementById('total-sessions').textContent = formatNumber(overview.ga.total_sessions);
    document.getElementById('total-users').textContent = formatNumber(overview.ga.total_users);
    
    // Social media metrics
    document.getElementById('facebook-followers').textContent = formatNumber(overview.social.facebook_followers);
    document.getElementById('instagram-followers').textContent = formatNumber(overview.social.instagram_followers);
    
    // Email metrics
    document.getElementById('email-open-rate').textContent = formatPercentage(overview.email.avg_open_rate);
    document.getElementById('email-click-rate').textContent = formatPercentage(overview.email.avg_click_rate);
    
    // YouTube metrics
    document.getElementById('youtube-views').textContent = formatNumber(overview.youtube.total_views);
}

/**
 * Update data tables
 */
function updateTables(gaData, emailData) {
    // Update GA top pages table
    updateTopPagesTable(gaData);
    
    // Update email campaigns table
    updateCampaignsTable(emailData);
}

/**
 * Update top pages table
 */
function updateTopPagesTable(gaData) {
    const tableBody = document.querySelector('#top-pages-table tbody');
    tableBody.innerHTML = '';
    
    if (!gaData || !gaData.length) return;
    
    // Group by page
    const pageMap = {};
    
    gaData.forEach(item => {
        const page = item.page_path || '/';
        if (!pageMap[page]) {
            pageMap[page] = {
                sessions: 0,
                bounceRate: 0,
                count: 0
            };
        }
        
        pageMap[page].sessions += item.sessions || 0;
        pageMap[page].bounceRate += item.bounce_rate || 0;
        pageMap[page].count++;
    });
    
    // Convert to array and sort by sessions
    const pages = Object.keys(pageMap)
        .map(page => ({
            page,
            sessions: pageMap[page].sessions,
            bounceRate: pageMap[page].bounceRate / pageMap[page].count
        }))
        .sort((a, b) => b.sessions - a.sessions);
    
    // Add rows to table (top 10)
    pages.slice(0, 10).forEach(page => {
        const row = document.createElement('tr');
        
        const pageCell = document.createElement('td');
        pageCell.textContent = page.page;
        
        const sessionsCell = document.createElement('td');
        sessionsCell.textContent = formatNumber(page.sessions);
        
        const bounceRateCell = document.createElement('td');
        bounceRateCell.textContent = formatPercentage(page.bounceRate);
        
        row.appendChild(pageCell);
        row.appendChild(sessionsCell);
        row.appendChild(bounceRateCell);
        
        tableBody.appendChild(row);
    });
}

/**
 * Update email campaigns table
 */
function updateCampaignsTable(emailData) {
    const tableBody = document.querySelector('#campaigns-table tbody');
    tableBody.innerHTML = '';
    
    if (!emailData || !emailData.length) return;
    
    // Sort by campaign name
    const sortedCampaigns = [...emailData].sort((a, b) => 
        a.campaign.localeCompare(b.campaign));
    
    // Add rows to table
    sortedCampaigns.forEach(campaign => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = campaign.campaign;
        
        const sentCell = document.createElement('td');
        sentCell.textContent = formatNumber(campaign.sent);
        
        const openRateCell = document.createElement('td');
        openRateCell.textContent = formatPercentage(campaign.open_rate);
        
        const clickRateCell = document.createElement('td');
        clickRateCell.textContent = formatPercentage(campaign.click_rate);
        
        row.appendChild(nameCell);
        row.appendChild(sentCell);
        row.appendChild(openRateCell);
        row.appendChild(clickRateCell);
        
        tableBody.appendChild(row);
    });
}

/**
 * Show loading message
 */
function showLoadingMessage(message) {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.position = 'fixed';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '9999';
        
        const messageEl = document.createElement('div');
        messageEl.id = 'loading-message';
        messageEl.style.padding = '20px';
        messageEl.style.backgroundColor = '#fff';
        messageEl.style.borderRadius = '5px';
        messageEl.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
        
        loadingOverlay.appendChild(messageEl);
        document.body.appendChild(loadingOverlay);
    }
    
    document.getElementById('loading-message').textContent = message;
}

/**
 * Hide loading message
 */
function hideLoadingMessage() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Show error message
 */
function showError(message) {
    alert(message);
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toLocaleString();
}

/**
 * Format percentage
 */
function formatPercentage(value) {
    return (value * 100).toFixed(1) + '%';
}