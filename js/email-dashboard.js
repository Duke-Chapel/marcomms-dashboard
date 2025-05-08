/**
 * Email Marketing Dashboard Component
 */
function renderEmailDashboard(data) {
    const container = document.getElementById('email-dashboard');

    // If no data, show message
    if (!data || !data.email) {
        container.innerHTML = `
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">No Data Available</h2>
                <p class="text-yellow-700">No data found for the email dashboard. Please ensure your data files are correctly formatted.</p>
            </div>
        `;
        return;
    }

    const emailData = data.email;
    const benchmarks = DASHBOARD_CONFIG.benchmarks.email;

    // Render dashboard content
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Email Marketing Analytics</h2>
            <p class="text-gray-600">Performance metrics for ${emailData.campaigns || 0} email campaigns</p>
        </div>
        
        <!-- Email Tabs -->
        <div class="mb-6">
            <div class="flex border-b">
                <button id="email-tab-performance" class="email-tab px-4 py-2 text-sm font-medium text-gray-800 border-b-2 border-gray-800">
                    Performance
                </button>
                <button id="email-tab-campaigns" class="email-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
                    Campaigns
                </button>
                <button id="email-tab-subscribers" class="email-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
                    Subscribers
                </button>
            </div>
        </div>
        
        <!-- Tab Content -->
        <div id="email-content-performance" class="email-content">
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                ${renderEmailKpiCard(
        'Open Rate',
        formatPercentage(emailData.openRate || 0),
        compareMetric(emailData.openRate, benchmarks.open_rate)
    )}
                ${renderEmailKpiCard(
        'Click Rate',
        formatPercentage(emailData.clickRate || 0),
        compareMetric(emailData.clickRate, benchmarks.click_rate)
    )}
                ${renderEmailKpiCard(
        'Bounce Rate',
        formatPercentage(emailData.bounceRate || 0),
        compareMetric(emailData.bounceRate, benchmarks.bounce_rate, true)
    )}
                ${renderEmailKpiCard(
        'Unsubscribe Rate',
        formatPercentage(emailData.unsubscribeRate || 0),
        compareMetric(emailData.unsubscribeRate, benchmarks.unsubscribe_rate, true)
    )}
            </div>
            
            <!-- Performance Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-bold text-gray-800 mb-4">Performance Trends</h3>
                    <div class="h-72">
                        <canvas id="email-performance-chart"></canvas>
                    </div>
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-bold text-gray-800 mb-4">Email Marketing Funnel</h3>
                    <div class="h-72">
                        <canvas id="email-funnel-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Performance Distribution -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Campaign Performance Distribution</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-md font-medium text-gray-700 mb-3">Open Rate Distribution</h4>
                        <div class="h-64">
                            <canvas id="open-rate-distribution-chart"></canvas>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="text-md font-medium text-gray-700 mb-3">Click Rate Distribution</h4>
                        <div class="h-64">
                            <canvas id="click-rate-distribution-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="email-content-campaigns" class="email-content hidden">
            <!-- Top Campaigns -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Top Performing Campaigns</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-md font-medium text-gray-700 mb-3">By Open Rate</h4>
                        ${renderTopCampaignsByOpenRate(emailData)}
                    </div>
                    
                    <div>
                        <h4 class="text-md font-medium text-gray-700 mb-3">By Click Rate</h4>
                        ${renderTopCampaignsByClickRate(emailData)}
                    </div>
                </div>
            </div>
            
            <!-- Campaign Comparison -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Campaign Comparison</h3>
                <div class="h-96">
                    <canvas id="campaign-comparison-chart"></canvas>
                </div>
            </div>
        </div>
        
        <div id="email-content-subscribers" class="email-content hidden">
            <!-- Subscriber Engagement -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Subscriber Engagement Analysis</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="col-span-1 md:col-span-2">
                        <h4 class="text-md font-medium text-gray-700 mb-3">Engagement Segments</h4>
                        <div class="h-72">
                            <canvas id="subscriber-segments-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="col-span-1">
                        <h4 class="text-md font-medium text-gray-700 mb-3">Engagement Definitions</h4>
                        <div class="space-y-3">
                            <div class="bg-purple-50 p-3 rounded-lg">
                                <div class="font-medium text-purple-800">Highly Engaged</div>
                                <div class="text-xs text-purple-700 mt-1">Opened or clicked in last 30 days</div>
                            </div>
                            <div class="bg-blue-50 p-3 rounded-lg">
                                <div class="font-medium text-blue-800">Engaged</div>
                                <div class="text-xs text-blue-700 mt-1">Opened or clicked in last 60 days</div>
                            </div>
                            <div class="bg-green-50 p-3 rounded-lg">
                                <div class="font-medium text-green-800">Occasional</div>
                                <div class="text-xs text-green-700 mt-1">Opened or clicked in last 90 days</div>
                            </div>
                            <div class="bg-yellow-50 p-3 rounded-lg">
                                <div class="font-medium text-yellow-800">Inactive</div>
                                <div class="text-xs text-yellow-700 mt-1">No activity in 90+ days</div>
                            </div>
                            <div class="bg-red-50 p-3 rounded-lg">
                                <div class="font-medium text-red-800">At Risk</div>
                                <div class="text-xs text-red-700 mt-1">No activity in 180+ days</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 class="font-medium text-green-800">List Growth Rate</h4>
                        <div class="text-2xl font-bold text-green-700 mt-1">+3.2%</div>
                        <p class="mt-2 text-sm text-green-700">
                            Monthly net growth (new subscribers minus unsubscribes)
                        </p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 class="font-medium text-blue-800">Retention Rate</h4>
                        <div class="text-2xl font-bold text-blue-700 mt-1">97.8%</div>
                        <p class="mt-2 text-sm text-blue-700">
                            Percentage of subscribers retained month-over-month
                        </p>
                    </div>
                    <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h4 class="font-medium text-purple-800">Active Subscribers</h4>
                        <div class="text-2xl font-bold text-purple-700 mt-1">75%</div>
                        <p class="mt-2 text-sm text-purple-700">
                            Subscribers who have opened or clicked in the last 90 days
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Key Insights -->
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Key Insights & Recommendations</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 class="font-medium text-purple-800">Open Rate Analysis</h4>
                    <p class="mt-2 text-sm text-purple-700">
                        Your average open rate of ${formatPercentage(emailData.openRate || 0)} is ${emailData.openRate > benchmarks.open_rate ? 'above' : 'below'} industry average (${formatPercentage(benchmarks.open_rate)}). 
                        ${emailData.openRate > benchmarks.open_rate
            ? 'Continue using compelling subject lines that have driven this success.'
            : 'Consider A/B testing different subject lines to improve open rates.'}
                    </p>
                </div>
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 class="font-medium text-blue-800">Click Performance</h4>
                    <p class="mt-2 text-sm text-blue-700">
                        Your click-to-open rate is ${formatPercentage((emailData.totalClicks / emailData.totalOpens * 100) || 0)}. 
                        Focus on improving email content with stronger CTAs and more compelling offers to drive higher engagement.
                    </p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h4 class="font-medium text-green-800">List Health</h4>
                    <p class="mt-2 text-sm text-green-700">
                        Your bounce rate (${formatPercentage(emailData.bounceRate || 0)}) is ${emailData.bounceRate > benchmarks.bounce_rate ? 'above' : 'below'} industry average.
                        ${emailData.bounceRate > benchmarks.bounce_rate
            ? 'Consider running a list cleaning campaign to remove invalid emails.'
            : 'Your list appears healthy - continue regular list maintenance.'}
                    </p>
                </div>
            </div>
        </div>
    `;

    // Add event listeners for email tabs
    document.querySelectorAll('.email-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            // Update active tab
            document.querySelectorAll('.email-tab').forEach(t => {
                t.classList.remove('text-gray-800', 'border-b-2', 'border-gray-800');
                t.classList.add('text-gray-500');
            });
            this.classList.remove('text-gray-500');
            this.classList.add('text-gray-800', 'border-b-2', 'border-gray-800');

            // Show relevant content
            const contentId = this.id.replace('email-tab-', 'email-content-');
            document.querySelectorAll('.email-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(contentId).classList.remove('hidden');

            // Render charts based on active tab
            renderEmailCharts(emailData, contentId);
        });
    });

    // Render initial charts
    renderEmailCharts(emailData, 'email-content-performance');
}

// Render email KPI card
function renderEmailKpiCard(title, value, comparison) {
    const comparisonClass = comparison.includes('above') ? 'text-green-500' : 'text-red-500';

    return `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-sm text-gray-500 font-medium">${title}</div>
            <div class="text-2xl font-bold mt-2">${value}</div>
            <div class="mt-1 text-xs ${comparisonClass}">
                ${comparison}
            </div>
        </div>
    `;
}

// Compare metric to benchmark
function compareMetric(value, benchmark, inverse = false) {
    if (!value) return 'No data available';

    const diff = value - benchmark;
    const percentDiff = (diff / benchmark * 100).toFixed(1);

    if ((diff > 0 && !inverse) || (diff < 0 && inverse)) {
        return `${Math.abs(percentDiff)}% above industry average`;
    } else if ((diff < 0 && !inverse) || (diff > 0 && inverse)) {
        return `${Math.abs(percentDiff)}% below industry average`;
    } else {
        return 'On par with industry average';
    }
}

// Render top campaigns by open rate
function renderTopCampaignsByOpenRate(emailData) {
    if (!emailData.campaigns || emailData.campaigns.length === 0) {
        return `<p class="text-gray-500">No campaign data available.</p>`;
    }

    // Sort campaigns by open rate
    const sortedCampaigns = [...emailData.campaigns]
        .sort((a, b) => b.openRate - a.openRate)
        .slice(0, 5);

    return `
<div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sortedCampaigns.map((campaign, index) => {
        return `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${truncateText(campaign.name || 'Unnamed Campaign', 30)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatPercentage(campaign.openRate || 0)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(campaign.sent || 0)}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render top campaigns by click rate
function renderTopCampaignsByClickRate(emailData) {
    if (!emailData.campaigns || emailData.campaigns.length === 0) {
        return `<p class="text-gray-500">No campaign data available.</p>`;
    }

    // Sort campaigns by click rate
    const sortedCampaigns = [...emailData.campaigns]
        .sort((a, b) => b.clickRate - a.clickRate)
        .slice(0, 5);

    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sortedCampaigns.map((campaign, index) => {
        return `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${truncateText(campaign.name || 'Unnamed Campaign', 30)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatPercentage(campaign.clickRate || 0)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(campaign.sent || 0)}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Render email charts
function renderEmailCharts(emailData, activeTab) {
    switch (activeTab) {
        case 'email-content-performance':
            renderEmailPerformanceChart(emailData);
            renderEmailFunnelChart(emailData);
            renderOpenRateDistributionChart(emailData);
            renderClickRateDistributionChart(emailData);
            break;
        case 'email-content-campaigns':
            renderCampaignComparisonChart(emailData);
            break;
        case 'email-content-subscribers':
            renderSubscriberSegmentsChart();
            break;
    }
}

// Render email performance chart
function renderEmailPerformanceChart(emailData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('email-performance-chart')) return;

    const performanceTrend = emailData?.performance_trend || [];

    const chartData = {
        labels: performanceTrend.map(item => item.month),
        datasets: [
            {
                label: 'Open Rate',
                data: performanceTrend.map(item => item.openRate),
                backgroundColor: 'rgba(88, 81, 219, 0.2)',
                borderColor: DASHBOARD_CONFIG.colors.email,
                borderWidth: 2,
                yAxisID: 'y-axis-1',
                tension: 0.4
            },
            {
                label: 'Click Rate',
                data: performanceTrend.map(item => item.clickRate),
                backgroundColor: 'rgba(123, 97, 255, 0.2)',
                borderColor: '#7b61ff',
                borderWidth: 2,
                yAxisID: 'y-axis-2',
                tension: 0.4
            }
        ]
    };

    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('email-performance-chart').getContext('2d'), {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y || 0;
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                    title: {
                        display: true,
                        text: 'Open Rate (%)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Click Rate (%)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Render email funnel chart
function renderEmailFunnelChart(emailData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('email-funnel-chart')) return;

    const funnelData = [
        { stage: 'Sent', value: emailData.totalSent || 0 },
        { stage: 'Delivered', value: emailData.totalDelivered || 0 },
        { stage: 'Opened', value: emailData.totalOpens || 0 },
        { stage: 'Clicked', value: emailData.totalClicks || 0 }
    ];

    const chartData = {
        labels: funnelData.map(item => item.stage),
        datasets: [{
            data: funnelData.map(item => item.value),
            backgroundColor: [
                'rgba(88, 81, 219, 0.8)',
                'rgba(88, 81, 219, 0.6)',
                'rgba(88, 81, 219, 0.4)',
                'rgba(88, 81, 219, 0.2)'
            ],
            borderWidth: 0
        }]
    };

    // Create horizontal bar chart for funnel
    createHorizontalBarChart('email-funnel-chart', chartData, {
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let value = context.raw || 0;
                        let total = funnelData[0].value;
                        let percentage = total > 0 ? (value / total * 100).toFixed(1) : 0;
                        return `${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        }
    });
}

// Render open rate distribution chart
function renderOpenRateDistributionChart(emailData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('open-rate-distribution-chart')) return;

    // Calculate distribution from actual data
    let distributionData = [];

    if (emailData && emailData.campaigns && emailData.campaigns.length > 0) {
        // Create buckets for open rate ranges
        const ranges = ['0-10%', '10-20%', '20-30%', '30-40%', '40-50%', '50%+'];
        const counts = [0, 0, 0, 0, 0, 0];

        // Count campaigns in each range
        emailData.campaigns.forEach(campaign => {
            const openRate = campaign.openRate || 0;
            if (openRate < 10) counts[0]++;
            else if (openRate < 20) counts[1]++;
            else if (openRate < 30) counts[2]++;
            else if (openRate < 40) counts[3]++;
            else if (openRate < 50) counts[4]++;
            else counts[5]++;
        });

        // Create distribution data
        distributionData = ranges.map((range, index) => ({
            range,
            count: counts[index]
        }));
    } else {
        // Default data if no campaigns available
        distributionData = [
            { range: '0-10%', count: 0 },
            { range: '10-20%', count: 0 },
            { range: '20-30%', count: 0 },
            { range: '30-40%', count: 0 },
            { range: '40-50%', count: 0 },
            { range: '50%+', count: 0 }
        ];
    }

    const chartData = {
        labels: distributionData.map(item => item.range),
        datasets: [{
            label: 'Number of Campaigns',
            data: distributionData.map(item => item.count),
            backgroundColor: 'rgba(88, 81, 219, 0.6)',
            borderColor: DASHBOARD_CONFIG.colors.email,
            borderWidth: 1
        }]
    };

    createBarChart('open-rate-distribution-chart', chartData);
}

// Render click rate distribution chart
function renderClickRateDistributionChart(emailData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('click-rate-distribution-chart')) return;

    // Calculate distribution from actual data
    let distributionData = [];

    if (emailData && emailData.campaigns && emailData.campaigns.length > 0) {
        // Create buckets for click rate ranges
        const ranges = ['0-2%', '2-4%', '4-6%', '6-8%', '8-10%', '10%+'];
        const counts = [0, 0, 0, 0, 0, 0];

        // Count campaigns in each range
        emailData.campaigns.forEach(campaign => {
            const clickRate = campaign.clickRate || 0;
            if (clickRate < 2) counts[0]++;
            else if (clickRate < 4) counts[1]++;
            else if (clickRate < 6) counts[2]++;
            else if (clickRate < 8) counts[3]++;
            else if (clickRate < 10) counts[4]++;
            else counts[5]++;
        });

        // Create distribution data
        distributionData = ranges.map((range, index) => ({
            range,
            count: counts[index]
        }));
    } else {
        // Default data if no campaigns available
        distributionData = [
            { range: '0-2%', count: 0 },
            { range: '2-4%', count: 0 },
            { range: '4-6%', count: 0 },
            { range: '6-8%', count: 0 },
            { range: '8-10%', count: 0 },
            { range: '10%+', count: 0 }
        ];
    }

    const chartData = {
        labels: distributionData.map(item => item.range),
        datasets: [{
            label: 'Number of Campaigns',
            data: distributionData.map(item => item.count),
            backgroundColor: 'rgba(123, 97, 255, 0.6)',
            borderColor: '#7b61ff',
            borderWidth: 1
        }]
    };

    createBarChart('click-rate-distribution-chart', chartData);
}

// Render campaign comparison chart
function renderCampaignComparisonChart(emailData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('campaign-comparison-chart')) return;

    // Get top 10 campaigns by sent volume
    const campaigns = emailData.campaigns || [];
    const topCampaigns = [...campaigns]
        .sort((a, b) => b.sent - a.sent)
        .slice(0, 10);

    const chartData = {
        labels: topCampaigns.map(campaign => truncateText(campaign.name || 'Unnamed Campaign', 20)),
        datasets: [
            {
                label: 'Open Rate',
                data: topCampaigns.map(campaign => campaign.openRate || 0),
                backgroundColor: 'rgba(88, 81, 219, 0.6)',
                borderColor: DASHBOARD_CONFIG.colors.email,
                borderWidth: 1,
                yAxisID: 'y-axis-percentage'
            },
            {
                label: 'Click Rate',
                data: topCampaigns.map(campaign => campaign.clickRate || 0),
                backgroundColor: 'rgba(123, 97, 255, 0.6)',
                borderColor: '#7b61ff',
                borderWidth: 1,
                yAxisID: 'y-axis-percentage'
            },
            {
                label: 'Emails Sent',
                data: topCampaigns.map(campaign => campaign.sent || 0),
                type: 'line',
                backgroundColor: 'transparent',
                borderColor: '#34A853',
                borderWidth: 2,
                yAxisID: 'y-axis-count'
            }
        ]
    };

    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('campaign-comparison-chart').getContext('2d'), {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            let value = context.parsed.y || 0;
                            if (label === 'Emails Sent') {
                                return `${label}: ${value.toLocaleString()}`;
                            }
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                'y-axis-percentage': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Rate (%)'
                    },
                    ticks: {
                        callback: function (value) {
                            return value + '%';
                        }
                    },
                    min: 0,
                    max: Math.max(
                        ...topCampaigns.map(c => c.openRate || 0),
                        ...topCampaigns.map(c => c.clickRate || 0),
                        30 // minimum max value
                    ) * 1.1 // add 10% padding
                },
                'y-axis-count': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Sent Count'
                    },
                    ticks: {
                        callback: function (value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Render subscriber segments chart
function renderSubscriberSegmentsChart() {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('subscriber-segments-chart')) return;

    // Default segments data
    const segmentsData = [
        { name: 'Highly Engaged', value: 35 },
        { name: 'Engaged', value: 25 },
        { name: 'Occasional', value: 15 },
        { name: 'Inactive', value: 15 },
        { name: 'At Risk', value: 10 }
    ];

    const chartData = {
        labels: segmentsData.map(item => item.name),
        datasets: [{
            data: segmentsData.map(item => item.value),
            backgroundColor: [
                '#9C27B0', // Purple
                '#3F51B5', // Indigo
                '#4CAF50', // Green
                '#FFC107', // Amber
                '#F44336'  // Red
            ],
            borderWidth: 0
        }]
    };

    createPieChart('subscriber-segments-chart', chartData);
}