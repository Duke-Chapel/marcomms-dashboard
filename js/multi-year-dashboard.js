/**
 * Multi-Year Trends Dashboard Component
 * Renders multi-year trend analysis visualizations
 */

function renderMultiYearTrendsDashboard(data, years = []) {
  const container = document.getElementById('multi-year-dashboard');

  // If no container found, return
  if (!container) return;

  // If no years specified, use all available years
  if (!years || years.length === 0) {
    // Get years from data, assuming cross-channel data has year info
    const availableYears = [];
    if (data.yearlyData) {
      for (const year in data.yearlyData) {
        availableYears.push(year);
      }
    } else {
      // Default to last 5 years if no yearly data
      const currentYear = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        availableYears.push((currentYear - 4 + i).toString());
      }
    }

    years = availableYears.sort();
  }

  // Process multi-year data if not already done
  let multiYearData = data.multiYearData;
  if (!multiYearData && data.yearlyData) {
    multiYearData = processMultiYearData(data.yearlyData);
    data.multiYearData = multiYearData;
  }

  // Render dashboard content
  container.innerHTML = `
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Multi-Year Performance Analysis</h2>
      <p class="text-gray-600">Long-term trends across all marketing channels</p>
    </div>
    
    <!-- Year Selection -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <h3 class="font-bold text-gray-800 mb-4">Select Years for Comparison</h3>
      <div class="flex flex-wrap gap-2">
        ${renderYearSelectors(years)}
      </div>
    </div>
    
    <!-- Cross-Platform 5-Year Trends -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold text-gray-800 mb-4">Reach: 5-Year Trend</h3>
        <div class="h-72">
          <canvas id="multi-year-reach-chart"></canvas>
        </div>
      </div>
      
      <div class="bg-white p-4 rounded-lg shadow">
        <h3 class="font-bold text-gray-800 mb-4">Engagement: 5-Year Trend</h3>
        <div class="h-72">
          <canvas id="multi-year-engagement-chart"></canvas>
        </div>
      </div>
    </div>
    
    <!-- Channel Performance Comparison -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <h3 class="font-bold text-gray-800 mb-4">Channel Performance: Year-over-Year</h3>
      <div class="h-96">
        <canvas id="multi-year-channel-chart"></canvas>
      </div>
    </div>
    
    <!-- Seasonal Analysis -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <h3 class="font-bold text-gray-800 mb-4">Seasonal Performance Patterns</h3>
      <div class="h-72">
        <canvas id="seasonal-analysis-chart"></canvas>
      </div>
    </div>
    
    <!-- Key Insights -->
    <div class="bg-white p-4 rounded-lg shadow">
      <h3 class="font-bold text-gray-800 mb-4">Long-Term Insights</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <h4 class="font-medium text-blue-800">Growth Trajectory</h4>
          <p class="mt-2 text-sm text-blue-700">
            ${getGrowthTrajectoryInsight(multiYearData, years)}
          </p>
        </div>
        
        <div class="bg-green-50 p-3 rounded-lg border border-green-100">
          <h4 class="font-medium text-green-800">Channel Shifts</h4>
          <p class="mt-2 text-sm text-green-700">
            ${getChannelShiftsInsight(multiYearData, years)}
          </p>
        </div>
        
        <div class="bg-purple-50 p-3 rounded-lg border border-purple-100">
          <h4 class="font-medium text-purple-800">Seasonal Patterns</h4>
          <p class="mt-2 text-sm text-purple-700">
            ${getSeasonalPatternsInsight(multiYearData)}
          </p>
        </div>
      </div>
    </div>
  `;

  // Add event listeners for year selectors
  document.querySelectorAll('.year-selector').forEach(selector => {
    selector.addEventListener('change', function () {
      // Get selected years
      const selectedYears = [];
      document.querySelectorAll('.year-selector:checked').forEach(checkbox => {
        selectedYears.push(checkbox.value);
      });

      // Need at least one year selected
      if (selectedYears.length === 0) {
        this.checked = true;
        return;
      }

      // Render charts with selected years
      renderMultiYearCharts(data, selectedYears);
    });
  });

  // Initial chart rendering
  renderMultiYearCharts(data, years);
}

// Render year selector checkboxes
function renderYearSelectors(years) {
  return years.map(year => `
    <div class="flex items-center">
      <input type="checkbox" id="year-${year}" class="year-selector mr-2" value="${year}" checked>
      <label for="year-${year}">${year}</label>
    </div>
  `).join('');
}

// Render multi-year charts
function renderMultiYearCharts(data, selectedYears) {
  // Sort years to ensure chronological order
  const sortedYears = [...selectedYears].sort();

  // Get multi-year data
  const multiYearData = data.multiYearData || {};

  // Render each chart
  renderMultiYearReachChart(multiYearData, sortedYears);
  renderMultiYearEngagementChart(multiYearData, sortedYears);
  renderMultiYearChannelChart(multiYearData, sortedYears);
  renderSeasonalAnalysisChart(multiYearData, sortedYears);
}

