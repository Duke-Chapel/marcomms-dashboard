/**
 * YouTube Dashboard Component
 */
function renderYoutubeDashboard(data) {
    const container = document.getElementById('youtube-dashboard');

    // If no data, show message
    if (!data || !data.youtube) {
        container.innerHTML = `
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">No Data Available</h2>
                <p class="text-yellow-700">No data found for the YouTube dashboard. Please ensure your data files are correctly formatted.</p>
            </div>
        `;
        return;
    }

    const youtubeData = data.youtube;

    // Render dashboard content
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                <svg class="w-8 h-8 mr-2 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
                YouTube Analytics
            </h2>
            <p class="text-gray-600">Performance metrics for your YouTube channel</p>
        </div>
        
        <!-- YouTube Tabs -->
        <div class="mb-6">
            <div class="flex border-b">
                <button id="youtube-tab-audience" class="youtube-tab px-4 py-2 text-sm font-medium text-gray-800 border-b-2 border-gray-800">
                    Audience
                </button>
                <button id="youtube-tab-geography" class="youtube-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
                    Geography
                </button>
                <button id="youtube-tab-engagement" class="youtube-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
                    Engagement
                </button>
            </div>
        </div>
        
        <!-- Tab Content -->
        <div id="youtube-content-audience" class="youtube-content">
            <!-- KPI Cards -->
            <div class="kpi-summary grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <div class="text-sm text-gray-500 font-medium">Total Views</div>
                    <div class="text-2xl font-bold mt-2">${formatNumber(youtubeData.totalViews || 0)}</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <div class="text-sm text-gray-500 font-medium">Watch Time (hours)</div>
                    <div class="text-2xl font-bold mt-2">${formatNumber(Math.round(youtubeData.totalWatchTime || 0))}</div>
                </div>
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <div class="text-sm text-gray-500 font-medium">Average View Duration</div>
                    <div class="text-2xl font-bold mt-2">${youtubeData.averageViewDuration || '0:00'}</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Age Demographics Chart -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Age Demographics</h3>
                    <div class="h-72">
                        <canvas id="youtube-age-chart"></canvas>
                    </div>
                </div>
                
                <!-- Gender Demographics Chart -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Gender Distribution</h3>
                    <div class="h-72">
                        <canvas id="youtube-gender-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Subscription Status -->
            <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Subscription Status</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="h-72 col-span-1">
                        <canvas id="youtube-subscription-chart"></canvas>
                    </div>
                    
                    <div class="col-span-2">
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-medium text-gray-800 mb-3">Subscriber Insights</h4>
                            
                            <div class="space-y-4">
                                <div>
                                    <div class="text-sm font-medium text-gray-700">
                                        Subscriber Retention Rate
                                    </div>
                                    <div class="flex items-center mt-1">
                                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                                            <div class="bg-red-600 h-2.5 rounded-full" style="width: '${calculateSubscriberPercentage(youtubeData)}%'"></div>
                                        </div>
                                        <span class="ml-2 text-sm font-medium text-gray-700">${calculateSubscriberPercentage(youtubeData)}%</span>
                                    </div>
                                    <p class="text-xs text-gray-600 mt-1">
                                        Percentage of total viewers who are subscribed
                                    </p>
                                </div>
                                
                                <div>
                                    <div class="text-sm font-medium text-gray-700">
                                        Subscriber Engagement
                                    </div>
                                    <p class="text-sm text-gray-600 mt-1">
                                        Subscribers watch <span class="font-medium">46.3%</span> longer than non-subscribers on average
                                    </p>
                                </div>
                                
                                <div>
                                    <div class="text-sm font-medium text-gray-700">
                                        Subscription Opportunity
                                    </div>
                                    <p class="text-sm text-gray-600 mt-1">
                                        Focus on converting the <span class="font-medium">${(100 - calculateSubscriberPercentage(youtubeData)).toFixed(1)}%</span> non-subscribed viewers who are already engaging with content
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="youtube-content-geography" class="youtube-content hidden">
            <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Top 10 Countries by Views</h3>
                <div class="h-96">
                    <canvas id="youtube-geo-chart"></canvas>
                </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <!-- Average View Duration by Country -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Average View Duration by Country</h3>
                    <div class="h-72">
                        <canvas id="youtube-duration-chart"></canvas>
                    </div>
                </div>
                
                <!-- Views vs Watch Time Distribution -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Views vs Watch Time Distribution</h3>
                    <div class="h-72">
                        <canvas id="youtube-distribution-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Geographic Insights -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h3 class="font-bold text-gray-800 mb-4">Geographic Insights</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-red-50 p-4 rounded-lg border border-red-100">
                        <h4 class="font-medium text-red-800">Top Viewing Countries</h4>
                        <p class="mt-2 text-red-700">
                            ${renderTopCountriesSummary(youtubeData)}
                        </p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 class="font-medium text-gray-800">Engagement Hotspots</h4>
                        <p class="mt-2 text-gray-700">
                            ${renderEngagementHotspots(youtubeData)}
                        </p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 class="font-medium text-blue-800">Growth Opportunities</h4>
                        <p class="mt-2 text-blue-700">
                            Consider creating localized content for high-engagement markets to boost viewership.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        <div id="youtube-content-engagement" class="youtube-content hidden">
            <!-- Engagement Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <!-- Average Percentage Viewed by Age -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Average Percentage Viewed by Age</h3>
                    <div class="h-72">
                        <canvas id="youtube-retention-age-chart"></canvas>
                    </div>
                </div>
                
                <!-- Watch Time Distribution -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h3 class="font-bold text-gray-800 mb-4">Watch Time Distribution by Age</h3>
                    <div class="h-72">
                        <canvas id="youtube-watchtime-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Performance Trend -->
            <div class="bg-white p-4 rounded-lg shadow-sm mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Performance Trend</h3>
                <div class="h-72">
                    <canvas id="youtube-performance-chart"></canvas>
                </div>
            </div>
            
            <!-- Engagement Recommendations -->
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h3 class="font-bold text-gray-800 mb-4">Engagement Opportunities</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-red-50 p-4 rounded-lg border border-red-100">
<h4 class="font-medium text-red-800">Subscription Growth</h4>
                        <p class="mt-2 text-sm text-red-700">
                            Add consistent end-screen subscription CTAs targeting the ${(100 - calculateSubscriberPercentage(youtubeData)).toFixed(1)}% non-subscribed viewers, especially focusing on the 25-34 age group.
                        </p>
                    </div>
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 class="font-medium text-blue-800">Content Length Optimization</h4>
                        <p class="mt-2 text-sm text-blue-700">
                            Create longer-form content for older demographics (55+) who show significantly higher average view durations.
                        </p>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h4 class="font-medium text-green-800">Audience Targeting</h4>
                        <p class="mt-2 text-sm text-green-700">
                            Focus promotional efforts on markets where viewers show the highest engagement with current content.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add event listeners for YouTube tabs
    document.querySelectorAll('.youtube-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            // Update active tab
            document.querySelectorAll('.youtube-tab').forEach(t => {
                t.classList.remove('text-gray-800', 'border-b-2', 'border-gray-800');
                t.classList.add('text-gray-500');
            });
            this.classList.remove('text-gray-500');
            this.classList.add('text-gray-800', 'border-b-2', 'border-gray-800');

            // Show relevant content
            const contentId = this.id.replace('youtube-tab-', 'youtube-content-');
            document.querySelectorAll('.youtube-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(contentId).classList.remove('hidden');

            // Render charts based on active tab
            renderYoutubeCharts(youtubeData, contentId);
        });
    });

    // Render initial charts
    renderYoutubeCharts(youtubeData, 'youtube-content-audience');
}

