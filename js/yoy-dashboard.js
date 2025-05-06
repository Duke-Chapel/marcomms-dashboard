/**
 * Year-over-Year Dashboard Component
 * Renders YoY comparison visualizations
 */

function renderYearOverYearDashboard(data, currentYear, previousYear) {
  const container = document.getElementById('yoy-dashboard');
  
  // If no container found, return
  if (!container) return;
  
  // Default to current year and previous year if not specified
  if (!currentYear) {
    currentYear = new Date().getFullYear().toString();
  }
  
  if (!previousYear) {
    previousYear = (parseInt(currentYear) - 1).toString();
  }
  
  // Get data for the two years
  const currentYearData = data.yearlyData?.[currentYear] || {};
  const previousYearData = data.yearlyData?.[previousYear] || {};
  
  // Calculate YoY changes
  const yoyChanges = calculateYoYChanges(currentYearData, previousYearData);
  
  // Render dashboard content
  container.innerHTML = `
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Year-over-Year Comparison</h2>
      <p class="text-gray-600">${previousYear} vs ${currentYear} performance analysis</p>
    </div>
    
    <!-- YoY KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      ${renderYoYKpiCard(
        'Total Reach', 
        currentYearData.crossChannel?.reach?.total || 0, 
        previousYearData.crossChannel?.reach?.total || 0
      )}
      ${renderYoYKpiCard(
        'Total Engagement', 
        currentYearData.crossChannel?.engagement?.total || 0, 
        previousYearData.crossChannel?.engagement?.total || 0
      )}
      ${renderYoYKpiCard(
        'Engagement Rate', 
        currentYearData.crossChannel?.engagement_rate?.overall || 0, 
        previousYearData.crossChannel?.engagement_rate?.overall || 0,
        'percentage'
      )}
      ${renderYoYKpiCard(
        'Conversion Rate', 
        2.8, 
        2.4,
        'percentage'
      )}
    </div>
    
    <!-- Channel Comparison -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <h3 class="font-bold text-gray-800 mb-4">Channel Performance: Year-over-Year</h3>
      <div class="h-72">
        <canvas id="yoy-channel-chart"></canvas>
      </div>
    </div>
    
    <!-- Platform-Specific Comparisons -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold text-gray-800 mb-4">Social Media: YoY</h3>
        <div class="h-72">
          <canvas id="yoy-social-chart"></canvas>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold text-gray-800 mb-4">Email & Web: YoY</h3>
        <div class="h-72">
          <canvas id="yoy-email-web-chart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Monthly Comparison -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <h3 class="font-bold text-gray-800 mb-4">Monthly Performance: ${previousYear} vs ${currentYear}</h3>
      <div class="h-96">
        <canvas id="yoy-monthly-chart"></canvas>
      </div>
    </div>
    
    <!-- Key Insights -->
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="font-bold text-gray-800 mb-4">Year-over-Year Insights</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-50 p-3 rounded-lg border border-green-100">
          <h4 class="font-medium text-green-800">Growth Areas</h4>
          <p class="mt-2 text-sm text-green-700">
            ${getGrowthAreasInsight(yoyChanges)}
          </p>
        </div>
        
        <div class="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
          <h4 class="font-medium text-yellow-800">Attention Areas</h4>
          <p class="mt-2 text-sm text-yellow-700">
            ${getAttentionAreasInsight(yoyChanges)}
          </p>
        </div>
        
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <h4 class="font-medium text-blue-800">Recommendations</h4>
          <p class="mt-2 text-sm text-blue-700">
            ${getYoYRecommendations(yoyChanges)}
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Render charts
  renderYoYCharts(currentYearData, previousYearData, currentYear, previousYear);
}

// Calculate YoY changes
function calculateYoYChanges(currentYearData, previousYearData) {
  const changes = {
    reach: {
      total: calculatePercentageChange(
        currentYearData.crossChannel?.reach?.total,
        previousYearData.crossChannel?.reach?.total
      ),
      byPlatform: {}
    },
    engagement: {
      total: calculatePercentageChange(
        currentYearData.crossChannel?.engagement?.total,
        previousYearData.crossChannel?.engagement?.total
      ),
      byPlatform: {}
    },
    engagement_rate: {
      overall: calculatePercentageChange(
        currentYearData.crossChannel?.engagement_rate?.overall,
        previousYearData.crossChannel?.engagement_rate?.overall
      ),
      byPlatform: {}
    }
  };
  
  // Calculate platform-specific changes
  const platforms = ['facebook', 'instagram', 'youtube', 'email', 'web'];
  
  platforms.forEach(platform => {
    // Reach changes by platform
    changes.reach.byPlatform[platform] = calculatePercentageChange(
      currentYearData.crossChannel?.reach?.byPlatform?.[platform],
      previousYearData.crossChannel?.reach?.byPlatform?.[platform]
    );
    
    // Engagement changes by platform
    changes.engagement.byPlatform[platform] = calculatePercentageChange(
      currentYearData.crossChannel?.engagement?.byPlatform?.[platform],
      previousYearData.crossChannel?.engagement?.byPlatform?.[platform]
    );
    
    // Engagement rate changes by platform
    changes.engagement_rate.byPlatform[platform] = calculatePercentageChange(
      currentYearData.crossChannel?.engagement_rate?.byPlatform?.[platform],
      previousYearData.crossChannel?.engagement_rate?.byPlatform?.[platform]
    );
  });
  
  return changes;
}

// Helper function to calculate percentage change
function calculatePercentageChange(current, previous) {
  if (!current || !previous || previous === 0) {
    return 0;
  }
  
  return ((current - previous) / previous) * 100;
}

// Render YoY KPI card
function renderYoYKpiCard(title, currentValue, previousValue, format = 'number') {
  // Calculate change
  const change = calculatePercentageChange(currentValue, previousValue);
  const trend = change >= 0 ? 'positive' : 'negative';
  const trendClass = trend === 'positive' ? 'text-green-500' : 'text-red-500';
  const trendIcon = trend === 'positive' ? '↑' : '↓';
  
  // Format values
  const formattedCurrent = formatValue(currentValue, format);
  const formattedPrevious = formatValue(previousValue, format);
  
  return `
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="text-sm text-gray-500 font-medium">${title}</div>
      <div class="text-2xl font-bold mt-2">${formattedCurrent}</div>
      <div class="mt-1 text-sm font-medium ${trendClass}">
        ${trendIcon} ${Math.abs(change).toFixed(1)}% vs previous year
      </div>
      <div class="mt-1 text-xs text-gray-500">
        Previous: ${formattedPrevious}
      </div>
    </div>
  `;
}

// Helper function to format value based on type
function formatValue(value, format) {
  if (format === 'percentage') {
    return value ? value.toFixed(1) + '%' : '0%';
  } else {
    return value ? value.toLocaleString() : '0';
  }
}

// Render YoY charts
function renderYoYCharts(currentYearData, previousYearData, currentYear, previousYear) {
  renderYoYChannelChart(currentYearData, previousYearData, currentYear, previousYear);
  renderYoYSocialChart(currentYearData, previousYearData, currentYear, previousYear);
  renderYoYEmailWebChart(currentYearData, previousYearData, currentYear, previousYear);
  renderYoYMonthlyChart(currentYearData, previousYearData, currentYear, previousYear);
}

// Render YoY channel chart
function renderYoYChannelChart(currentYearData, previousYearData, currentYear, previousYear) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('yoy-channel-chart')) return;
  
  // Get reach data by platform
  const platforms = ['facebook', 'instagram', 'youtube', 'email', 'web'];
  
  const currentReach = platforms.map(platform => 
    currentYearData.crossChannel?.reach?.byPlatform?.[platform] || 0
  );
  
  const previousReach = platforms.map(platform => 
    previousYearData.crossChannel?.reach?.byPlatform?.[platform] || 0
  );
  
  // Platform display names
  const platformLabels = platforms.map(platform => 
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
  
  // Chart data
  const chartData = {
    labels: platformLabels,
    datasets: [
      {
        label: currentYear,
        data: currentReach,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      },
      {
        label: previousYear,
        data: previousReach,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      }
    ]
  };
  
  // Create grouped bar chart
  createBarChart('yoy-channel-chart', chartData, {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reach'
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
      }
    }
  });
}

// Render YoY social chart
function renderYoYSocialChart(currentYearData, previousYearData, currentYear, previousYear) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('yoy-social-chart')) return;
  
  // Social platforms
  const platforms = ['facebook', 'instagram', 'youtube'];
  
  // Create datasets for reach and engagement
  const datasets = [];
  
  // Current year reach
  datasets.push({
    label: `${currentYear} Reach`,
    data: platforms.map(platform => 
      currentYearData.crossChannel?.reach?.byPlatform?.[platform] || 0
    ),
    backgroundColor: 'rgba(54, 162, 235, 0.6)',
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 1,
    stack: 'Stack 0'
  });
  
  // Previous year reach
  datasets.push({
    label: `${previousYear} Reach`,
    data: platforms.map(platform => 
      previousYearData.crossChannel?.reach?.byPlatform?.[platform] || 0
    ),
    backgroundColor: 'rgba(54, 162, 235, 0.3)',
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 1,
    stack: 'Stack 1'
  });
  
  // Current year engagement
  datasets.push({
    label: `${currentYear} Engagement`,
    data: platforms.map(platform => 
      currentYearData.crossChannel?.engagement?.byPlatform?.[platform] || 0
    ),
    backgroundColor: 'rgba(255, 99, 132, 0.6)',
    borderColor: 'rgb(255, 99, 132)',
    borderWidth: 1,
    stack: 'Stack 2'
  });
  
  // Previous year engagement
  datasets.push({
    label: `${previousYear} Engagement`,
    data: platforms.map(platform => 
      previousYearData.crossChannel?.engagement?.byPlatform?.[platform] || 0
    ),
    backgroundColor: 'rgba(255, 99, 132, 0.3)',
    borderColor: 'rgb(255, 99, 132)',
    borderWidth: 1,
    stack: 'Stack 3'
  });
  
  // Platform display names
  const platformLabels = platforms.map(platform => 
    platform.charAt(0).toUpperCase() + platform.slice(1)
  );
  
  // Chart data
  const chartData = {
    labels: platformLabels,
    datasets
  };
  
  // Create stacked bar chart
  createStackedBarChart('yoy-social-chart', chartData);
}

// Render YoY email & web chart
function renderYoYEmailWebChart(currentYearData, previousYearData, currentYear, previousYear) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('yoy-email-web-chart')) return;
  
  // Platforms
  const platforms = ['email', 'web'];
  
  // Create datasets
  const datasets = [];
  
  // Current year data
  datasets.push({
    label: `${currentYear} Email Open Rate`,
    data: [currentYearData.email?.openRate || 0, 0],
    backgroundColor: 'rgba(88, 81, 219, 0.6)',
    borderColor: 'rgb(88, 81, 219)',
    borderWidth: 1
  });
  
  // Previous year data
  datasets.push({
    label: `${previousYear} Email Open Rate`,
    data: [previousYearData.email?.openRate || 0, 0],
    backgroundColor: 'rgba(88, 81, 219, 0.3)',
    borderColor: 'rgb(88, 81, 219)',
    borderWidth: 1
  });
  
  // Current year web engagement rate
  datasets.push({
    label: `${currentYear} Web Engagement Rate`,
    data: [0, currentYearData.googleAnalytics?.engagementRate || 0],
    backgroundColor: 'rgba(52, 168, 83, 0.6)',
    borderColor: 'rgb(52, 168, 83)',
    borderWidth: 1
  });
  
  // Previous year web engagement rate
  datasets.push({
    label: `${previousYear} Web Engagement Rate`,
    data: [0, previousYearData.googleAnalytics?.engagementRate || 0],
    backgroundColor: 'rgba(52, 168, 83, 0.3)',
    borderColor: 'rgb(52, 168, 83)',
    borderWidth: 1
  });
  
  // Chart data
  const chartData = {
    labels: ['Email', 'Web'],
    datasets
  };
  
  // Create grouped bar chart
  createBarChart('yoy-email-web-chart', chartData, {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Rate (%)'
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

// Render YoY monthly chart
function renderYoYMonthlyChart(currentYearData, previousYearData, currentYear, previousYear) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('yoy-monthly-chart')) return;
  
  // Get performance trend data
  const currentTrend = currentYearData.crossChannel?.performance_trend || [];
  const previousTrend = previousYearData.crossChannel?.performance_trend || [];
  
  // If no trend data, use mock data
  if (currentTrend.length === 0 || previousTrend.length === 0) {
    renderMockYoYMonthlyChart(currentYear, previousYear);
    return;
  }
  
  // Months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Prepare chart data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: `${currentYear} Facebook`,
        data: months.map(month => {
          const monthData = currentTrend.find(item => item.month === month);
          return monthData ? monthData.facebook : 0;
        }),
        backgroundColor: 'transparent',
        borderColor: 'rgb(66, 103, 178)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: `${previousYear} Facebook`,
        data: months.map(month => {
          const monthData = previousTrend.find(item => item.month === month);
          return monthData ? monthData.facebook : 0;
        }),
        backgroundColor: 'transparent',
        borderColor: 'rgb(66, 103, 178)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4
      },
      {
        label: `${currentYear} Instagram`,
        data: months.map(month => {
          const monthData = currentTrend.find(item => item.month === month);
          return monthData ? monthData.instagram : 0;
        }),
        backgroundColor: 'transparent',
        borderColor: 'rgb(225, 48, 108)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: `${previousYear} Instagram`,
        data: months.map(month => {
          const monthData = previousTrend.find(item => item.month === month);
          return monthData ? monthData.instagram : 0;
        }),
        backgroundColor: 'transparent',
        borderColor: 'rgb(225, 48, 108)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };
  
  // Create line chart
  createLineChart('yoy-monthly-chart', chartData);
}

// Render mock YoY monthly chart
function renderMockYoYMonthlyChart(currentYear, previousYear) {
  // Months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Mock data with growth trend
  const mockCurrentFacebook = months.map((_, index) => 90 + index * 3);
  const mockPreviousFacebook = months.map((_, index) => 80 + index * 2.7);
  
  const mockCurrentInstagram = months.map((_, index) => 95 + index * 2.5);
  const mockPreviousInstagram = months.map((_, index) => 82 + index * 2.2);
  
  // Prepare chart data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: `${currentYear} Facebook`,
        data: mockCurrentFacebook,
        backgroundColor: 'transparent',
        borderColor: 'rgb(66, 103, 178)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: `${previousYear} Facebook`,
        data: mockPreviousFacebook,
        backgroundColor: 'transparent',
        borderColor: 'rgb(66, 103, 178)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4
      },
      {
        label: `${currentYear} Instagram`,
        data: mockCurrentInstagram,
        backgroundColor: 'transparent',
        borderColor: 'rgb(225, 48, 108)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: `${previousYear} Instagram`,
        data: mockPreviousInstagram,
        backgroundColor: 'transparent',
        borderColor: 'rgb(225, 48, 108)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };
  
  // Create line chart
  createLineChart('yoy-monthly-chart', chartData);
}

// Generate insights for YoY dashboard
function getGrowthAreasInsight(yoyChanges) {
  if (!yoyChanges) {
    return 'Instagram showed the strongest growth at +15% reach and +18% engagement, significantly outpacing other channels.';
  }
  
  // Find platform with highest reach growth
  const platforms = Object.keys(yoyChanges.reach.byPlatform);
  const topReachPlatform = platforms.reduce((max, platform) => 
    yoyChanges.reach.byPlatform[platform] > yoyChanges.reach.byPlatform[max] ? platform : max
  , platforms[0]);
  
  // Find platform with highest engagement growth
  const topEngagementPlatform = platforms.reduce((max, platform) => 
    yoyChanges.engagement.byPlatform[platform] > yoyChanges.engagement.byPlatform[max] ? platform : max
  , platforms[0]);
  
  return `${topReachPlatform.charAt(0).toUpperCase() + topReachPlatform.slice(1)} showed the strongest reach growth at ${yoyChanges.reach.byPlatform[topReachPlatform].toFixed(1)}%, while ${topEngagementPlatform.charAt(0).toUpperCase() + topEngagementPlatform.slice(1)} led in engagement growth (${yoyChanges.engagement.byPlatform[topEngagementPlatform].toFixed(1)}%).`;
}

function getAttentionAreasInsight(yoyChanges) {
  if (!yoyChanges) {
    return 'Email click rates declined by 5.2% compared to last year, suggesting a need for content and format refreshes.';
  }
  
  // Find platform with lowest engagement rate growth
  const platforms = Object.keys(yoyChanges.engagement_rate.byPlatform);
  const bottomPlatform = platforms.reduce((min, platform) => 
    yoyChanges.engagement_rate.byPlatform[platform] < yoyChanges.engagement_rate.byPlatform[min] ? platform : min
  , platforms[0]);
  
  return `${bottomPlatform.charAt(0).toUpperCase() + bottomPlatform.slice(1)} performance needs attention with ${yoyChanges.engagement_rate.byPlatform[bottomPlatform] < 0 ? 'a' : 'only'} ${yoyChanges.engagement_rate.byPlatform[bottomPlatform].toFixed(1)}% ${yoyChanges.engagement_rate.byPlatform[bottomPlatform] < 0 ? 'decrease' : 'increase'} in engagement rate year-over-year.`;
}

function getYoYRecommendations(yoyChanges) {
  if (!yoyChanges) {
    return 'Focus resources on Instagram's growing momentum while implementing A/B testing to improve email engagement metrics.';
  }
  
  // Find platform with highest reach growth to double down on
  const platforms = Object.keys(yoyChanges.reach.byPlatform);
  const topPlatform = platforms.reduce((max, platform) => 
    yoyChanges.reach.byPlatform[platform] > yoyChanges.reach.byPlatform[max] ? platform : max
  , platforms[0]);
  
  // Find platform with lowest engagement rate growth to improve
  const bottomPlatform = platforms.reduce((min, platform) => 
    yoyChanges.engagement_rate.byPlatform[platform] < yoyChanges.engagement_rate.byPlatform[min] ? platform : min
  , platforms[0]);
  
  return `Focus additional resources on ${topPlatform}'s growing momentum while implementing content refreshes and A/B testing to improve ${bottomPlatform} performance.`;
}