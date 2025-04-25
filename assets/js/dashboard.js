// Dashboard.js - Core dashboard functionality

class MarketingDashboard {
  constructor(config) {
    this.config = {
      dataDir: 'data',
      refreshInterval: 3600000, // 1 hour by default
      theme: 'light',
      ...config
    };
    
    this.metrics = {};
    this.metadataByName = {};
    this.dateRange = {
      start: null,
      end: null
    };
    
    this.charts = {};
    this.currentView = 'overview';
    
    // Initialize dashboard
    this.init();
  }
  
  async init() {
    try {
      // Load dashboard data
      await this.loadDashboardData();
      
      // Register event listeners
      this.registerEventListeners();
      
      // Initialize charts
      this.initializeCharts();
      
      // Show initial view
      this.showView(this.currentView);
      
      // Set up refresh interval
      if (this.config.refreshInterval > 0) {
        setInterval(() => this.refreshData(), this.config.refreshInterval);
      }
      
      console.log('Dashboard initialized successfully');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showError('Failed to initialize dashboard. Please check the console for details.');
    }
  }
  
  async loadDashboardData() {
    try {
      // Load all required data files
      const [metrics, metadata, campaigns, content, platforms, overview] = await Promise.all([
        this.fetchJSON('standardized_metrics.json'),
        this.fetchJSON('metrics_metadata.json'),
        this.fetchJSON('campaign_performance.json'),
        this.fetchJSON('content_performance.json'),
        this.fetchJSON('platform_performance.json'),
        this.fetchJSON('overview.json')
      ]);
      
      // Process and store the data
      this.processMetricsData(metrics, metadata);
      this.campaignData = campaigns;
      this.contentData = content;
      this.platformData = platforms;
      this.overview = overview;
      
      // Determine date range from the data
      this.determineDateRange();
      
      // Update last updated indicator
      this.updateLastUpdated(overview.last_updated);
      
      console.log('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      throw error;
    }
  }
  
  async fetchJSON(filename) {
    try {
      const response = await fetch(`${this.config.dataDir}/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${filename}:`, error);
      throw error;
    }
  }
  
  processMetricsData(metrics, metadata) {
    // Create lookup for metric metadata by name
    this.metadataByName = {};
    metadata.forEach(meta => {
      this.metadataByName[meta.metric_name] = meta;
    });
    
    // Store metrics
    this.metrics = metrics;
    
    // Group metrics by category
    this.metricsByCategory = {};
    Object.keys(this.metadataByName).forEach(metricName => {
      const meta = this.metadataByName[metricName];
      if (!this.metricsByCategory[meta.category]) {
        this.metricsByCategory[meta.category] = [];
      }
      this.metricsByCategory[meta.category].push(metricName);
    });
  }
  
  determineDateRange() {
    if (this.metrics && this.metrics.length > 0) {
      // Find min and max dates from metrics data
      const dates = this.metrics.map(m => new Date(m.date));
      this.dateRange.start = new Date(Math.min(...dates));
      this.dateRange.end = new Date(Math.max(...dates));
    } else if (this.overview && this.overview.period) {
      // Use date range from overview
      this.dateRange.start = new Date(this.overview.period.start_date);
      this.dateRange.end = new Date(this.overview.period.end_date);
    } else {
      // Default to last 30 days
      this.dateRange.end = new Date();
      this.dateRange.start = new Date();
      this.dateRange.start.setDate(this.dateRange.start.getDate() - 30);
    }
    
    // Update date range selector in UI
    this.updateDateRangeUI();
  }
  
  updateDateRangeUI() {
    const startInput = document.getElementById('date-range-start');
    const endInput = document.getElementById('date-range-end');
    
    if (startInput && endInput) {
      startInput.value = this.formatDate(this.dateRange.start);
      endInput.value = this.formatDate(this.dateRange.end);
    }
  }
  
  formatDate(date) {
    return date.toISOString().split('T')[0];
  }
  
  updateLastUpdated(timestamp) {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement) {
      const date = new Date(timestamp);
      lastUpdatedElement.textContent = `Last updated: ${date.toLocaleString()}`;
    }
  }
  