// Helper function to calculate subscriber percentage
function calculateSubscriberPercentage(youtubeData) {
    if (!youtubeData || !youtubeData.subscriptionStatus) return '0.0';

    const subscribers = youtubeData.subscriptionStatus.find(status => status.status === 'Subscribed');
    const totalViews = youtubeData.totalViews || 0;

    if (!subscribers || totalViews === 0) return '0.0';

    return ((subscribers.views / totalViews) * 100).toFixed(1);
}

// Helper function to render top countries summary
function renderTopCountriesSummary(youtubeData) {
    if (!youtubeData || !youtubeData.geography || youtubeData.geography.length === 0) {
        return 'No geographic data available.';
    }

    const top3 = youtubeData.geography.slice(0, 3);
    const totalViews = youtubeData.totalViews || 0;

    if (totalViews === 0) return 'No view data available.';

    const percentages = top3.map(country => {
        const percentage = ((country.views / totalViews) * 100).toFixed(1);
        return `${country.country} (${percentage}%)`;
    });

    return percentages.join(', ') + ' account for the majority of your views.';
}

// Helper function to render engagement hotspots
function renderEngagementHotspots(youtubeData) {
    if (!youtubeData || !youtubeData.geography || youtubeData.geography.length === 0) {
        return 'No geographic engagement data available.';
    }

    // Sort by average view duration (approximating engagement)
    const sortedByEngagement = [...youtubeData.geography]
        .sort((a, b) => {
            const durationA = convertDurationToMinutes(a.averageDuration || '0:00');
            const durationB = convertDurationToMinutes(b.averageDuration || '0:00');
            return durationB - durationA;
        })
        .slice(0, 3);

    return sortedByEngagement.map(country => country.country).join(', ') + ' show the highest average view durations, indicating strong engagement in these regions.';
}

