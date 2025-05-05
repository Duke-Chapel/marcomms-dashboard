/**
 * CSV to JSON Converter for Marketing Dashboard
 * 
 * This script converts CSV data to the JSON format required by the dashboard.
 */

// A function to convert CSV content to JSON
function csvToJson(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (lines[i].trim() === '') continue;
    
    const obj = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      // Try to convert to number if possible
      const value = currentLine[j] ? currentLine[j].trim() : '';
      obj[headers[j]] = !isNaN(value) && value !== '' ? Number(value) : value;
    }

    result.push(obj);
  }

  return result;
}

// Function to create standardized JSON data structures for the dashboard
function processFacebookData(csvData) {
  const data = csvToJson(csvData);
  // Process the data according to your dashboard's required structure
  return {
    reach: data.reduce((sum, item) => sum + (item.Reach || 0), 0),
    engagement: data.reduce((sum, item) => sum + ((item.Reactions || 0) + (item.Comments || 0) + (item.Shares || 0)), 0),
    engagement_rate: data.length > 0 ? 
      (data.reduce((sum, item) => sum + ((item.Reactions || 0) + (item.Comments || 0) + (item.Shares || 0)), 0) / 
       data.reduce((sum, item) => sum + (item.Reach || 0), 0) * 100).toFixed(2) : 0,
    views: data.reduce((sum, item) => sum + (item['3-second video views'] || 0), 0),
    posts: data.map(item => ({
      title: item.Title || 'Untitled',
      date: item['Publish time'] || '',
      reach: item.Reach || 0,
      reactions: item.Reactions || 0,
      comments: item.Comments || 0,
      shares: item.Shares || 0,
      views: item['3-second video views'] || 0
    })),
    performance_trend: [
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
    ]
  };
}

function processInstagramData(csvData) {
  const data = csvToJson(csvData);
  // Process Instagram data
  return {
    reach: data.reduce((sum, item) => sum + (item.Reach || 0), 0),
    engagement: data.reduce((sum, item) => sum + ((item.Likes || 0) + (item.Comments || 0) + (item.Shares || 0) + (item.Saves || 0)), 0),
    engagement_rate: data.length > 0 ? 
      (data.reduce((sum, item) => sum + ((item.Likes || 0) + (item.Comments || 0) + (item.Shares || 0) + (item.Saves || 0)), 0) / 
       data.reduce((sum, item) => sum + (item.Reach || 0), 0) * 100).toFixed(2) : 0,
    likes: data.reduce((sum, item) => sum + (item.Likes || 0), 0),
    posts: data.map(item => ({
      description: item.Description || 'No description',
      date: item['Publish time'] || '',
      type: item['Post type'] || 'Unknown',
      reach: item.Reach || 0,
      likes: item.Likes || 0,
      comments: item.Comments || 0,
      shares: item.Shares || 0,
      saves: item.Saves || 0
    })),
    performance_trend: [
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
    ]
  };
}

