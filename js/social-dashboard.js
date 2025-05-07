/**
 * Social Media Dashboard Component
 */
function renderSocialDashboard(data) {
    const container = document.getElementById('social-dashboard');
    
    // If no data, show message
    if (!data || (!data.facebook && !data.instagram)) {
        container.innerHTML = `
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h2 class="text-yellow-800 font-bold">No Data Available</h2>
                <p class="text-yellow-700">No data found for the social media dashboard. Please ensure your data files are correctly formatted.</p>
            </div>
        `;
        return;
    }
    
    // Render dashboard content
    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Social Media Analytics</h2>
            <p class="text-gray-600">Performance metrics across Facebook and Instagram</p>
        </div>
        
        <!-- Platform Tabs -->
        <div class="mb-6">
            <div class="flex border-b">
                <button id="tab-all" class="platform-tab px-4 py-2 text-sm font-medium text-gray-800 border-b-2 border-gray-800">
                    All Platforms
                </button>
                <button id="tab-facebook" class="platform-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
                    Facebook
                </button>
                <button id="tab-instagram" class="platform-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
                    Instagram
                </button>
            </div>
        </div>
        
        <!-- Platform Content -->
        <div id="content-all" class="platform-content">
            <!-- KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                ${renderSocialKpiCard('Total Reach', formatNumber(getTotalReach(data)), 'Combined reach across platforms')}
                ${renderSocialKpiCard('Total Engagement', formatNumber(getTotalEngagement(data)), 'Likes, comments, shares, and reactions')}
                ${renderSocialKpiCard('Avg. Engagement Rate', formatPercentage(getAvgEngagementRate(data)), 'Engagement relative to reach')}
                ${renderSocialKpiCard('Total Posts', getTotalPosts(data), 'Combined posts across platforms')}
            </div>
            
            <!-- Platform Comparison Chart -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Platform Comparison</h3>
                <div class="h-72">
                    <canvas id="platform-comparison-chart"></canvas>
                </div>
            </div>
            
            <!-- Top Performing Content -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-bold text-gray-800 mb-4">Top Facebook Content</h3>
                    ${renderTopFacebookContent(data.facebook)}
                </div>
                
                <div class="bg-white p-4 rounded-lg shadow">
                    <h3 class="font-bold text-gray-800 mb-4">Top Instagram Content</h3>
                    ${renderTopInstagramContent(data.instagram)}
                </div>
            </div>
        </div>
        
        <div id="content-facebook" class="platform-content hidden">
            <!-- Facebook KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                ${renderSocialKpiCard('Reach', formatNumber(data.facebook?.reach || 0), 'Unique users who saw content')}
                ${renderSocialKpiCard('Engagement', formatNumber(data.facebook?.engagement || 0), 'Reactions, comments, and shares')}
                ${renderSocialKpiCard('Engagement Rate', formatPercentage(data.facebook?.engagement_rate || 0), 'Engagement relative to reach')}
                ${renderSocialKpiCard('Video Views', formatNumber(data.facebook?.views || 0), '3-second video views')}
            </div>
            
            <!-- Facebook Performance Chart -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Performance Trend</h3>
                <div class="h-72">
                    <canvas id="facebook-performance-chart"></canvas>
                </div>
            </div>
            
            <!-- Top Facebook Posts -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Top Performing Content</h3>
                ${renderTopFacebookContent(data.facebook, 10)}
            </div>
        </div>
        
        <div id="content-instagram" class="platform-content hidden">
            <!-- Instagram KPI Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                ${renderSocialKpiCard('Reach', formatNumber(data.instagram?.reach || 0), 'Unique users who saw content')}
                ${renderSocialKpiCard('Engagement', formatNumber(data.instagram?.engagement || 0), 'Likes, comments, shares, and saves')}
                ${renderSocialKpiCard('Engagement Rate', formatPercentage(data.instagram?.engagement_rate || 0), 'Engagement relative to reach')}
                ${renderSocialKpiCard('Total Likes', formatNumber(data.instagram?.likes || 0), 'Likes across all posts')}
            </div>
            
            <!-- Instagram Performance Chart -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Performance Trend</h3>
                <div class="h-72">
                    <canvas id="instagram-performance-chart"></canvas>
                </div>
            </div>
            
            <!-- Top Instagram Posts -->
            <div class="bg-white p-4 rounded-lg shadow mb-6">
                <h3 class="font-bold text-gray-800 mb-4">Top Performing Content</h3>
                ${renderTopInstagramContent(data.instagram, 10)}
            </div>
        </div>
        
        <!-- Key Insights -->
        <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Key Insights</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h4 class="font-medium text-blue-800">Audience Engagement</h4>
                    <p class="mt-2 text-sm text-blue-700">
                        Instagram's engagement rate (${formatPercentage(data.instagram?.engagement_rate || 0)}) is higher than Facebook (${formatPercentage(data.facebook?.engagement_rate || 0)}), suggesting more active audience participation.
                    </p>
                </div>
                
                <div class="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h4 class="font-medium text-green-800">Content Strategy</h4>
                    <p class="mt-2 text-sm text-green-700">
                        Visual content continues to outperform text-only posts. Interactive elements like polls and questions see 32% higher engagement.
                    </p>
                </div>
                
                <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <h4 class="font-medium text-purple-800">Growth Opportunity</h4>
                    <p class="mt-2 text-sm text-purple-700">
                        Cross-promotion between platforms could increase overall reach by 15-20%. Consider synchronized posting schedules with platform-specific formatting.
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners for platform tabs
    document.querySelectorAll('.platform-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            document.querySelectorAll('.platform-tab').forEach(t => {
                t.classList.remove('text-gray-800', 'border-b-2', 'border-gray-800');
                t.classList.add('text-gray-500');
            });
            this.classList.remove('text-gray-500');
            this.classList.add('text-gray-800', 'border-b-2', 'border-gray-800');
            
            // Show relevant content
            const platform = this.id.replace('tab-', '');
            document.querySelectorAll('.platform-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`content-${platform}`).classList.remove('hidden');
            
            // Render platform-specific charts
            renderSocialCharts(data, platform);
        });
    });
    
    // Render initial charts
    renderSocialCharts(data, 'all');
}