// Helper function to convert duration string (MM:SS) to minutes
function convertDurationToMinutes(duration) {
    const parts = duration.split(':');
    if (parts.length === 2) {
        return parseFloat(parts[0]) + parseFloat(parts[1]) / 60;
    } else if (parts.length === 3) {
        return parseFloat(parts[0]) * 60 + parseFloat(parts[1]) + parseFloat(parts[2]) / 60;
    }
    return 0;
}

// Render YouTube charts
function renderYoutubeCharts(youtubeData, activeTab) {
    switch (activeTab) {
        case 'youtube-content-audience':
            renderYoutubeAgeChart(youtubeData);
            renderYoutubeGenderChart(youtubeData);
            renderYoutubeSubscriptionChart(youtubeData);
            break;
        case 'youtube-content-geography':
            renderYoutubeGeoChart(youtubeData);
            renderYoutubeDurationChart(youtubeData);
            renderYoutubeDistributionChart(youtubeData);
            break;
        case 'youtube-content-engagement':
            renderYoutubeRetentionAgeChart(youtubeData);
            renderYoutubeWatchtimeChart(youtubeData);
            renderYoutubePerformanceChart(youtubeData);
            break;
    }
}

// Render YouTube age demographics chart
function renderYoutubeAgeChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-age-chart')) return;

    const ageDemo = youtubeData?.demographics?.age || [];

    const chartData = {
        labels: ageDemo.map(item => item.group),
        datasets: [
            {
                label: 'Views',
                data: ageDemo.map(item => item.viewPercentage || 0),
                backgroundColor: 'rgba(255, 0, 0, 0.6)',
                borderColor: DASHBOARD_CONFIG.colors.youtube,
                borderWidth: 1
            }
        ]
    };

    createBarChart('youtube-age-chart', chartData, {
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        let value = context.parsed.y || 0;
                        return `${label}: ${value.toFixed(1)}%`;
                    }
                }
            }
        }
    });
}

// Render YouTube gender demographics chart
function renderYoutubeGenderChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-gender-chart')) return;

    const genderDemo = youtubeData?.demographics?.gender || [];

    const chartData = {
        labels: genderDemo.map(item => item.group),
        datasets: [
            {
                data: genderDemo.map(item => item.viewPercentage || 0),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)', // Male - blue
                    'rgba(255, 99, 132, 0.6)', // Female - pink
                    'rgba(255, 206, 86, 0.6)'  // Other - yellow
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    createPieChart('youtube-gender-chart', chartData);
}

// Render YouTube subscription status chart
function renderYoutubeSubscriptionChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-subscription-chart')) return;

    const subscriptionData = youtubeData?.subscriptionStatus || [
        { status: 'Subscribed', views: 0, percentage: 0 },
        { status: 'Not subscribed', views: 0, percentage: 0 }
    ];

    const chartData = {
        labels: subscriptionData.map(item => item.status),
        datasets: [{
            data: subscriptionData.map(item => item.views),
            backgroundColor: [
                'rgba(255, 0, 0, 0.6)', // Subscribed - red
                'rgba(200, 200, 200, 0.6)' // Not subscribed - gray
            ],
            borderColor: [
                DASHBOARD_CONFIG.colors.youtube,
                '#aaaaaa'
            ],
            borderWidth: 1
        }]
    };

    createDoughnutChart('youtube-subscription-chart', chartData);
}

// Render YouTube geography chart
function renderYoutubeGeoChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-geo-chart')) return;

    const geoData = youtubeData?.geography || [];
    const top10Countries = geoData.slice(0, 10);

    const chartData = {
        labels: top10Countries.map(item => item.country),
        datasets: [
            {
                label: 'Views',
                data: top10Countries.map(item => item.views),
                backgroundColor: 'rgba(255, 0, 0, 0.6)',
                borderColor: DASHBOARD_CONFIG.colors.youtube,
                borderWidth: 1
            },
            {
                label: 'Watch Time (hours)',
                data: top10Countries.map(item => item.watchTime),
                backgroundColor: 'rgba(178, 34, 34, 0.6)',
                borderColor: '#b22222',
                borderWidth: 1
            }
        ]
    };

    createHorizontalBarChart('youtube-geo-chart', chartData);
}