function processEmailData(csvData) {
  const data = csvToJson(csvData);
  
  // Helper function to clean percentage values
  const cleanPercentage = (value) => {
    if (typeof value === 'string' && value.includes('%')) {
      return parseFloat(value.replace('%', ''));
    }
    return value || 0;
  };
  
  // Process Email data
  return {
    campaigns: data.length,
    totalSent: data.reduce((sum, item) => sum + (parseInt(item['Emails sent'] || 0)), 0),
    totalDelivered: data.reduce((sum, item) => sum + (parseInt(item['Email deliveries'] || 0)), 0),
    totalOpens: data.reduce((sum, item) => sum + (parseInt(item['Email opened (MPP excluded)'] || 0)), 0),
    totalClicks: data.reduce((sum, item) => sum + (parseInt(item['Email clicked'] || 0)), 0),
    openRate: data.length > 0 ? 
      (data.reduce((sum, item) => sum + cleanPercentage(item['Email open rate (MPP excluded)']), 0) / data.length).toFixed(2) : 0,
    clickRate: data.length > 0 ? 
      (data.reduce((sum, item) => sum + cleanPercentage(item['Email click rate']), 0) / data.length).toFixed(2) : 0,
    bounceRate: data.length > 0 ? 
      (data.reduce((sum, item) => sum + cleanPercentage(item['Email bounce rate']), 0) / data.length).toFixed(2) : 0,
    unsubscribeRate: data.length > 0 ? 
      (data.reduce((sum, item) => sum + cleanPercentage(item['Email unsubscribe rate']), 0) / data.length).toFixed(2) : 0,
    campaigns: data.map(item => ({
      name: item.Campaign || 'Unnamed Campaign',
      sent: item['Emails sent'] || 0,
      delivered: item['Email deliveries'] || 0,
      opened: item['Email opened (MPP excluded)'] || 0,
      clicked: item['Email clicked'] || 0,
      openRate: cleanPercentage(item['Email open rate (MPP excluded)']),
      clickRate: cleanPercentage(item['Email click rate']),
      bounceRate: cleanPercentage(item['Email bounce rate']),
      unsubscribeRate: cleanPercentage(item['Email unsubscribe rate'])
    })),
    performance_trend: [
      { month: 'Jan', openRate: 21.2, clickRate: 2.5 },
      { month: 'Feb', openRate: 21.5, clickRate: 2.6 },
      { month: 'Mar', openRate: 22.1, clickRate: 2.7 },
      { month: 'Apr', openRate: 22.4, clickRate: 2.8 },
      { month: 'May', openRate: 22.7, clickRate: 2.9 },
      { month: 'Jun', openRate: 23.0, clickRate: 3.0 },
      { month: 'Jul', openRate: 23.2, clickRate: 3.1 },
      { month: 'Aug', openRate: 23.3, clickRate: 3.1 },
      { month: 'Sep', openRate: 23.5, clickRate: 3.2 },
      { month: 'Oct', openRate: 23.7, clickRate: 3.2 },
      { month: 'Nov', openRate: 23.8, clickRate: 3.3 },
      { month: 'Dec', openRate: 24.0, clickRate: 3.3 }
    ]
  };
}

// Helper function to convert HH:MM:SS to minutes
function convertDurationToMinutes(duration) {
  if (!duration) return 0;
  
  const parts = duration.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
  } else if (parts.length === 2) {
    return parseInt(parts[0]) + parseInt(parts[1]) / 60;
  }
  return 0;
}

function processYouTubeData(ageData, genderData, geoData, subscriptionData) {
  // Process YouTube data from multiple CSV sources
  const age = csvToJson(ageData);
  const gender = csvToJson(genderData);
  const geo = csvToJson(geoData);
  const subscription = csvToJson(subscriptionData);
  
  // Get total views and watch time
  const totalStats = subscription.find(item => item['Subscription status'] === 'Total') || {};
  
  return {
    totalViews: totalStats.Views || 0,
    totalWatchTime: totalStats['Watch time (hours)'] || 0,
    averageViewDuration: totalStats['Average view duration'] || '0:00',
    demographics: {
      age: age.map(item => ({
        group: item['Viewer age'] || '',
        viewPercentage: item['Views (%)'] || 0,
        watchTimePercentage: item['Watch time (hours) (%)'] || 0
      })),
      gender: gender.map(item => ({
        group: item['Viewer gender'] || '',
        viewPercentage: item['Views (%)'] || 0,
        watchTimePercentage: item['Watch time (hours) (%)'] || 0
      }))
    },
    geography: geo
      .filter(item => item.Geography !== 'Total')
      .sort((a, b) => (b.Views || 0) - (a.Views || 0))
      .slice(0, 10)
      .map(item => ({
        country: item.Geography || '',
        views: item.Views || 0,
        watchTime: item['Watch time (hours)'] || 0,
        averageDuration: item['Average view duration'] || '0:00'
      })),
    subscriptionStatus: subscription
      .filter(item => item['Subscription status'] !== 'Total')
      .map(item => ({
        status: item['Subscription status'] || '',
        views: item.Views || 0,
        watchTime: item['Watch time (hours)'] || 0,
        percentage: totalStats.Views ? (item.Views / totalStats.Views * 100).toFixed(1) : 0
      })),
    performance_trend: [
      { month: 'Jan', views: 4500, watchTime: 450 },
      { month: 'Feb', views: 4800, watchTime: 480 },
      { month: 'Mar', views: 5100, watchTime: 510 },
      { month: 'Apr', views: 5400, watchTime: 540 },
      { month: 'May', views: 5700, watchTime: 570 },
      { month: 'Jun', views: 6000, watchTime: 600 },
      { month: 'Jul', views: 6300, watchTime: 630 },
      { month: 'Aug', views: 6600, watchTime: 660 },
      { month: 'Sep', views: 6900, watchTime: 690 },
      { month: 'Oct', views: 7200, watchTime: 720 },
      { month: 'Nov', views: 7500, watchTime: 750 },
      { month: 'Dec', views: 7800, watchTime: 780 }
    ]
  };
}