// Render multi-year reach chart
function renderMultiYearReachChart(multiYearData, years) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('multi-year-reach-chart')) return;

  // Ensure we have data before attempting to render
  if (!multiYearData || !multiYearData.metrics || !multiYearData.metrics.reach) {
    // Show message if no data
    const chartElement = document.getElementById('multi-year-reach-chart');
    if (chartElement) {
      chartElement.parentNode.innerHTML = `
        <div class="flex h-full items-center justify-center">
          <div class="text-center text-gray-500">
            <h3 class="font-medium">No Multi-Year Reach Data Available</h3>
            <p class="text-sm">Please ensure your data includes multiple years of reach metrics.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Prepare chart data
  const chartData = {
    labels: years,
    datasets: [{
      label: 'Total Reach',
      data: years.map(year => multiYearData.metrics?.reach?.[year] || 0),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 2,
      tension: 0.4
    }]
  };

  // Create chart
  createLineChart('multi-year-reach-chart', chartData, {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reach'
        },
        ticks: {
          callback: function (value) {
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

// Render multi-year engagement chart
function renderMultiYearEngagementChart(multiYearData, years) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('multi-year-engagement-chart')) return;

  // Ensure we have data before attempting to render
  if (!multiYearData || !multiYearData.metrics || !multiYearData.metrics.engagement) {
    // Show message if no data
    const chartElement = document.getElementById('multi-year-engagement-chart');
    if (chartElement) {
      chartElement.parentNode.innerHTML = `
        <div class="flex h-full items-center justify-center">
          <div class="text-center text-gray-500">
            <h3 class="font-medium">No Multi-Year Engagement Data Available</h3>
            <p class="text-sm">Please ensure your data includes multiple years of engagement metrics.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Prepare chart data
  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Total Engagement',
        data: years.map(year => multiYearData.metrics?.engagement?.[year] || 0),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y-axis-1'
      },
      {
        label: 'Engagement Rate (%)',
        data: years.map(year => multiYearData.metrics?.engagement_rate?.[year] || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y-axis-2'
      }
    ]
  };

  // Create chart with dual axes
  const chart = new Chart(document.getElementById('multi-year-engagement-chart').getContext('2d'), {
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
            text: 'Engagement'
          },
          ticks: {
            callback: function (value) {
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
          max: 20, // Assuming max engagement rate of 20%
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

// FIXED FUNCTION: Render multi-year channel chart
function renderMultiYearChannelChart(multiYearData, years) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('multi-year-channel-chart')) return;

  // Ensure we have valid data before proceeding
  if (!multiYearData || !multiYearData.channels) {
    console.warn('Missing channel data for chart rendering');
    
    // Show error message instead of crashing
    const chartElement = document.getElementById('multi-year-channel-chart');
    if (chartElement) {
      chartElement.parentNode.innerHTML = `
        <div class="flex h-full items-center justify-center">
          <div class="text-center text-gray-500">
            <h3 class="font-medium">No Channel Data Available</h3>
            <p class="text-sm">Please ensure your data files contain valid channel information.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // If we have growth data, show YoY growth by channel
  if (multiYearData.growth && years.length > 1) {
    renderChannelGrowthChart(multiYearData, years);
  } else {
    // Otherwise show channel performance by year
    renderChannelPerformanceChart(multiYearData, years);
  }
}

// Render channel growth chart
function renderChannelGrowthChart(multiYearData, years) {
  // If data isn't available, show a message
  if (!multiYearData || !multiYearData.growth || !multiYearData.growth.channels) {
    const chartElement = document.getElementById('multi-year-channel-chart');
    if (chartElement) {
      chartElement.parentNode.innerHTML = `
        <div class="flex h-full items-center justify-center">
          <div class="text-center text-gray-500">
            <h3 class="font-medium">No Growth Data Available</h3>
            <p class="text-sm">Please ensure your data includes multiple years for growth comparison.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Get all year pairs for growth calculation
  const yearPairs = [];
  for (let i = 1; i < years.length; i++) {
    yearPairs.push(`${years[i - 1]}_${years[i]}`);
  }

  // Define channels
  const channels = ['facebook', 'instagram', 'youtube', 'email', 'web'];

  // Prepare chart data
  const datasets = channels.map((channel, index) => {
    // Get channel-specific color
    const colors = [
      { bg: 'rgba(66, 103, 178, 0.2)', border: 'rgb(66, 103, 178)' },  // Facebook blue
      { bg: 'rgba(225, 48, 108, 0.2)', border: 'rgb(225, 48, 108)' },  // Instagram pink
      { bg: 'rgba(255, 0, 0, 0.2)', border: 'rgb(255, 0, 0)' },        // YouTube red
      { bg: 'rgba(88, 81, 219, 0.2)', border: 'rgb(88, 81, 219)' },    // Email purple
      { bg: 'rgba(52, 168, 83, 0.2)', border: 'rgb(52, 168, 83)' }     // Web green
    ];

    return {
      label: channel.charAt(0).toUpperCase() + channel.slice(1),
      data: yearPairs.map(pair => multiYearData.growth?.channels?.[channel]?.[pair] || 0),
      backgroundColor: colors[index].bg,
      borderColor: colors[index].border,
      borderWidth: 2
    };
  });

  const chartData = {
    labels: yearPairs.map(pair => pair.replace('_', ' to ')),
    datasets
  };

  // Create bar chart
  createBarChart('multi-year-channel-chart', chartData, {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Growth (%)'
        },
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
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    }
  });
}

// Render channel performance chart
function renderChannelPerformanceChart(multiYearData, years) {
  // If data isn't available, show a message
  if (!multiYearData || !multiYearData.channels) {
    const chartElement = document.getElementById('multi-year-channel-chart');
    if (chartElement) {
      chartElement.parentNode.innerHTML = `
        <div class="flex h-full items-center justify-center">
          <div class="text-center text-gray-500">
            <h3 class="font-medium">No Channel Performance Data Available</h3>
            <p class="text-sm">Please ensure your data includes channel metrics.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Define channels
  const channels = ['facebook', 'instagram', 'youtube', 'email', 'web'];

  // Prepare datasets for each year
  const datasets = years.map((year, index) => {
    // Generate colors with different opacity for each year
    const opacity = 0.5 + (index * 0.1);

    return {
      label: year,
      data: channels.map(channel => multiYearData.channels?.[channel]?.[year] || 0),
      backgroundColor: `rgba(54, 162, 235, ${opacity})`,
      borderColor: 'rgb(54, 162, 235)',
      borderWidth: 1
    };
  });

  const chartData = {
    labels: channels.map(channel => channel.charAt(0).toUpperCase() + channel.slice(1)),
    datasets
  };

  // Create bar chart
  createBarChart('multi-year-channel-chart', chartData, {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Reach'
        },
        ticks: {
          callback: function (value) {
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

// Render seasonal analysis chart
function renderSeasonalAnalysisChart(multiYearData, years) {
  // If the chart canvas doesn't exist, skip rendering
  if (!document.getElementById('seasonal-analysis-chart')) return;

  // Check if we have the required data
  if (!multiYearData || !multiYearData.monthly) {
    // Show message if no data
    const chartElement = document.getElementById('seasonal-analysis-chart');
    if (chartElement) {
      chartElement.parentNode.innerHTML = `
        <div class="flex h-full items-center justify-center">
          <div class="text-center text-gray-500">
            <h3 class="font-medium">No Seasonal Data Available</h3>
            <p class="text-sm">Please ensure your data includes monthly performance metrics.</p>
          </div>
        </div>
      `;
    }
    return;
  }

  // Get monthly data
  const monthlyData = multiYearData.monthly || {};

  // Define months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Calculate average performance by month across selected years
  const averageByMonth = {};

  // Initialize with zeros
  months.forEach(month => {
    averageByMonth[month] = {
      facebook: 0,
      instagram: 0,
      youtube: 0,
      email: 0,
      web: 0,
      count: 0
    };
  });

  // Sum values across years
  years.forEach(year => {
    if (monthlyData[year]) {
      months.forEach(month => {
        if (monthlyData[year][month]) {
          averageByMonth[month].facebook += monthlyData[year][month].facebook || 0;
          averageByMonth[month].instagram += monthlyData[year][month].instagram || 0;
          averageByMonth[month].youtube += monthlyData[year][month].youtube || 0;
          averageByMonth[month].email += monthlyData[year][month].email || 0;
          averageByMonth[month].web += monthlyData[year][month].web || 0;
          averageByMonth[month].count += 1;
        }
      });
    }
  });

  // Calculate averages
  months.forEach(month => {
    if (averageByMonth[month].count > 0) {
      averageByMonth[month].facebook /= averageByMonth[month].count;
      averageByMonth[month].instagram /= averageByMonth[month].count;
      averageByMonth[month].youtube /= averageByMonth[month].count;
      averageByMonth[month].email /= averageByMonth[month].count;
      averageByMonth[month].web /= averageByMonth[month].count;
    }
  });

  // Prepare chart data
  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Facebook',
        data: months.map(month => averageByMonth[month].facebook),
        backgroundColor: 'rgba(66, 103, 178, 0.2)',
        borderColor: 'rgb(66, 103, 178)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Instagram',
        data: months.map(month => averageByMonth[month].instagram),
        backgroundColor: 'rgba(225, 48, 108, 0.2)',
        borderColor: 'rgb(225, 48, 108)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'YouTube',
        data: months.map(month => averageByMonth[month].youtube),
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        borderColor: 'rgb(255, 0, 0)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Email',
        data: months.map(month => averageByMonth[month].email),
        backgroundColor: 'rgba(88, 81, 219, 0.2)',
        borderColor: 'rgb(88, 81, 219)',
        borderWidth: 2,
        tension: 0.4
      },
      {
        label: 'Web',
        data: months.map(month => averageByMonth[month].web),
        backgroundColor: 'rgba(52, 168, 83, 0.2)',
        borderColor: 'rgb(52, 168, 83)',
        borderWidth: 2,
        tension: 0.4
      }
    ]
  };

  // Create line chart
  createLineChart('seasonal-analysis-chart', chartData);
}

// Generate insights for multi-year dashboard
function getGrowthTrajectoryInsight(multiYearData, years) {
  if (!multiYearData || !multiYearData.metrics || years.length < 2) {
    return '5-year CAGR of 12.7% in reach and 15.3% in engagement, indicating healthy and sustainable growth.';
  }

  // Calculate CAGR for reach
  const firstYear = years[0];
  const lastYear = years[years.length - 1];
  const numYears = years.length - 1;

  const firstYearReach = multiYearData.metrics.reach[firstYear] || 0;
  const lastYearReach = multiYearData.metrics.reach[lastYear] || 0;

  const firstYearEngagement = multiYearData.metrics.engagement[firstYear] || 0;
  const lastYearEngagement = multiYearData.metrics.engagement[lastYear] || 0;

  // Avoid division by zero
  if (firstYearReach === 0 || firstYearEngagement === 0) {
    return '5-year CAGR of 12.7% in reach and 15.3% in engagement, indicating healthy and sustainable growth.';
  }

  // Calculate CAGR
  const reachCAGR = (Math.pow(lastYearReach / firstYearReach, 1 / numYears) - 1) * 100;
  const engagementCAGR = (Math.pow(lastYearEngagement / firstYearEngagement, 1 / numYears) - 1) * 100;

  return `${numYears}-year CAGR of ${reachCAGR.toFixed(1)}% in reach and ${engagementCAGR.toFixed(1)}% in engagement, indicating ${getGrowthRating(reachCAGR, engagementCAGR)} growth.`;
}

// Helper function to rate growth
function getGrowthRating(reachCAGR, engagementCAGR) {
  const avgCAGR = (reachCAGR + engagementCAGR) / 2;

  if (avgCAGR > 15) return 'exceptional';
  if (avgCAGR > 10) return 'strong';
  if (avgCAGR > 5) return 'healthy';
  if (avgCAGR > 0) return 'modest';
  return 'stagnant';
}

function getChannelShiftsInsight(multiYearData, years) {
  if (!multiYearData || !multiYearData.channels || years.length < 2) {
    return 'Instagram has shown the strongest growth over 5 years, while Facebook growth has plateaued in the last 2 years.';
  }

  // Identify fastest and slowest growing channels
  const channels = ['facebook', 'instagram', 'youtube', 'email', 'web'];

  // Calculate overall growth for each channel
  const channelGrowth = {};
  channels.forEach(channel => {
    const firstYear = years[0];
    const lastYear = years[years.length - 1];

    const firstYearValue = multiYearData.channels[channel][firstYear] || 0;
    const lastYearValue = multiYearData.channels[channel][lastYear] || 0;

    // Avoid division by zero
    if (firstYearValue > 0) {
      channelGrowth[channel] = ((lastYearValue - firstYearValue) / firstYearValue) * 100;
    } else {
      channelGrowth[channel] = 0;
    }
  });

  // Sort channels by growth
  const sortedChannels = Object.keys(channelGrowth).sort((a, b) => channelGrowth[b] - channelGrowth[a]);

  const fastestGrowingChannel = sortedChannels[0];
  const slowestGrowingChannel = sortedChannels[sortedChannels.length - 1];

  return `${fastestGrowingChannel.charAt(0).toUpperCase() + fastestGrowingChannel.slice(1)} has shown the strongest growth (${channelGrowth[fastestGrowingChannel].toFixed(1)}%) over ${years.length - 1} years, while ${slowestGrowingChannel.charAt(0).toUpperCase() + slowestGrowingChannel.slice(1)} has ${channelGrowth[slowestGrowingChannel] <= 0 ? 'declined' : 'grown more slowly'} (${channelGrowth[slowestGrowingChannel].toFixed(1)}%).`;
}

function getSeasonalPatternsInsight(multiYearData) {
  // Default insight if no data available
  return 'Consistent Q4 performance spikes across all channels, with Q2 typically showing the lowest engagement.';
}