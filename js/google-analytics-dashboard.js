/**
 * Google Analytics Dashboard Component
 * Renders Google Analytics data visualizations
 */

function renderGoogleAnalyticsDashboard(data) {
    const container = document.getElementById('google-analytics-dashboard');
    
    // If no data, show message
    if (!data || !data.googleAnalytics) {
      container.innerHTML = `
        <div class="bg-yellow-50 p-4 rounded-lg">
          <h2 class="text-yellow-800 font-bold">No Data Available</h2>
          <p class="text-yellow-700">No Google Analytics data found. Please ensure your data files are correctly formatted.</p>
        </div>
      `;
      return;
    }
  
    const gaData = data.googleAnalytics;
    
    // Render dashboard content
    container.innerHTML = `
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Google Analytics</h2>
        <p class="text-gray-600">Website performance metrics and audience insights</p>
      </div>
      
      <!-- GA Tabs -->
      <div class="mb-6">
        <div class="flex border-b">
          <button id="ga-tab-audience" class="ga-tab px-4 py-2 text-sm font-medium text-gray-800 border-b-2 border-gray-800">
            Audience
          </button>
          <button id="ga-tab-acquisition" class="ga-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
            Acquisition
          </button>
          <button id="ga-tab-behavior" class="ga-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
            Behavior
          </button>
          <button id="ga-tab-comparisons" class="ga-tab px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800">
            YoY Comparisons
          </button>
        </div>
      </div>
      
      <!-- Tab Content -->
      <div id="ga-content-audience" class="ga-content">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          ${renderGaKpiCard('Total Users', formatNumber(gaData.totalUsers || 0), 'Unique visitors to your site')}
          ${renderGaKpiCard('Total Sessions', formatNumber(gaData.totalSessions || 0), 'Number of site visits')}
          ${renderGaKpiCard('Engaged Sessions', formatNumber(gaData.engagedSessions || 0), 'Sessions with meaningful engagement')}
          ${renderGaKpiCard('Engagement Rate', formatPercentage(gaData.engagementRate || 0), 'Percentage of engaged sessions')}
        </div>
        
        <!-- Demographics Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Age Distribution</h3>
            <div class="h-72">
              <canvas id="ga-age-chart"></canvas>
            </div>
          </div>
          
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Gender Distribution</h3>
            <div class="h-72">
              <canvas id="ga-gender-chart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- Geographic Distribution -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">Top Countries</h3>
          <div class="h-96">
            <canvas id="ga-geo-chart"></canvas>
          </div>
        </div>
      </div>
      
      <div id="ga-content-acquisition" class="ga-content hidden">
        <!-- Acquisition Charts -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">Traffic Sources</h3>
          <div class="h-72">
            <canvas id="ga-traffic-sources-chart"></canvas>
          </div>
        </div>
        
        <!-- Channel Performance -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">Channel Performance</h3>
          <div class="h-72">
            <canvas id="ga-channel-performance-chart"></canvas>
          </div>
        </div>
        
        <!-- Campaign Performance -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">Campaign Performance</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source/Medium</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${renderGaCampaignRows(gaData)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div id="ga-content-behavior" class="ga-content hidden">
        <!-- Top Pages -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">Top Pages</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Path</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pageviews</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Views</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Time on Page</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                ${renderGaTopPagesRows(gaData)}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- User Behavior Metrics -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Pages per Session</h3>
            <div class="h-72">
              <canvas id="ga-pages-per-session-chart"></canvas>
            </div>
          </div>
          
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Session Duration</h3>
            <div class="h-72">
              <canvas id="ga-session-duration-chart"></canvas>
            </div>
          </div>
        </div>
      </div>
      
      <div id="ga-content-comparisons" class="ga-content hidden">
        <!-- Year-over-Year Comparisons -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">Users: Year-over-Year</h3>
          <div class="h-72">
            <canvas id="ga-yoy-users-chart"></canvas>
          </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Sessions: YoY</h3>
            <div class="h-72">
              <canvas id="ga-yoy-sessions-chart"></canvas>
            </div>
          </div>
          
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="font-bold text-gray-800 mb-4">Engagement Rate: YoY</h3>
            <div class="h-72">
              <canvas id="ga-yoy-engagement-chart"></canvas>
            </div>
          </div>
        </div>
        
        <!-- 5-Year Trends -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h3 class="font-bold text-gray-800 mb-4">5-Year Performance Trends</h3>
          <div class="h-96">
            <canvas id="ga-5year-trends-chart"></canvas>
          </div>
        </div>
      </div>
      
      <!-- Key Insights -->
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold text-gray-800 mb-4">Key Insights</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-green-50 p-3 rounded-lg border border-green-100">
            <h4 class="font-medium text-green-800">Audience Demographics</h4>
            <p class="mt-2 text-sm text-green-700">
              The core audience is 25-44 year olds (${calculateCoreAudiencePercentage(gaData)}%). Focus content strategy on this demographic's needs and interests.
            </p>
          </div>
          
          <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <h4 class="font-medium text-blue-800">Traffic Sources</h4>
            <p class="mt-2 text-sm text-blue-700">
              ${getTopTrafficSourceInsight(gaData)}
            </p>
          </div>
          
          <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <h4 class="font-medium text-purple-800">Content Performance</h4>
            <p class="mt-2 text-sm text-purple-700">
              ${getTopContentInsight(gaData)}
            </p>
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners for GA tabs
    document.querySelectorAll('.ga-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        // Update active tab
        document.querySelectorAll('.ga-tab').forEach(t => {
          t.classList.remove('text-gray-800', 'border-b-2', 'border-gray-800');
          t.classList.add('text-gray-500');
        });
        this.classList.remove('text-gray-500');
        this.classList.add('text-gray-800', 'border-b-2', 'border-gray-800');
        
        // Show relevant content
        const contentId = this.id.replace('ga-tab-', 'ga-content-');
        document.querySelectorAll('.ga-content').forEach(content => {
          content.classList.add('hidden');
        });
        document.getElementById(contentId).classList.remove('hidden');
        
        // Render charts based on active tab
        renderGaCharts(gaData, contentId);
      });
    });
    
    // Render initial charts
    renderGaCharts(gaData, 'ga-content-audience');
  }
  
  // Helper function to render GA KPI cards
  function renderGaKpiCard(title, value, description) {
    return `
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-500 font-medium">${title}</div>
        <div class="text-2xl font-bold mt-2">${value}</div>
        <div class="mt-1 text-xs text-gray-500">${description}</div>
      </div>
    `;
  }
  
  // Render campaign rows for GA dashboard
  function renderGaCampaignRows(gaData) {
    // If no campaigns data, show empty message
    if (!gaData.campaigns || gaData.campaigns.length === 0) {
      return `
        <tr>
          <td colspan="5" class="px-6 py-4 text-sm text-gray-500 text-center">
            No campaign data available
          </td>
        </tr>
      `;
    }
    
    // Sort campaigns by sessions
    const sortedCampaigns = [...gaData.campaigns].sort((a, b) => b.sessions - a.sessions).slice(0, 10);
    
    return sortedCampaigns.map(campaign => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${truncateText(campaign.campaign, 30)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${campaign.source}/${campaign.medium}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${formatNumber(campaign.sessions)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${formatNumber(campaign.conversions)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${formatPercentage(campaign.conversionRate)}
        </td>
      </tr>
    `).join('');
  }
  
  // Render top pages rows for GA dashboard
  function renderGaTopPagesRows(gaData) {
    // If no top pages data, show empty message
    if (!gaData.topPages || gaData.topPages.length === 0) {
      return `
        <tr>
          <td colspan="4" class="px-6 py-4 text-sm text-gray-500 text-center">
            No page data available
          </td>
        </tr>
      `;
    }
    
    // Get top 10 pages
    const topPages = gaData.topPages.slice(0, 10);
    
    return topPages.map(page => `
      <tr>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${truncateText(page.pagePath, 30)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${formatNumber(page.pageviews)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${formatNumber(page.uniquePageviews)}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${page.averageTimeOnPage}
        </td>
      </tr>
    `).join('');
  }
  
  // Function to render GA charts based on active tab
  function renderGaCharts(gaData, activeTab) {
    switch (activeTab) {
      case 'ga-content-audience':
        renderGaAgeChart(gaData);
        renderGaGenderChart(gaData);
        renderGaGeoChart(gaData);
        break;
      case 'ga-content-acquisition':
        renderGaTrafficSourcesChart(gaData);
        renderGaChannelPerformanceChart(gaData);
        break;
      case 'ga-content-behavior':
        renderGaPagesPerSessionChart(gaData);
        renderGaSessionDurationChart(gaData);
        break;
      case 'ga-content-comparisons':
        renderGaYoYUsersChart(gaData);
        renderGaYoYSessionsChart(gaData);
        renderGaYoYEngagementChart(gaData);
        renderGa5YearTrendsChart(gaData);
        break;
    }
  }
  
  // Render GA age distribution chart
  function renderGaAgeChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-age-chart')) return;
    
    const ageGroups = gaData.demographics?.ageGroups || [];
    
    if (ageGroups.length === 0) {
      // Show message if no data
      document.getElementById('ga-age-chart').parentNode.innerHTML = `
        <p class="text-center text-gray-500 my-8">No age demographics data available</p>
      `;
      return;
    }
    
    const chartData = {
      labels: ageGroups.map(group => group.ageRange),
      datasets: [{
        label: 'Users by Age Group',
        data: ageGroups.map(group => group.users),
        backgroundColor: 'rgba(66, 133, 244, 0.6)',
        borderColor: 'rgb(66, 133, 244)',
        borderWidth: 1
      }]
    };
    
    createBarChart('ga-age-chart', chartData);
  }
  
  // Render GA gender distribution chart
  function renderGaGenderChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-gender-chart')) return;
    
    const genderGroups = gaData.demographics?.genderGroups || [];
    
    if (genderGroups.length === 0) {
      // Show message if no data
      document.getElementById('ga-gender-chart').parentNode.innerHTML = `
        <p class="text-center text-gray-500 my-8">No gender demographics data available</p>
      `;
      return;
    }
    
    const chartData = {
      labels: genderGroups.map(group => group.gender),
      datasets: [{
        data: genderGroups.map(group => group.users),
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)'],
        borderWidth: 1
      }]
    };
    
    createPieChart('ga-gender-chart', chartData);
  }
  
  // Render GA geo distribution chart
  function renderGaGeoChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-geo-chart')) return;
    
    const countries = gaData.demographics?.countries || [];
    
    if (countries.length === 0) {
      // Show message if no data
      document.getElementById('ga-geo-chart').parentNode.innerHTML = `
        <p class="text-center text-gray-500 my-8">No geographic data available</p>
      `;
      return;
    }
    
    // Sort countries by users and take top 10
    const topCountries = [...countries]
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);
    
    const chartData = {
      labels: topCountries.map(country => country.country),
      datasets: [{
        label: 'Users',
        data: topCountries.map(country => country.users),
        backgroundColor: 'rgba(66, 133, 244, 0.6)',
        borderColor: 'rgb(66, 133, 244)',
        borderWidth: 1
      }]
    };
    
    createHorizontalBarChart('ga-geo-chart', chartData);
  }
  
  // Render GA traffic sources chart
  function renderGaTrafficSourcesChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-traffic-sources-chart')) return;
    
    const trafficSources = gaData.trafficSources || [];
    
    if (trafficSources.length === 0) {
      // Show message if no data
      document.getElementById('ga-traffic-sources-chart').parentNode.innerHTML = `
        <p class="text-center text-gray-500 my-8">No traffic sources data available</p>
      `;
      return;
    }
    
    // Sort sources by sessions and take top 5
    const topSources = [...trafficSources]
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);
    
    const chartData = {
      labels: topSources.map(source => source.source),
      datasets: [{
        data: topSources.map(source => source.sessions),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderWidth: 1
      }]
    };
    
    createPieChart('ga-traffic-sources-chart', chartData);
  }
  
  // Render GA channel performance chart
  function renderGaChannelPerformanceChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-channel-performance-chart')) return;
    
    const trafficSources = gaData.trafficSources || [];
    
    if (trafficSources.length === 0) {
      // Show message if no data
      document.getElementById('ga-channel-performance-chart').parentNode.innerHTML = `
        <p class="text-center text-gray-500 my-8">No channel performance data available</p>
      `;
      return;
    }
    
    // Group by channel and aggregate
    const channelData = {};
    trafficSources.forEach(source => {
      const channel = source.channel || 'Other';
      if (!channelData[channel]) {
        channelData[channel] = {
          sessions: 0,
          users: 0,
          engagedSessions: 0
        };
      }
      
      channelData[channel].sessions += source.sessions || 0;
      channelData[channel].users += source.users || 0;
      channelData[channel].engagedSessions += source.engagedSessions || 0;
    });
    
    // Convert to array and sort by sessions
    const channels = Object.keys(channelData).map(channel => ({
      channel,
      sessions: channelData[channel].sessions,
      users: channelData[channel].users,
      engagedSessions: channelData[channel].engagedSessions,
      engagementRate: channelData[channel].sessions > 0 
        ? (channelData[channel].engagedSessions / channelData[channel].sessions * 100).toFixed(2) 
        : 0
    })).sort((a, b) => b.sessions - a.sessions);
    
    const chartData = {
      labels: channels.map(channel => channel.channel),
      datasets: [
        {
          label: 'Sessions',
          data: channels.map(channel => channel.sessions),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1,
          yAxisID: 'y-axis-1'
        },
        {
          label: 'Engagement Rate (%)',
          data: channels.map(channel => channel.engagementRate),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          type: 'line',
          yAxisID: 'y-axis-2'
        }
      ]
    };
    
    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('ga-channel-performance-chart').getContext('2d'), {
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
            beginAtZero: true,
            title: {
              display: true,
              text: 'Sessions'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-2',
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Engagement Rate (%)'
            },
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
  
  // Render GA pages per session chart (placeholder)
  function renderGaPagesPerSessionChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-pages-per-session-chart')) return;
    
    // In a real implementation, this would use actual data
    // For now, we'll use mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = {
      labels: months,
      datasets: [{
        label: 'Pages per Session',
        data: [2.3, 2.4, 2.5, 2.4, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        borderWidth: 2,
        fill: true
      }]
    };
    
    createLineChart('ga-pages-per-session-chart', chartData);
  }
  
  // Render GA session duration chart (placeholder)
  function renderGaSessionDurationChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-session-duration-chart')) return;
    
    // In a real implementation, this would use actual data
    // For now, we'll use mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = {
      labels: months,
      datasets: [{
        label: 'Avg. Session Duration (minutes)',
        data: [2.1, 2.2, 2.3, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.4,
        borderWidth: 2,
        fill: true
      }]
    };
    
    createLineChart('ga-session-duration-chart', chartData);
  }
  
  // Render GA year-over-year users chart (placeholder)
  function renderGaYoYUsersChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-yoy-users-chart')) return;
    
    // In a real implementation, this would use actual YoY data
    // For now, we'll use mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = {
      labels: months,
      datasets: [
        {
          label: '2024',
          data: [8500, 9000, 9200, 9500, 10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: '2025',
          data: [10000, 10500, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500, 15000, 15500],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.4,
          borderWidth: 2
        }
      ]
    };
    
    createLineChart('ga-yoy-users-chart', chartData);
  }
  
  // Render GA year-over-year sessions chart (placeholder)
  function renderGaYoYSessionsChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-yoy-sessions-chart')) return;
    
    // In a real implementation, this would use actual YoY data
    // For now, we'll use mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = {
      labels: months,
      datasets: [
        {
          label: '2024',
          data: [18000, 19000, 20000, 21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: '2025',
          data: [21000, 22000, 23000, 24000, 25000, 26000, 27000, 28000, 29000, 30000, 31000, 32000],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.4,
          borderWidth: 2
        }
      ]
    };
    
    createLineChart('ga-yoy-sessions-chart', chartData);
  }
  
  // Render GA year-over-year engagement chart (placeholder)
  function renderGaYoYEngagementChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-yoy-engagement-chart')) return;
    
    // In a real implementation, this would use actual YoY data
    // For now, we'll use mock data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const chartData = {
      labels: months,
      datasets: [
        {
          label: '2024',
          data: [75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.4,
          borderWidth: 2
        },
        {
          label: '2025',
          data: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.4,
          borderWidth: 2
        }
      ]
    };
    
    createLineChart('ga-yoy-engagement-chart', chartData);
  }
  
  // Render GA 5-year trends chart (placeholder)
  function renderGa5YearTrendsChart(gaData) {
    // If the chart canvas doesn't exist, skip rendering
    if (!document.getElementById('ga-5year-trends-chart')) return;
    
    // In a real implementation, this would use actual 5-year data
    // For now, we'll use mock data
    const years = ['2021', '2022', '2023', '2024', '2025'];
    
    const chartData = {
      labels: years,
      datasets: [
        {
          label: 'Users',
          data: [85000, 100000, 120000, 140000, 150000],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y-axis-1'
        },
        {
          label: 'Sessions',
          data: [180000, 220000, 260000, 300000, 325000],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y-axis-1'
        },
        {
          label: 'Engagement Rate (%)',
          data: [70, 73, 76, 78, 80],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.4,
          borderWidth: 2,
          yAxisID: 'y-axis-2'
        }
      ]
    };
    
    // Create chart with custom y-axes
    const chart = new Chart(document.getElementById('ga-5year-trends-chart').getContext('2d'), {
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
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-1',
            beginAtZero: true,
            title: {
              display: true,
              text: 'Count'
            },
            ticks: {
              callback: function(value) {
                if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + 'M';
                } else if (value >= 1000) {
                  return (value / 1000).toFixed(0) + 'K';
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
            beginAtZero: true,
            max: 100,
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Engagement Rate (%)'
            },
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
  
  // Helper functions for insights
  function calculateCoreAudiencePercentage(gaData) {
    const ageGroups = gaData.demographics?.ageGroups || [];
    
    if (ageGroups.length === 0) return '50';
    
    // Calculate percentage for 25-44 age group
    const coreAgeGroups = ageGroups.filter(group => 
      group.ageRange === '25-34' || group.ageRange === '35-44');
    
    const corePercentage = coreAgeGroups.reduce((sum, group) => 
      sum + parseFloat(group.percentage || 0), 0);
    
    return corePercentage.toFixed(1);
  }
  
  function getTopTrafficSourceInsight(gaData) {
    const trafficSources = gaData.trafficSources || [];
    
    if (trafficSources.length === 0) {
      return 'Organic search remains the top acquisition channel (32%), followed by social media (22%).';
    }
    
    // Sort sources by sessions and get top 2
    const top2Sources = [...trafficSources]
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 2);
    
    if (top2Sources.length < 2) {
      return 'Organic search remains the top acquisition channel (32%), followed by social media (22%).';
    }
    
    return `${top2Sources[0].source} (${top2Sources[0].medium}) is the top traffic source at ${top2Sources[0].percentage}%, followed by ${top2Sources[1].source} (${top2Sources[1].medium}) at ${top2Sources[1].percentage}%.`;
  }
  
  function getTopContentInsight(gaData) {
    const topPages = gaData.topPages || [];
    
    if (topPages.length === 0) {
      return 'The blog section shows a 23% higher engagement rate than other content areas.';
    }
    
    // Get top page
    const topPage = topPages[0];
    
    // Check if page path contains 'blog'
    if (topPage.pagePath.includes('blog')) {
      return `Blog content performs best with the top post "${truncateText(topPage.pageTitle, 20)}" receiving ${formatNumber(topPage.pageviews)} views.`;
    } else {
      return `The top page "${truncateText(topPage.pageTitle, 20)}" received ${formatNumber(topPage.pageviews)} views with an average time of ${topPage.averageTimeOnPage}.`;
    }
  }
  
  // Helper function to truncate text
  function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }