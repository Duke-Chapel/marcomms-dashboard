/**
 * Main Dashboard Logic
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initDashboard();
});

// Dashboard state
const dashboardState = {
    timeframe: DASHBOARD_CONFIG.defaultTimeframe,
    activeDashboard: 'executive',
    data: {},
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
    timeframeSelector.value = dashboardState.timeframe;
    timeframeSelector.addEventListener('change', function() {
        dashboardState.timeframe = this.value;
        loadAllData();
    });
    
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
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
        // Load data for each platform
        dashboardState.data.facebook = await fetchData('facebook_data.json');
        dashboardState.data.instagram = await fetchData('instagram_data.json');
        dashboardState.data.youtube = await fetchData('youtube_data.json');
        dashboardState.data.email = await fetchData('email_data.json');
        dashboardState.data.crossChannel = await fetchData('cross_channel_data.json');
        
        // Update last updated timestamp
        const lastUpdatedEl = document.getElementById('last-updated');
        if (dashboardState.data.crossChannel && dashboardState.data.crossChannel.meta) {
            const lastUpdated = new Date(dashboardState.data.crossChannel.meta.last_updated);
            lastUpdatedEl.textContent = lastUpdated.toLocaleString();
        } else {
            lastUpdatedEl.textContent = new Date().toLocaleString();
        }
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Error loading dashboard data. Please check the console for details.');
    }
    
    setLoading(false);
}

// Fetch data from JSON file
async function fetchData(filename) {
    const response = await fetch(`${DASHBOARD_CONFIG.dataPath}/${filename}`);
    if (!response.ok) {
        throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

// Set loading state
function setLoading(isLoading) {
    dashboardState.isLoading = isLoading;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (isLoading) {
        loadingIndicator.classList.remove('hidden');
    } else {
        loadingIndicator.classList.add('hidden');
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
    }
}

// Format number with thousands separator
function formatNumber(value) {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString();
}

// Format percentage
function formatPercentage(value) {
    if (value === undefined || value === null) return '0%';
    return `${value.toFixed(2)}%`;
}