function generateCrossChannelData(facebook, instagram, youtube, email) {
  return {
    reach: {
      total: (facebook?.reach || 0) + (instagram?.reach || 0),
      byPlatform: {
        facebook: facebook?.reach || 0,
        instagram: instagram?.reach || 0,
        youtube: youtube?.totalViews || 0
      }
    },
    engagement: {
      total: (facebook?.engagement || 0) + (instagram?.engagement || 0),
      byPlatform: {
        facebook: facebook?.engagement || 0,
        instagram: instagram?.engagement || 0,
        youtube: (youtube?.totalViews || 0) * 0.1 // Rough estimate of engagement
      }
    },
    engagement_rate: {
      overall: ((facebook?.engagement || 0) + (instagram?.engagement || 0)) / 
              ((facebook?.reach || 1) + (instagram?.reach || 1)) * 100,
      byPlatform: {
        facebook: facebook?.engagement_rate || 0,
        instagram: instagram?.engagement_rate || 0,
        email: email?.clickRate || 0
      }
    },
    performance_trend: [
      { month: 'Jan', facebook: 88, instagram: 92, youtube: 85, email: 90, web: 95 },
      { month: 'Feb', facebook: 90, instagram: 94, youtube: 88, email: 92, web: 96 },
      { month: 'Mar', facebook: 92, instagram: 95, youtube: 90, email: 94, web: 97 },
      { month: 'Apr', facebook: 95, instagram: 97, youtube: 92, email: 95, web: 98 },
      { month: 'May', facebook: 97, instagram: 99, youtube: 94, email: 96, web: 99 },
      { month: 'Jun', facebook: 99, instagram: 102, youtube: 96, email: 97, web: 100 },
      { month: 'Jul', facebook: 102, instagram: 104, youtube: 98, email: 98, web: 102 },
      { month: 'Aug', facebook: 104, instagram: 107, youtube: 100, email: 99, web: 104 },
      { month: 'Sep', facebook: 107, instagram: 110, youtube: 103, email: 100, web: 106 },
      { month: 'Oct', facebook: 110, instagram: 114, youtube: 105, email: 101, web: 108 },
      { month: 'Nov', facebook: 114, instagram: 117, youtube: 108, email: 102, web: 110 },
      { month: 'Dec', facebook: 118, instagram: 120, youtube: 110, email: 104, web: 112 }
    ],
    attribution: [
      { name: 'Organic Search', value: 32 },
      { name: 'Direct', value: 15 },
      { name: 'Social', value: 22 },
      { name: 'Email', value: 18 },
      { name: 'Referral', value: 8 },
      { name: 'Paid Search', value: 5 }
    ],
    content_performance: [
      { subject: 'Reach', Video: 92, Image: 68, Text: 42 },
      { subject: 'Engagement', Video: 85, Image: 65, Text: 38 },
      { subject: 'Clicks', Video: 78, Image: 62, Text: 45 },
      { subject: 'Shares', Video: 83, Image: 58, Text: 31 },
      { subject: 'Comments', Video: 75, Image: 52, Text: 35 }
    ],
    demographics: {
      age: [
        { age: '18-24', facebook: 15, instagram: 30, youtube: 18 },
        { age: '25-34', facebook: 28, instagram: 35, youtube: 31 },
        { age: '35-44', facebook: 22, instagram: 20, youtube: 23 },
        { age: '45-54', facebook: 18, instagram: 10, youtube: 14 },
        { age: '55-64', facebook: 12, instagram: 3, youtube: 8 },
        { age: '65+', facebook: 5, instagram: 2, youtube: 6 }
      ]
    },
    meta: {
      last_updated: new Date().toISOString()
    }
  };
}
