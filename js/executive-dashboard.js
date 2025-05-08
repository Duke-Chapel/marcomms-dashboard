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

    // Render dashboard content
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Executive Summary</h2>
            <p class="text-gray-600">Performance overview across all marketing channels</p>
        </div>
        
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            ${renderKpiCard('Total Reach', formatNumber(data.crossChannel.reach?.total || 0), '+5.2%', 'positive')}
            ${renderKpiCard('Total Engagement', formatNumber(data.crossChannel.engagement?.total || 0), '+3.7%', 'positive')}
            ${renderKpiCard('Engagement Rate', formatPercentage(data.crossChannel.engagement_rate?.overall || 0), '-0.3%', 'negative')}
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

// Render channel performance chart
function renderChannelPerformanceChart(data) {
    const performanceTrend = data.crossChannel?.performance_trend || [];

    const chartData = {
        labels: performanceTrend.map(item => item.month),
        datasets: [
            {
                label: 'Facebook',
                data: performanceTrend.map(item => item.facebook),
                borderColor: DASHBOARD_CONFIG.colors.facebook,
                backgroundColor: 'transparent',
                tension: 0.4
            },
            {
                label: 'Instagram',
                data: performanceTrend.map(item => item.instagram),
                borderColor: DASHBOARD_CONFIG.colors.instagram,
                backgroundColor: 'transparent',
                tension: 0.4
            },
            {
                label: 'YouTube',
                data: performanceTrend.map(item => item.youtube),
                borderColor: DASHBOARD_CONFIG.colors.youtube,
                backgroundColor: 'transparent',
                tension: 0.4
            },
            {
                label: 'Email',
                data: performanceTrend.map(item => item.email),
                borderColor: DASHBOARD_CONFIG.colors.email,
                backgroundColor: 'transparent',
                tension: 0.4
            }
        ]
    };

    createLineChart('channel-performance-chart', chartData);
}

// Render attribution chart (removed fallback dummy data)
function renderAttributionChart(data) {
    // Get attribution data without fallback dummy data
    const attribution = data.crossChannel?.attribution || [];

    const chartData = {
        labels: attribution.map(item => item.name),
        datasets: [{
            data: attribution.map(item => item.value),
            backgroundColor: [
                '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8F00FF', '#FF5722'
            ]
        }]
    };

    createDoughnutChart('attribution-chart', chartData);
}

// Render content performance chart (removed fallback dummy data)
function renderContentPerformanceChart(data) {
    // Get content performance data without fallback dummy data
    const contentPerformance = data.crossChannel?.content_performance || [];
    
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