  registerEventListeners() {
    // Navigation handlers
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const view = event.target.getAttribute('data-view');
        this.showView(view);
      });
    });
    
    // Date range selector
    const applyDateRangeBtn = document.getElementById('apply-date-range');
    if (applyDateRangeBtn) {
      applyDateRangeBtn.addEventListener('click', () => {
        const startInput = document.getElementById('date-range-start');
        const endInput = document.getElementById('date-range-end');
        
        if (startInput && endInput) {
          this.dateRange.start = new Date(startInput.value);
          this.dateRange.end = new Date(endInput.value);
          this.refreshData();
        }
      });
    }
    
    // Period selector dropdowns
    document.querySelectorAll('.period-selector').forEach(selector => {
      selector.addEventListener('click', (event) => {
        event.preventDefault();
        const days = parseInt(event.target.getAttribute('data-days'), 10);
        this.setDateRangePeriod(days);
      });
    });
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
    
    // Export buttons
    document.querySelectorAll('.export-data').forEach(button => {
      button.addEventListener('click', (event) => {
        const format = event.target.getAttribute('data-format');
        this.exportData(format);
      });
    });
  }
  
  showView(viewName) {
    // Hide all views
    document.querySelectorAll('.dashboard-view').forEach(view => {
      view.classList.add('d-none');
    });
    
    // Remove active state from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(`${viewName}-view`);
    if (viewElement) {
      viewElement.classList.remove('d-none');
      
      // Set active state on nav link
      const navLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
      if (navLink) {
        navLink.classList.add('active');
      }
      
      this.currentView = viewName;
      
      // Update charts for this view
      this.updateChartsForView(viewName);
    } else {
      console.error(`View not found: ${viewName}`);
    }
  }
  
  initializeCharts() {
    // Initialize all charts with empty data first
    this.initializeOverviewCharts();
    this.initializeWebCharts();
    this.initializeSocialCharts();
    this.initializeEmailCharts();
    this.initializeYouTubeCharts();
    this.initializeCrossChannelCharts();
  }
  
  initializeOverviewCharts() {
    // Channel performance chart
    this.charts.channelPerformance = new Chart(
      document.getElementById('channel-performance-chart').getContext('2d'),
      {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Performance',
            data: [],
            backgroundColor: this.getChartColors()
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Channel Performance'
            }
          }
        }
      }
    );
    
    // Audience growth chart
    this.charts.audienceGrowth = new Chart(
      document.getElementById('audience-growth-chart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Audience Growth'
            }
          }
        }
      }
    );
    
    // Performance time chart
    this.charts.performanceTime = new Chart(
      document.getElementById('performance-time-chart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Performance Over Time'
            }
          }
        }
      }
    );
  }
  
  initializeWebCharts() {
    // Initialize web analytics charts
    this.charts.webTrafficSources = new Chart(
      document.getElementById('web-traffic-sources-chart').getContext('2d'),
      {
        type: 'doughnut',
        data: {
          labels: [],
          datasets: [{
            data: [],
            backgroundColor: this.getChartColors()
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
    
    // More web charts initialization...
  }
  
  initializeSocialCharts() {
    // Initialize social media charts
    this.charts.socialEngagement = new Chart(
      document.getElementById('social-engagement-chart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
    
    // More social charts initialization...
  }
  
  initializeEmailCharts() {
    // Initialize email marketing charts
    this.charts.emailPerformance = new Chart(
      document.getElementById('email-performance-chart').getContext('2d'),
      {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Open Rate',
            data: [],
            backgroundColor: this.getChartColors()[0]
          }, {
            label: 'Click Rate',
            data: [],
            backgroundColor: this.getChartColors()[1]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
    
    // More email charts initialization...
  }
  
  initializeYouTubeCharts() {
    // Initialize YouTube charts
    this.charts.youtubeViews = new Chart(
      document.getElementById('youtube-views-chart').getContext('2d'),
      {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Views',
            data: [],
            borderColor: this.getChartColors()[0],
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
    
    // More YouTube charts initialization...
  }
  
  initializeCrossChannelCharts() {
    // Initialize cross-channel charts
    this.charts.channelComparison = new Chart(
      document.getElementById('channel-comparison-chart').getContext('2d'),
      {
        type: 'radar',
        data: {
          labels: ['Reach', 'Engagement', 'Conversion', 'Retention', 'Growth'],
          datasets: []
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      }
    );
    
    // More cross-channel charts initialization...
  }
  
  updateChartsForView(viewName) {
    switch (viewName) {
      case 'overview':
        this.updateOverviewCharts();
        break;
      case 'web':
        this.updateWebCharts();
        break;
      case 'social':
        this.updateSocialCharts();
        break;
      case 'email':
        this.updateEmailCharts();
        break;
      case 'youtube':
        this.updateYouTubeCharts();
        break;
      case 'cross-channel':
        this.updateCrossChannelCharts();
        break;
    }
  }
  
  updateOverviewCharts() {
    // Update channel performance chart
    this.updateChannelPerformanceChart();
    
    // Update audience growth chart
    this.updateAudienceGrowthChart();
    
    // Update performance time chart
    this.updatePerformanceTimeChart();
    
    // Update KPI cards
    this.updateOverviewKPIs();
  }
  
  updateChannelPerformanceChart() {
    // Example implementation - would use real data from the backend
    const chart = this.charts.channelPerformance;
    
    // Use platform data if available
    if (this.platformData && this.platformData.length > 0) {
      // Group by platform and sum values
      const platformPerformance = {};
      this.platformData.forEach(item => {
        if (!platformPerformance[item.platform_name]) {
          platformPerformance[item.platform_name] = 0;
        }
        platformPerformance[item.platform_name] += item.sum_value;
      });
      
      // Update chart data
      chart.data.labels = Object.keys(platformPerformance);
      chart.data.datasets[0].data = Object.values(platformPerformance);
      chart.update();
    } else {
      // Use overview data as fallback
      if (this.overview && this.overview.platforms) {
        chart.data.labels = this.overview.platforms.map(p => p.name);
        chart.data.datasets[0].data = this.overview.platforms.map(p => p.metric_count);
        chart.update();
      }
    }
  }
  
  updateAudienceGrowthChart() {
    const chart = this.charts.audienceGrowth;
    
    // Extract audience growth metrics
    const audienceMetrics = this.getMetricsByCategory('audience');
    
    if (audienceMetrics && audienceMetrics.length > 0) {
      // Get time series data for each platform's audience size
      const platformAudience = {};
      
      // Group by platform
      audienceMetrics.forEach(metric => {
        if (metric.platform_name && !platformAudience[metric.platform_name]) {
          platformAudience[metric.platform_name] = {
            dates: [],
            values: []
          };
        }
        
        if (metric.platform_name) {
          platformAudience[metric.platform_name].dates.push(new Date(metric.date));
          platformAudience[metric.platform_name].values.push(metric.value);
        }
      });
      
      // Sort data by date for each platform
      Object.keys(platformAudience).forEach(platform => {
        // Create paired array of [date, value]
        const paired = platformAudience[platform].dates.map((date, i) => {
          return [date, platformAudience[platform].values[i]];
        });
        
        // Sort by date
        paired.sort((a, b) => a[0] - b[0]);
        
        // Unpack sorted data
        platformAudience[platform].dates = paired.map(p => p[0]);
        platformAudience[platform].values = paired.map(p => p[1]);
      });
      
      // Get unique dates across all platforms
      const allDates = [...new Set(
        Object.values(platformAudience).flatMap(p => p.dates.map(d => d.toISOString().split('T')[0]))
      )].sort();
      
      // Create datasets for each platform
      const datasets = Object.keys(platformAudience).map((platform, index) => {
        return {
          label: platform,
          data: platformAudience[platform].values,
          borderColor: this.getChartColors()[index % this.getChartColors().length],
          fill: false
        };
      });
      
      // Update chart
      chart.data.labels = allDates;
      chart.data.datasets = datasets;
      chart.update();
    } else {
      // No data available - use empty chart
      chart.data.labels = [];
      chart.data.datasets = [];
      chart.update();
    }
  }
  
  updatePerformanceTimeChart() {
    const chart = this.charts.performanceTime;
    
    // Get engagement and reach metrics over time
    const reachMetrics = this.getMetricsByCategory('reach');
    const engagementMetrics = this.getMetricsByCategory('engagement');
    
    if ((reachMetrics && reachMetrics.length > 0) || 
        (engagementMetrics && engagementMetrics.length > 0)) {
      // Get all unique dates
      const allMetrics = [...(reachMetrics || []), ...(engagementMetrics || [])];
      const dates = [...new Set(allMetrics.map(m => m.date))].sort();
      
      // Create datasets
      const datasets = [];
      
      if (reachMetrics && reachMetrics.length > 0) {
        const reachData = dates.map(date => {
          const metrics = reachMetrics.filter(m => m.date === date);
          return metrics.reduce((sum, m) => sum + m.value, 0);
        });
        
        datasets.push({
          label: 'Reach',
          data: reachData,
          borderColor: this.getChartColors()[0],
          fill: false
        });
      }
      
      if (engagementMetrics && engagementMetrics.length > 0) {
        const engagementData = dates.map(date => {
          const metrics = engagementMetrics.filter(m => m.date === date);
          return metrics.reduce((sum, m) => sum + m.value, 0);
        });
        
        datasets.push({
          label: 'Engagement',
          data: engagementData,
          borderColor: this.getChartColors()[1],
          fill: false
        });
      }
      
      // Update chart
      chart.data.labels = dates;
      chart.data.datasets = datasets;
      chart.update();
    } else {
      // No data available - use empty chart
      chart.data.labels = [];
      chart.data.datasets = [];
      chart.update();
    }
  }
  
  updateOverviewKPIs() {
    // Update KPI cards with latest values
    if (this.overview && this.overview.metrics) {
      // For each category of metrics
      Object.keys(this.overview.metrics).forEach(category => {
        this.overview.metrics[category].forEach(metric => {
          const kpiElement = document.getElementById(`kpi-${metric.name}`);
          if (kpiElement) {
            // Format the value based on unit
            let formattedValue = metric.value;
            if (metric.unit === 'percentage') {
              formattedValue = `${(metric.value * 100).toFixed(1)}%`;
            } else if (metric.unit === 'count' && metric.value >= 1000) {
              formattedValue = `${(metric.value / 1000).toFixed(1)}K`;
            }
            
            kpiElement.textContent = formattedValue;
          }
        });
      });
    }
  }
  
  updateWebCharts() {
    // Update web analytics charts with latest data
    // Implementation would be similar to updateOverviewCharts
  }
  
  updateSocialCharts() {
    // Update social media charts with latest data
    // Implementation would be similar to updateOverviewCharts
  }
  
  updateEmailCharts() {
    // Update email marketing charts with latest data
    // Implementation would be similar to updateOverviewCharts
  }
  
  updateYouTubeCharts() {
    // Update YouTube charts with latest data
    // Implementation would be similar to updateOverviewCharts
  }
  
  updateCrossChannelCharts() {
    // Update cross-channel charts with latest data
    // Implementation would be similar to updateOverviewCharts
  }
  
  getMetricsByCategory(category) {
    // Filter metrics by category using metadata
    if (!this.metrics || !this.metadataByName) {
      return [];
    }
    
    return this.metrics.filter(metric => {
      const metricNames = Object.keys(metric).filter(key => 
        key !== 'date' && this.metadataByName[key] && this.metadataByName[key].category === category
      );
      
      return metricNames.length > 0;
    }).flatMap(metric => {
      const result = [];
      
      Object.keys(metric).forEach(key => {
        if (key !== 'date' && this.metadataByName[key] && this.metadataByName[key].category === category) {
          result.push({
            date: metric.date,
            name: key,
            value: metric[key],
            category,
            display_name: this.metadataByName[key].display_name,
            unit: this.metadataByName[key].unit
          });
        }
      });
      
      return result;
    });
  }
  
  async refreshData() {
    try {
      document.body.classList.add('loading');
      await this.loadDashboardData();
      this.updateChartsForView(this.currentView);
      document.body.classList.remove('loading');
      
      console.log('Dashboard data refreshed');
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
      document.body.classList.remove('loading');
      this.showError('Failed to refresh dashboard data. Please check the console for details.');
    }
  }
  
  setDateRangePeriod(days) {
    this.dateRange.end = new Date();
    this.dateRange.start = new Date();
    this.dateRange.start.setDate(this.dateRange.start.getDate() - days);
    
    this.updateDateRangeUI();
    this.refreshData();
  }
  
  toggleTheme() {
    const body = document.body;
    
    if (body.classList.contains('dark-theme')) {
      body.classList.remove('dark-theme');
      this.config.theme = 'light';
    } else {
      body.classList.add('dark-theme');
      this.config.theme = 'dark';
    }
    
    // Update charts with new theme
    this.updateChartsTheme();
  }
  
  updateChartsTheme() {
    const isDark = this.config.theme === 'dark';
    const textColor = isDark ? '#fff' : '#666';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update global chart options
    Chart.defaults.color = textColor;
    Chart.defaults.scale.grid.color = gridColor;
    
    // Update each chart
    Object.values(this.charts).forEach(chart => {
      chart.options.plugins.legend.labels.color = textColor;
      chart.options.plugins.title.color = textColor;
      chart.options.scales.x.ticks.color = textColor;
      chart.options.scales.y.ticks.color = textColor;
      chart.options.scales.x.grid.color = gridColor;
      chart.options.scales.y.grid.color = gridColor;
      chart.update();
    });
  }
  
  exportData(format) {
    // Export dashboard data in the specified format
    if (format === 'csv') {
      this.exportAsCSV();
    } else if (format === 'json') {
      this.exportAsJSON();
    } else if (format === 'pdf') {
      this.exportAsPDF();
    } else if (format === 'excel') {
      this.exportAsExcel();
    }
  }
  
  exportAsCSV() {
    // Export current view data as CSV
    try {
      let data;
      
      switch (this.currentView) {
        case 'overview':
          data = this.metrics;
          break;
        case 'web':
          // Filter web-related metrics
          data = this.metrics.map(metric => {
            const webMetrics = {};
            webMetrics.date = metric.date;
            
            Object.keys(metric).forEach(key => {
              if (key !== 'date' && this.metadataByName[key] && 
                  (this.metadataByName[key].platform === 'google_analytics' ||
                   key.includes('web') || key.includes('website'))) {
                webMetrics[key] = metric[key];
              }
            });
            
            return webMetrics;
          });
          break;
        // Handle other views...
        default:
          data = this.metrics;
      }
      
      // Convert to CSV
      const csv = this.convertToCSV(data);
      
      // Download the CSV
      this.downloadFile(csv, `marketing-dashboard-${this.currentView}-${this.formatDate(new Date())}.csv`, 'text/csv');
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      this.showError('Failed to export data as CSV.');
    }
  }
  
  convertToCSV(data) {
    if (!data || data.length === 0) {
      return '';
    }
    
    // Get all keys
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    let csv = headers.join(',') + '\n';
    
    // Add data rows
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        
        // Handle special values
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      });
      
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }
  
  exportAsJSON() {
    // Export current view data as JSON
    try {
      let data;
      
      switch (this.currentView) {
        case 'overview':
          data = {
            metrics: this.metrics,
            metadata: Object.values(this.metadataByName),
            overview: this.overview
          };
          break;
        // Handle other views...
        default:
          data = {
            metrics: this.metrics,
            metadata: Object.values(this.metadataByName)
          };
      }
      
      // Convert to JSON string
      const json = JSON.stringify(data, null, 2);
      
      // Download the JSON
      this.downloadFile(json, `marketing-dashboard-${this.currentView}-${this.formatDate(new Date())}.json`, 'application/json');
      
    } catch (error) {
      console.error('Error exporting JSON:', error);
      this.showError('Failed to export data as JSON.');
    }
  }
  
  exportAsPDF() {
    // Placeholder for PDF export functionality
    alert('PDF export functionality is not yet implemented.');
  }
  
  exportAsExcel() {
    // Placeholder for Excel export functionality
    alert('Excel export functionality is not yet implemented.');
  }
  
  downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
  
  showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.classList.remove('d-none');
      
      // Hide error after 5 seconds
      setTimeout(() => {
        errorContainer.classList.add('d-none');
      }, 5000);
    } else {
      alert(message);
    }
  }
  
  getChartColors() {
    // Return theme-appropriate colors
    return this.config.theme === 'dark' 
      ? ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796']
      : ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];
  }
}

// Initialize the dashboard when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardInstance = new MarketingDashboard({
    dataDir: 'data',
    refreshInterval: 300000, // 5 minutes
    theme: 'light'
  });
});
