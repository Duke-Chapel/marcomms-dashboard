/**
 * Chart configuration and initialization for marketing dashboard
 */
class DashboardCharts {
    constructor() {
        this.charts = {};
    }
    
    /**
     * Initialize all charts
     */
    initializeCharts() {
        // Overview charts
        this.initTrafficChart();
        this.initEngagementChart();
        
        // GA charts
        this.initGATrafficChart();
        
        // Social media charts
        this.initFollowersChart();
        this.initSocialEngagementChart();
        
        // Email charts
        this.initEmailPerformanceChart();
        
        // YouTube charts
        this.initYouTubeAgeChart();
        this.initYouTubeGenderChart();
        this.initYouTubeDeviceChart();
    }
    
    /**
     * Initialize traffic overview chart
     */
    initTrafficChart() {
        const ctx = document.getElementById('traffic-chart').getContext('2d');
        this.charts.traffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Sessions',
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    data: [],
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Initialize channel engagement chart
     */
    initEngagementChart() {
        const ctx = document.getElementById('engagement-chart').getContext('2d');
        this.charts.engagement = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Website', 'Facebook', 'Instagram', 'Email', 'YouTube'],
                datasets: [{
                    label: 'Engagement Rate',
                    backgroundColor: [
                        'rgba(13, 110, 253, 0.7)',  // Blue
                        'rgba(59, 89, 152, 0.7)',   // Facebook blue
                        'rgba(193, 53, 132, 0.7)',  // Instagram pink
                        'rgba(40, 167, 69, 0.7)',   // Green
                        'rgba(220, 53, 69, 0.7)'    // Red
                    ],
                    data: []
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
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize GA traffic chart
     */
    initGATrafficChart() {
        const ctx = document.getElementById('ga-traffic-chart').getContext('2d');
        this.charts.gaTraffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Sessions',
                        borderColor: '#0d6efd',
                        backgroundColor: 'rgba(13, 110, 253, 0.1)',
                        data: [],
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Bounce Rate',
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        data: [],
                        tension: 0.3,
                        borderDash: [5, 5],
                        fill: false,
                        yAxisID: 'y1'
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
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
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
    
    /**
     * Initialize followers chart
     */
    initFollowersChart() {
        const ctx = document.getElementById('followers-chart').getContext('2d');
        this.charts.followers = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Facebook',
                        borderColor: 'rgba(59, 89, 152, 1)',
                        backgroundColor: 'rgba(59, 89, 152, 0.1)',
                        data: [],
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Instagram',
                        borderColor: 'rgba(193, 53, 132, 1)',
                        backgroundColor: 'rgba(193, 53, 132, 0.1)',
                        data: [],
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Initialize social engagement chart
     */
    initSocialEngagementChart() {
        const ctx = document.getElementById('social-engagement-chart').getContext('2d');
        this.charts.socialEngagement = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Facebook', 'Instagram'],
                datasets: [{
                    label: 'Engagement',
                    backgroundColor: [
                        'rgba(59, 89, 152, 0.7)',   // Facebook blue
                        'rgba(193, 53, 132, 0.7)',  // Instagram pink
                    ],
                    data: []
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
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Initialize email performance chart
     */
    initEmailPerformanceChart() {
        const ctx = document.getElementById('email-performance-chart').getContext('2d');
        this.charts.emailPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Open Rate',
                        backgroundColor: 'rgba(40, 167, 69, 0.7)',
                        data: []
                    },
                    {
                        label: 'Click Rate',
                        backgroundColor: 'rgba(13, 110, 253, 0.7)',
                        data: []
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1,
                        ticks: {
                            callback: function(value) {
                                return (value * 100) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize YouTube age demographics chart
     */
    initYouTubeAgeChart() {
        const ctx = document.getElementById('youtube-age-chart').getContext('2d');
        this.charts.youtubeAge = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(255, 159, 64, 0.7)'
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
    
    /**
     * Initialize YouTube gender chart
     */
    initYouTubeGenderChart() {
        const ctx = document.getElementById('youtube-gender-chart').getContext('2d');
        this.charts.youtubeGender = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
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
    
    /**
     * Initialize YouTube device chart
     */
    initYouTubeDeviceChart() {
        const ctx = document.getElementById('youtube-device-chart').getContext('2d');
        this.charts.youtubeDevice = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Views',
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    data: []
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
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    /**
     * Update charts with data
     */
    updateCharts(data) {
        this.updateTrafficChart(data.ga);
        this.updateEngagementChart(data);
        this.updateGATrafficChart(data.ga);
        this.updateFollowersChart(data.social);
        this.updateSocialEngagementChart(data.social);
        this.updateEmailPerformanceChart(data.email);
        this.updateYouTubeCharts(data.youtube);
    }
    
    /**
     * Update traffic chart
     */
    updateTrafficChart(gaData) {
        if (!gaData || !gaData.length) return;
        
        // Process data for time series
        const dateMap = {};
        
        // Group by date
        gaData.forEach(item => {
            const date = item.date;
            if (!dateMap[date]) {
                dateMap[date] = { sessions: 0 };
            }
            dateMap[date].sessions += item.sessions || 0;
        });
        
        // Sort dates
        const sortedDates = Object.keys(dateMap).sort();
        
        // Prepare data for chart
        const labels = sortedDates;
        const sessions = sortedDates.map(date => dateMap[date].sessions);
        
        // Update chart
        this.charts.traffic.data.labels = labels;
        this.charts.traffic.data.datasets[0].data = sessions;
        this.charts.traffic.update();
    }
    
    /**
     * Update engagement chart
     */
    updateEngagementChart(data) {
        // Calculate engagement rates
        const gaEngagement = 0; // No real engagement rate in GA data
        
        // Social media engagement
        let fbEngagement = 0;
        let igEngagement = 0;
        
        if (data.social && data.social.length) {
            const fbData = data.social.filter(item => item.platform === 'Facebook');
            const igData = data.social.filter(item => item.platform === 'Instagram');
            
            // Calculate Facebook engagement
            const fbTotalEngagements = fbData.reduce((sum, item) => sum + (item.engagements || 0), 0);
            const fbTotalReach = fbData.reduce((sum, item) => sum + (item.reach || 0), 0);
            fbEngagement = fbTotalReach ? (fbTotalEngagements / fbTotalReach) * 100 : 0;
            
            // Calculate Instagram engagement
            const igTotalEngagements = igData.reduce((sum, item) => sum + (item.engagements || 0), 0);
            const igTotalReach = igData.reduce((sum, item) => sum + (item.reach || 0), 0);
            igEngagement = igTotalReach ? (igTotalEngagements / igTotalReach) * 100 : 0;
        }
        
        // Email engagement (click rate)
        let emailEngagement = 0;
        if (data.email && data.email.length) {
            emailEngagement = data.email.reduce((sum, item) => sum + (item.click_rate || 0), 0) / data.email.length * 100;
        }
        
        // YouTube engagement (average percentage viewed)
        let youtubeEngagement = 0;
        if (data.youtube && data.youtube.length) {
            // Filter for overall metrics if available
            const viewPercentages = data.youtube
                .filter(item => item.category && item.category.includes('view'))
                .map(item => item.views || 0);
                
            youtubeEngagement = viewPercentages.length ? 
                viewPercentages.reduce((sum, val) => sum + val, 0) / viewPercentages.length : 0;
        }
        
        // Update chart
        this.charts.engagement.data.datasets[0].data = [
            gaEngagement,
            fbEngagement,
            igEngagement,
            emailEngagement,
            youtubeEngagement
        ];
        this.charts.engagement.update();
    }
    
    /**
     * Update GA traffic chart
     */
    updateGATrafficChart(gaData) {
        if (!gaData || !gaData.length) return;
        
        // Process data for time series
        const dateMap = {};
        
        // Group by date
        gaData.forEach(item => {
            const date = item.date;
            if (!dateMap[date]) {
                dateMap[date] = { 
                    sessions: 0,
                    bounceRate: 0,
                    count: 0
                };
            }
            dateMap[date].sessions += item.sessions || 0;
            dateMap[date].bounceRate += item.bounce_rate || 0;
            dateMap[date].count++;
        });
        
        // Sort dates
        const sortedDates = Object.keys(dateMap).sort();
        
        // Prepare data for chart
        const labels = sortedDates;
        const sessions = sortedDates.map(date => dateMap[date].sessions);
        const bounceRates = sortedDates.map(date => 
            (dateMap[date].bounceRate / dateMap[date].count) * 100);
        
        // Update chart
        this.charts.gaTraffic.data.labels = labels;
        this.charts.gaTraffic.data.datasets[0].data = sessions;
        this.charts.gaTraffic.data.datasets[1].data = bounceRates;
        this.charts.gaTraffic.update();
    }
    
    /**
     * Update followers chart
     */
    updateFollowersChart(socialData) {
        if (!socialData || !socialData.length) return;
        
        // Separate by platform
        const fbData = socialData.filter(item => item.platform === 'Facebook');
        const igData = socialData.filter(item => item.platform === 'Instagram');
        
        // Group by date
        const fbDateMap = {};
        const igDateMap = {};
        
        fbData.forEach(item => {
            const date = item.date;
            if (date) {
                fbDateMap[date] = item.followers || 0;
            }
        });
        
        igData.forEach(item => {
            const date = item.date;
            if (date) {
                igDateMap[date] = item.followers || 0;
            }
        });
        
        // Get all unique dates
        const allDates = [...new Set([...Object.keys(fbDateMap), ...Object.keys(igDateMap)])].sort();
        
        // Prepare data for chart
        const fbFollowers = allDates.map(date => fbDateMap[date] || 0);
        const igFollowers = allDates.map(date => igDateMap[date] || 0);
        
        // Update chart
        this.charts.followers.data.labels = allDates;
        this.charts.followers.data.datasets[0].data = fbFollowers;
        this.charts.followers.data.datasets[1].data = igFollowers;
        this.charts.followers.update();
    }
    
    /**
     * Update social engagement chart
     */
    updateSocialEngagementChart(socialData) {
        if (!socialData || !socialData.length) return;
        
        // Calculate total engagement by platform
        const fbEngagement = socialData
            .filter(item => item.platform === 'Facebook')
            .reduce((sum, item) => sum + (item.engagements || 0), 0);
            
        const igEngagement = socialData
            .filter(item => item.platform === 'Instagram')
            .reduce((sum, item) => sum + (item.engagements || 0), 0);
        
        // Update chart
        this.charts.socialEngagement.data.datasets[0].data = [fbEngagement, igEngagement];
        this.charts.socialEngagement.update();
    }
    
    /**
     * Update email performance chart
     */
    updateEmailPerformanceChart(emailData) {
        if (!emailData || !emailData.length) return;
        
        // Sort campaigns by name
        const sortedCampaigns = [...emailData].sort((a, b) => 
            a.campaign.localeCompare(b.campaign));
        
        // Prepare data for chart
        const labels = sortedCampaigns.map(item => item.campaign);
        const openRates = sortedCampaigns.map(item => item.open_rate || 0);
        const clickRates = sortedCampaigns.map(item => item.click_rate || 0);
        
        // Update chart
        this.charts.emailPerformance.data.labels = labels;
        this.charts.emailPerformance.data.datasets[0].data = openRates;
        this.charts.emailPerformance.data.datasets[1].data = clickRates;
        this.charts.emailPerformance.update();
    }
    
    /**
     * Update YouTube charts
     */
    updateYouTubeCharts(youtubeData) {
        if (!youtubeData || !youtubeData.length) return;
        
        // Process age data
        const ageData = youtubeData.filter(item => 
            item.category && item.category.includes('age') && !item.category.includes('gender'));
        
        if (ageData.length) {
            const ageLabels = ageData.map(item => item.category);
            const ageValues = ageData.map(item => item.views);
            
            this.charts.youtubeAge.data.labels = ageLabels;
            this.charts.youtubeAge.data.datasets[0].data = ageValues;
            this.charts.youtubeAge.update();
        }
        
        // Process gender data
        const genderData = youtubeData.filter(item => 
            item.category && item.category.includes('gender'));
        
        if (genderData.length) {
            const genderLabels = genderData.map(item => item.category);
            const genderValues = genderData.map(item => item.views);
            
            this.charts.youtubeGender.data.labels = genderLabels;
            this.charts.youtubeGender.data.datasets[0].data = genderValues;
            this.charts.youtubeGender.update();
        }
        
        // Process device data
        const deviceData = youtubeData.filter(item => 
            item.category && item.category.includes('Device'));
        
        if (deviceData.length) {
            const deviceLabels = deviceData.map(item => item.category);
            const deviceValues = deviceData.map(item => item.views);
            
            this.charts.youtubeDevice.data.labels = deviceLabels;
            this.charts.youtubeDevice.data.datasets[0].data = deviceValues;
            this.charts.youtubeDevice.update();
        }
    }
}

// Create global charts instance
const dashboardCharts = new DashboardCharts();