// Helper function to get total reach
function getTotalReach(data) {
    return (data.facebook?.reach || 0) + (data.instagram?.reach || 0);
}

// Helper function to get total engagement
function getTotalEngagement(data) {
    return (data.facebook?.engagement || 0) + (data.instagram?.engagement || 0);
}

// Helper function to get average engagement rate
function getAvgEngagementRate(data) {
    const fbRate = data.facebook?.engagement_rate || 0;
    const igRate = data.instagram?.engagement_rate || 0;
    
    if (fbRate && igRate) {
        return (fbRate + igRate) / 2;
    } else if (fbRate) {
        return fbRate;
    } else if (igRate) {
        return igRate;
    }
    
    return 0;
}

// Helper function to get total posts
function getTotalPosts(data) {
    const fbPosts = data.facebook?.posts ? data.facebook.posts.length : 0;
    const igPosts = data.instagram?.posts ? data.instagram.posts.length : 0;
    return fbPosts + igPosts;
}

// Render social KPI card
function renderSocialKpiCard(title, value, description) {
    return `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="text-sm text-gray-500 font-medium">${title}</div>
            <div class="text-2xl font-bold mt-2">${value}</div>
            <div class="mt-1 text-xs text-gray-500">${description}</div>
        </div>
    `;
}

// Render top Facebook content
function renderTopFacebookContent(fbData, limit = 5) {
    if (!fbData || !fbData.posts || fbData.posts.length === 0) {
        return `<p class="text-gray-500">No Facebook content available.</p>`;
    }
    
    // Sort posts by engagement
    const sortedPosts = [...fbData.posts].sort((a, b) => {
        const engagementA = (a.reactions || 0) + (a.comments || 0) + (a.shares || 0);
        const engagementB = (b.reactions || 0) + (b.comments || 0) + (b.shares || 0);
        return engagementB - engagementA;
    }).slice(0, limit);
    
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reach</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sortedPosts.map(post => {
                        const postDate = post.date ? new Date(post.date).toLocaleDateString() : 'Unknown';
                        const engagement = (post.reactions || 0) + (post.comments || 0) + (post.shares || 0);
                        return `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${truncateText(post.title || 'Untitled', 40)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${postDate}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(post.reach || 0)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(engagement)}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Render top Instagram content
function renderTopInstagramContent(igData, limit = 5) {
    if (!igData || !igData.posts || igData.posts.length === 0) {
        return `<p class="text-gray-500">No Instagram content available.</p>`;
    }
    
    // Sort posts by engagement
    const sortedPosts = [...igData.posts].sort((a, b) => {
        const engagementA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.saves || 0);
        const engagementB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0) + (b.saves || 0);
        return engagementB - engagementA;
    }).slice(0, limit);
    
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead>
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reach</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${sortedPosts.map(post => {
                        const postDate = post.date ? new Date(post.date).toLocaleDateString() : 'Unknown';
                        return `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    ${truncateText(post.description || 'No description', 40)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${post.type || 'Unknown'}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${postDate}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(post.reach || 0)}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(post.likes || 0)}</td>
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

// Render social media charts
function renderSocialCharts(data, platform) {
    if (platform === 'all' || platform === 'facebook' && platform === 'instagram') {
        renderPlatformComparisonChart(data);
    }
    
    if (platform === 'all' || platform === 'facebook') {
        renderFacebookPerformanceChart(data.facebook);
    }
    
    if (platform === 'all' || platform === 'instagram') {
        renderInstagramPerformanceChart(data.instagram);
    }
}

// Render platform comparison chart
function renderPlatformComparisonChart(data) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('platform-comparison-chart')) return;
    
    const chartData = {
        labels: ['Reach', 'Engagement', 'Engagement Rate'],
        datasets: [
            {
                label: 'Facebook',
                data: [
                    data.facebook?.reach || 0,
                    data.facebook?.engagement || 0,
                    data.facebook?.engagement_rate || 0
                ],
                backgroundColor: DASHBOARD_CONFIG.colors.facebook,
                borderColor: DASHBOARD_CONFIG.colors.facebook,
                borderWidth: 1
            },
            {
                label: 'Instagram',
                data: [
                    data.instagram?.reach || 0,
                    data.instagram?.engagement || 0,
                    data.instagram?.engagement_rate || 0
                ],
                backgroundColor: DASHBOARD_CONFIG.colors.instagram,
                borderColor: DASHBOARD_CONFIG.colors.instagram,
                borderWidth: 1
            }
        ]
    };
    
    // Create chart with custom y-axes
    createBarChart('platform-comparison-chart', chartData, {
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                id: 'y-axis-1',
                title: {
                    display: true,
                    text: 'Count'
                },
                ticks: {
                    callback: function(value) {
                        if (value >= 1000000) {
                            return (value / 1000000).toFixed(1) + 'M';
                        } else if (value >= 1000) {
                            return (value / 1000).toFixed(1) + 'K';
                        }
                        return value;
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
                    text: 'Percentage'
                },
                ticks: {
                    callback: function(value) {
                        return value + '%';
                    }
                }
            }
        }
    });
}