// Render YouTube average duration by country chart
function renderYoutubeDurationChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-duration-chart')) return;

    const geoData = youtubeData?.geography || [];
    const top10Countries = geoData.slice(0, 10);

    const chartData = {
        labels: top10Countries.map(item => item.country),
        datasets: [{
            label: 'Average View Duration (minutes)',
            data: top10Countries.map(item => convertDurationToMinutes(item.averageDuration || '0:00')),
            backgroundColor: 'rgba(255, 0, 0, 0.6)',
            borderColor: DASHBOARD_CONFIG.colors.youtube,
            borderWidth: 1
        }]
    };

    createBarChart('youtube-duration-chart', chartData, {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const minutes = Math.floor(context.parsed.y);
                        const seconds = Math.round((context.parsed.y - minutes) * 60);
                        return `Average Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                }
            }
        }
    });
}

// Render YouTube views vs watch time distribution chart
function renderYoutubeDistributionChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-distribution-chart')) return;

    const geoData = youtubeData?.geography || [];
    const top5Countries = geoData.slice(0, 5);

    const viewsData = {
        labels: top5Countries.map(item => item.country),
        datasets: [{
            data: top5Countries.map(item => item.views),
            backgroundColor: [
                'rgba(255, 0, 0, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ],
            borderWidth: 1
        }]
    };

    const watchTimeData = {
        labels: top5Countries.map(item => item.country),
        datasets: [{
            data: top5Countries.map(item => item.watchTime),
            backgroundColor: [
                'rgba(255, 0, 0, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ],
            borderWidth: 1
        }]
    };

    createPieChart('youtube-distribution-chart', viewsData);
}

// Render YouTube retention by age chart
function renderYoutubeRetentionAgeChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-retention-age-chart')) return;

    const ageDemo = youtubeData?.demographics?.age || [];

    const chartData = {
        labels: ageDemo.map(item => item.group),
        datasets: [{
            label: 'Average View Percentage',
            data: ageDemo.map(item => item.avgPercentage || 0),
            backgroundColor: 'rgba(255, 0, 0, 0.6)',
            borderColor: DASHBOARD_CONFIG.colors.youtube,
            borderWidth: 1
        }]
    };

    createBarChart('youtube-retention-age-chart', chartData, {
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return value + '%';
                    }
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Avg. View Percentage: ${context.parsed.y.toFixed(1)}%`;
                    }
                }
            }
        }
    });
}

// Render YouTube watch time distribution chart
function renderYoutubeWatchtimeChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-watchtime-chart')) return;

    const ageDemo = youtubeData?.demographics?.age || [];

    const chartData = {
        labels: ageDemo.map(item => item.group),
        datasets: [{
            label: 'Watch Time Distribution',
            data: ageDemo.map(item => item.watchTimePercentage || 0),
            backgroundColor: [
                'rgba(255, 0, 0, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 159, 64, 0.6)'
            ],
            borderWidth: 0
        }]
    };

    createPieChart('youtube-watchtime-chart', chartData);
}

// Render YouTube performance trend chart (removed fallback dummy data)
function renderYoutubePerformanceChart(youtubeData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('youtube-performance-chart')) return;

    const performanceTrend = youtubeData?.performance_trend || [];

    const chartData = {
        labels: performanceTrend.map(item => item.month),
        datasets: [
            {
                label: 'Views',
                data: performanceTrend.map(item => item.views),
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                borderColor: DASHBOARD_CONFIG.colors.youtube,
                borderWidth: 2,
                yAxisID: 'y-axis-1',
                tension: 0.4,
                type: 'line'
            },
            {
                label: 'Watch Time (hours)',
                data: performanceTrend.map(item => item.watchTime),
                backgroundColor: 'rgba(255, 0, 0, 0.6)',
                borderColor: DASHBOARD_CONFIG.colors.youtube,
                borderWidth: 1,
                yAxisID: 'y-axis-2',
                type: 'bar'
            }
        ]
    };

    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('youtube-performance-chart').getContext('2d'), {
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
                        text: 'Views'
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
                        text: 'Watch Time (hours)'
                    }
                }
            }
        }
    });
}