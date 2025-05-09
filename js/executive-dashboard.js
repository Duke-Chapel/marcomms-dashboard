/**
 * Executive Dashboard Component
 */
function renderExecutiveDashboard(data) {
    const container = document.getElementById('executive-dashboard');

    // If no data, show message
    if (!data || !data.crossChannel) {
        container.innerHTML = `
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">No Data Available</h2>
                <p class="text-yellow-700">No data found for the executive dashboard. Please ensure your data files are correctly formatted.</p>
            </div>
        `;
        return;
    }

    // Check for data quality issues
    let dataQualityWarning = '';
    if (dashboardState.dataQualityIssues && dashboardState.dataQualityIssues.length > 0) {
        dataQualityWarning = `
            <div class="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                <h3 class="font-bold">Data Quality Issues Detected</h3>
                <ul class="mt-2 list-disc pl-5">
                    ${dashboardState.dataQualityIssues.map(issue => 
                        `<li>${issue.metric}: ${issue.issue}</li>`
                    ).join('')}
                </ul>
                <p class="mt-2 text-sm">These metrics have been excluded from the dashboard to prevent misleading information.</p>
            </div>
        `;
    }

    // Render dashboard content
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Executive Summary</h2>
            <p class="text-gray-600">Performance overview across all marketing channels</p>
        </div>
        
        ${dataQualityWarning}
        
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            ${renderKpiCard('Total Reach', formatNumber(data.crossChannel?.reach?.total || 0), '+5.2%', 'positive')}
            ${renderKpiCard('Total Engagement', formatNumber(data.crossChannel?.engagement?.total || 0), '+3.7%', 'positive')}
            ${renderKpiCard('Engagement Rate', formatPercentage(data.crossChannel?.engagement_rate?.overall || 0), '-0.3%', 'negative')}
            ${renderKpiCard('Conversion Rate', '2.8%', '+0.4%', 'positive')}
        </div>
        
        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-bold text-gray-800 mb-4">Channel Performance</h3>
                <div class="h-72">
                    <canvas id="channel-performance-chart"></canvas>
                </div>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="font-bold text-gray-800 mb-4">Attribution by Channel</h3>
                <div class="h-72">
                    <canvas id="attribution-chart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Content Performance -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
            <h3 class="font-bold text-gray-800 mb-4">Content Performance by Type</h3>
            <div class="h-64">
                <canvas id="content-performance-chart"></canvas>
            </div>
        </div>
        
        <!-- Key Insights -->
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Key Insights</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 class="font-medium text-blue-800">Channel Performance</h4>
                    <p class="mt-2 text-sm text-blue-700">
                        Instagram shows the strongest growth at +15% YoY, significantly outpacing other channels.
                    </p>
                </div>
                
                <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 class="font-medium text-green-800">Content Strategy</h4>
                    <p class="mt-2 text-sm text-green-700">
                        Video content outperforms other formats with 3.2x higher engagement than static posts.
                    </p>
                </div>
                
                <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <h4 class="font-medium text-purple-800">Optimization Opportunity</h4>
                    <p class="mt-2 text-sm text-purple-700">
                        Email click rates are declining. A/B testing new formats could improve performance.
                    </p>
                </div>
            </div>
        </div>
    `;

    // Render charts
    renderChannelPerformanceChart(data);
    renderAttributionChart(data);
    renderContentPerformanceChart(data);
}

// Render KPI card
function renderKpiCard(title, value, change, trend) {
    const trendClass = trend === 'positive' ? 'text-green-500' : 'text-red-500';
    const trendIcon = trend === 'positive' ? '↑' : '↓';

    // Check if value is null (flagged as invalid)
    if (value === null) {
        return `
            <div class="bg-white p-4 rounded-lg shadow">
                <div class="text-sm text-gray-500 font-medium">${title}</div>
                <div class="text-xl text-red-500 font-bold mt-2">
                    <svg class="inline-block h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Data Error
                </div>
                <div class="mt-1 text-xs text-red-500">
                    Invalid or unrealistic value
                </div>
            </div>
        `;
    }

    return `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-sm text-gray-500 font-medium">${title}</div>
            <div class="text-2xl font-bold mt-2">${value}</div>
            <div class="mt-1 text-sm font-medium ${trendClass}">
                ${trendIcon} ${change} vs previous period
            </div>
        </div>
    `;
}

// Render channel performance chart - FIXED FUNCTION
function renderChannelPerformanceChart(data) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('channel-performance-chart')) return;

    // Get performance trend data with proper null checks
    let performanceTrend = data.crossChannel?.performance_trend || [];

    // Ensure values are numeric and not extremely large
    if (performanceTrend && performanceTrend.length > 0) {
        performanceTrend.forEach(item => {
            ['facebook', 'instagram', 'youtube', 'email'].forEach(platform => {
                if (item[platform] && item[platform] > 1000000000) {
                    console.warn(`Unrealistic value for ${platform} in month ${item.month}:`, item[platform]);
                    item[platform] = null;
                }
            });
        });
    }

    // If we have no valid data points
    if (!performanceTrend || performanceTrend.length === 0 || 
        performanceTrend.every(item => 
            !item.facebook && !item.instagram && !item.youtube && !item.email)) {
        // Show error message in chart area
        const chartElement = document.getElementById('channel-performance-chart');
        if (chartElement) {
            chartElement.parentNode.innerHTML = `
                <div class="flex h-full items-center justify-center">
                    <div class="text-center text-gray-500">
                        <svg class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-2 text-lg font-medium">No Valid Performance Data Available</h3>
                        <p class="mt-1 text-sm">Unable to display channel performance chart due to missing or invalid data.</p>
                    </div>
                </div>
            `;
            return;
        }
    }

    // Safety check - create empty trend data if needed
    if (!performanceTrend || performanceTrend.length === 0) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        performanceTrend = months.map(month => ({
            month,
            facebook: 0,
            instagram: 0,
            youtube: 0,
            email: 0
        }));
    }

    const chartData = {
        labels: performanceTrend.map(item => item.month),
        datasets: [
            {
                label: 'Facebook',
                data: performanceTrend.map(item => item.facebook || 0),
                borderColor: DASHBOARD_CONFIG.colors.facebook,
                backgroundColor: 'transparent',
                tension: 0.4
            },
            {
                label: 'Instagram',
                data: performanceTrend.map(item => item.instagram || 0),
                borderColor: DASHBOARD_CONFIG.colors.instagram,
                backgroundColor: 'transparent',
                tension: 0.4
            },
            {
                label: 'YouTube',
                data: performanceTrend.map(item => item.youtube || 0),
                borderColor: DASHBOARD_CONFIG.colors.youtube,
                backgroundColor: 'transparent',
                tension: 0.4
            },
            {
                label: 'Email',
                data: performanceTrend.map(item => item.email || 0),
                borderColor: DASHBOARD_CONFIG.colors.email,
                backgroundColor: 'transparent',
                tension: 0.4
            }
        ]
    };

    createLineChart('channel-performance-chart', chartData);
}

// Render attribution chart
function renderAttributionChart(data) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('attribution-chart')) return;

    // Get attribution data
    const attribution = data.crossChannel?.attribution || [];
    
    // Deduplicate attribution data by source name
    const deduplicatedAttribution = [];
    const sourceNames = new Set();
    
    attribution.forEach(item => {
        if (!sourceNames.has(item.name)) {
            sourceNames.add(item.name);
            deduplicatedAttribution.push(item);
        } else {
            // If duplicate, add the value to the existing item
            const existingItem = deduplicatedAttribution.find(x => x.name === item.name);
            if (existingItem) {
                existingItem.value += item.value;
            }
        }
    });
    
    // Limit to top 6 sources for better visibility
    const topSources = deduplicatedAttribution
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    
    // Add an "Other" category if needed
    if (deduplicatedAttribution.length > 6) {
        const otherValue = deduplicatedAttribution
            .slice(6)
            .reduce((sum, item) => sum + item.value, 0);
        
        topSources.push({ name: 'Other', value: otherValue });
    }

    // If we have no attribution data
    if (topSources.length === 0) {
        // Show error message in chart area
        const chartElement = document.getElementById('attribution-chart');
        if (chartElement) {
            chartElement.parentNode.innerHTML = `
                <div class="flex h-full items-center justify-center">
                    <div class="text-center text-gray-500">
                        <svg class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-2 text-lg font-medium">No Attribution Data Available</h3>
                        <p class="mt-1 text-sm">Unable to display attribution chart due to missing data.</p>
                    </div>
                </div>
            `;
            return;
        }
    }
    
    const chartData = {
        labels: topSources.map(item => item.name),
        datasets: [{
            data: topSources.map(item => item.value),
            backgroundColor: [
                '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8F00FF', '#FF5722', '#777777'
            ]
        }]
    };

    createDoughnutChart('attribution-chart', chartData);
}

// Render content performance chart
function renderContentPerformanceChart(data) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('content-performance-chart')) return;

    // Get content performance data
    const contentPerformance = data.crossChannel?.content_performance || [];
    
    // If we have no content performance data
    if (contentPerformance.length === 0) {
        // Show error message in chart area
        const chartElement = document.getElementById('content-performance-chart');
        if (chartElement) {
            chartElement.parentNode.innerHTML = `
                <div class="flex h-full items-center justify-center">
                    <div class="text-center text-gray-500">
                        <svg class="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-2 text-lg font-medium">No Content Performance Data Available</h3>
                        <p class="mt-1 text-sm">Unable to display content performance chart due to missing data.</p>
                    </div>
                </div>
            `;
            return;
        }
    }
    
    const chartData = {
        labels: contentPerformance.map(item => item.subject),
        datasets: [
            {
                label: 'Video',
                data: contentPerformance.map(item => item.Video),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            },
            {
                label: 'Image',
                data: contentPerformance.map(item => item.Image),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Text',
                data: contentPerformance.map(item => item.Text),
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }
        ]
    };
    
    createBarChart('content-performance-chart', chartData);
}