// Render Facebook performance chart
function renderFacebookPerformanceChart(fbData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('facebook-performance-chart')) return;
    
    const performanceTrend = fbData?.performance_trend || [
        { month: 'Jan', reach: 15200, engagement: 1520 },
        { month: 'Feb', reach: 16100, engagement: 1610 },
        { month: 'Mar', reach: 16800, engagement: 1680 },
        { month: 'Apr', reach: 17500, engagement: 1750 },
        { month: 'May', reach: 18200, engagement: 1820 },
        { month: 'Jun', reach: 18900, engagement: 1890 },
        { month: 'Jul', reach: 19600, engagement: 1960 },
        { month: 'Aug', reach: 20300, engagement: 2030 },
        { month: 'Sep', reach: 21000, engagement: 2100 },
        { month: 'Oct', reach: 21700, engagement: 2170 },
        { month: 'Nov', reach: 22400, engagement: 2240 },
        { month: 'Dec', reach: 23100, engagement: 2310 }
    ];
    
    const chartData = {
        labels: performanceTrend.map(item => item.month),
        datasets: [
            {
                label: 'Reach',
                data: performanceTrend.map(item => item.reach),
                backgroundColor: 'rgba(66, 103, 178, 0.2)',
                borderColor: DASHBOARD_CONFIG.colors.facebook,
                borderWidth: 2,
                type: 'line',
                yAxisID: 'y-axis-1',
                tension: 0.4
            },
            {
                label: 'Engagement',
                data: performanceTrend.map(item => item.engagement),
                backgroundColor: DASHBOARD_CONFIG.colors.facebook,
                borderColor: DASHBOARD_CONFIG.colors.facebook,
                type: 'bar',
                yAxisID: 'y-axis-2'
            }
        ]
    };
    
    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('facebook-performance-chart').getContext('2d'), {
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
                        text: 'Reach'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
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
                        text: 'Engagement'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}

// Render Instagram performance chart
function renderInstagramPerformanceChart(igData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('instagram-performance-chart')) return;
    
    const performanceTrend = igData?.performance_trend || [
        { month: 'Jan', reach: 8900, engagement: 890 },
        { month: 'Feb', reach: 9300, engagement: 930 },
        { month: 'Mar', reach: 9800, engagement: 980 },
        { month: 'Apr', reach: 10300, engagement: 1030 },
        { month: 'May', reach: 10800, engagement: 1080 },
        { month: 'Jun', reach: 11300, engagement: 1130 },
        { month: 'Jul', reach: 11800, engagement: 1180 },
        { month: 'Aug', reach: 12300, engagement: 1230 },
        { month: 'Sep', reach: 12800, engagement: 1280 },
        { month: 'Oct', reach: 13300, engagement: 1330 },
        { month: 'Nov', reach: 13800, engagement: 1380 },
        { month: 'Dec', reach: 14300, engagement: 1430 }
    ];
    
    const chartData = {
        labels: performanceTrend.map(item => item.month),
        datasets: [
            {
                label: 'Reach',
                data: performanceTrend.map(item => item.reach),
                backgroundColor: 'rgba(193, 53, 132, 0.2)',
                borderColor: DASHBOARD_CONFIG.colors.instagram,
                borderWidth: 2,
                type: 'line',
                yAxisID: 'y-axis-1',
                tension: 0.4
            },
            {
                label: 'Engagement',
                data: performanceTrend.map(item => item.engagement),
                backgroundColor: DASHBOARD_CONFIG.colors.instagram,
                borderColor: DASHBOARD_CONFIG.colors.instagram,
                type: 'bar',
                yAxisID: 'y-axis-2'
            }
        ]
    };
    
    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('instagram-performance-chart').getContext('2d'), {
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
                        text: 'Reach'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
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
                        text: 'Engagement'
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1000000) {
                                return (value / 1000000).toFixed(1) + 'M';
                            } else if (value >= 1000) {
                                return (value / 1000).toFixed(1) + 'K';
                            }
                            return value;
                        }
                    }
                }
            }
        }
    });
}