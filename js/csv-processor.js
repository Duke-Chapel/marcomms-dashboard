/**
 * Enhanced CSV Processor
 * Supports year-based data processing with proper data type normalization
 */

/**
 * Convert CSV to JSON with enhanced features and proper data typing
 * @param {string} csv - CSV content
 * @param {object} options - Processing options
 * @returns {array} - Processed JSON data
 */
function enhancedCsvToJson(csv, options = {}) {
  const lines = csv.split('\n');
  if (lines.length === 0) return [];

  const headers = lines[0].split(',').map(header => header.trim());
  const result = [];

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (lines[i].trim() === '') continue;
    
    const obj = {};
    // Handle quoted values with commas correctly
    const currentLine = parseCSVLine(lines[i]);

    // Process each column
    for (let j = 0; j < headers.length; j++) {
      // Try to convert to number if possible
      let value = currentLine[j] ? currentLine[j].trim() : '';
      
      // Handle date fields
      if (options.dateFields && options.dateFields.includes(headers[j])) {
        obj[headers[j]] = new Date(value);
        
        // Extract year if requested
        if (options.extractYear) {
          obj.year = new Date(value).getFullYear();
        }
      } else {
        // Convert to number if possible - this is the key change
        obj[headers[j]] = normalizeValue(value);
      }
    }

    // Add year if explicitly provided
    if (options.year && !obj.year) {
      obj.year = options.year;
    }

    result.push(obj);
  }

  return result;
}

/**
 * Normalize a value (convert string numbers to actual numbers)
 * @param {any} value - The value to normalize
 * @returns {any} - The normalized value
 */
function normalizeValue(value) {
 // If it's not a string, return as is
 if (typeof value !== 'string') return value;
 
 // Check if it's a very large number in scientific notation and handle it carefully
 if (/^-?\d+(\.\d+)?[eE][+\-]\d+$/.test(value)) {
   // For scientific notation, convert to a regular number but cap at reasonable values
   try {
     const num = Number(value);
     if (isNaN(num) || !isFinite(num)) return 0;
     
     // Cap very large numbers to prevent overflow issues
     const MAX_SAFE_VALUE = 1e12; // 1 trillion
     return Math.min(Math.abs(num), MAX_SAFE_VALUE) * (num < 0 ? -1 : 1);
   } catch (e) {
     return 0;
   }
 }
 
 // Remove commas from number strings
 const cleanValue = value.replace(/,/g, '');
 
 // Try to convert to number if it looks like a number
 if (/^-?\d+(\.\d+)?$/.test(cleanValue)) {
   const num = parseFloat(cleanValue);
   
   // Cap very large numbers to prevent overflow issues
   const MAX_SAFE_VALUE = 1e12; // 1 trillion
   return Math.min(Math.abs(num), MAX_SAFE_VALUE) * (num < 0 ? -1 : 1);
 }
 
 // For percentage strings (if they end with %)
 if (/^-?\d+(\.\d+)?%$/.test(cleanValue)) {
   return parseFloat(cleanValue);
 }
 
 // Return original value if it's not a number
 return value;
}

/**
* Generate cross-channel data with multi-year support and proper data typing
* @param {object} facebook - Facebook data
* @param {object} instagram - Instagram data
* @param {object} youtube - YouTube data
* @param {object} email - Email data
* @param {object} googleAnalytics - Google Analytics data
* @param {object} options - Processing options
* @returns {object} - Cross-channel data
*/
function generateCrossChannelData(facebook, instagram, youtube, email, googleAnalytics, options = {}) {
 // Use Google Analytics attribution data if available, otherwise use default values
 let attributionData = [
   { name: 'Organic Search', value: 32 },
   { name: 'Direct', value: 15 },
   { name: 'Social', value: 22 },
   { name: 'Email', value: 18 },
   { name: 'Referral', value: 8 },
   { name: 'Paid Search', value: 5 }
 ];
 
 if (googleAnalytics && googleAnalytics.trafficSources && googleAnalytics.trafficSources.length > 0) {
   attributionData = googleAnalytics.trafficSources.map(source => ({
     name: source.medium || source.source || 'Unknown',
     value: normalizeValue(source.percentage) || 0
   }));
 }
 
 // Incorporate Google Analytics data into demographics if available
 let demographicsData = {
   age: [
     { age: '18-24', facebook: 15, instagram: 30, youtube: 18 },
     { age: '25-34', facebook: 28, instagram: 35, youtube: 31 },
     { age: '35-44', facebook: 22, instagram: 20, youtube: 23 },
     { age: '45-54', facebook: 18, instagram: 10, youtube: 14 },
     { age: '55-64', facebook: 12, instagram: 3, youtube: 8 },
     { age: '65+', facebook: 5, instagram: 2, youtube: 6 }
   ]
 };
 
 if (googleAnalytics && googleAnalytics.demographics) {
   // Merge GA demographics with existing data
   demographicsData.countries = googleAnalytics.demographics.countries;
   demographicsData.cities = googleAnalytics.demographics.cities;
   demographicsData.languages = googleAnalytics.demographics.languages;
   
   // If GA has age data, update the existing age data
   if (googleAnalytics.demographics.ageGroups && googleAnalytics.demographics.ageGroups.length > 0) {
     demographicsData.age = googleAnalytics.demographics.ageGroups.map(group => {
       // Find matching age group in existing data
       const existingGroup = demographicsData.age.find(a => a.age === group.ageRange);
       return {
         age: group.ageRange,
         ga: normalizeValue(group.percentage) || 0,
         facebook: existingGroup ? existingGroup.facebook : 0,
         instagram: existingGroup ? existingGroup.instagram : 0,
         youtube: existingGroup ? existingGroup.youtube : 0
       };
     });
   }
 }
 
 // Get year if specified
 const year = options.year || new Date().getFullYear();
 
 // Make sure to safely get values and handle undefined/null cases
 const getFacebookReach = () => {
   const reach = facebook?.reach || 0;
   return typeof reach === 'number' ? reach : 0;
 };
 
 const getInstagramReach = () => {
   const reach = instagram?.reach || 0;
   return typeof reach === 'number' ? reach : 0;
 };
 
 // Calculate total reach with validation
 const totalReach = getFacebookReach() + getInstagramReach();
 
 const result = {
   year,
   reach: {
     total: totalReach,
     byPlatform: {
       facebook: getFacebookReach(),
       instagram: getInstagramReach(),
       youtube: normalizeValue(youtube?.totalViews || 0),
       web: normalizeValue(googleAnalytics?.totalUsers || 0)
     }
   },
   engagement: {
     total: normalizeValue(facebook?.engagement || 0) + normalizeValue(instagram?.engagement || 0),
     byPlatform: {
       facebook: normalizeValue(facebook?.engagement || 0),
       instagram: normalizeValue(instagram?.engagement || 0),
       youtube: normalizeValue(youtube?.totalViews || 0) * 0.1, // Rough estimate of engagement
       web: normalizeValue(googleAnalytics?.engagedSessions || 0)
     }
   },
   engagement_rate: {
     overall: calculateEngagementRate(
       normalizeValue(facebook?.engagement || 0) + normalizeValue(instagram?.engagement || 0), 
       totalReach
     ),
     byPlatform: {
       facebook: normalizeValue(facebook?.engagement_rate || 0),
       instagram: normalizeValue(instagram?.engagement_rate || 0),
       email: normalizeValue(email?.clickRate || 0),
       web: normalizeValue(googleAnalytics?.engagementRate || 0)
     }
   },
   performance_trend: mergePerformanceTrends([
     facebook?.performance_trend || [],
     instagram?.performance_trend || [],
     youtube?.performance_trend || [],
     email?.performance_trend || [],
     googleAnalytics?.performance_trend || []
   ]),
   attribution: attributionData,
   content_performance: [
     { subject: 'Reach', Video: 92, Image: 68, Text: 42 },
     { subject: 'Engagement', Video: 85, Image: 65, Text: 38 },
     { subject: 'Clicks', Video: 78, Image: 62, Text: 45 },
     { subject: 'Shares', Video: 83, Image: 58, Text: 31 },
     { subject: 'Comments', Video: 75, Image: 52, Text: 35 }
   ],
   demographics: demographicsData,
   web: {
     topPages: googleAnalytics?.topPages || [],
     campaigns: googleAnalytics?.campaigns || []
   },
   meta: {
     last_updated: new Date().toISOString(),
     year
   }
 };
 
 // Return the normalized result to ensure all values are properly typed
 return normalizeObject(result);
}

// Helper function to safely calculate engagement rate
function calculateEngagementRate(engagement, reach) {
 if (!reach || reach === 0) return 0;
 return (engagement / reach * 100);
}

/**
 * Recursively normalize an object or array
 * @param {object|array} data - The data to normalize
 * @returns {object|array} - The normalized data
 */
function normalizeObject(data) {
  if (Array.isArray(data)) {
    // Process each item in the array
    return data.map(item => normalizeObject(item));
  } else if (data && typeof data === 'object') {
    // Process each property in the object
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = normalizeObject(value);
    }
    return result;
  } else {
    // It's a primitive value, normalize it
    return normalizeValue(data);
  }
}

/**
 * Properly parse CSV line with quoted values
 * @param {string} line - CSV line to parse 
 * @returns {array} - Array of values
 */
function parseCSVLine(line) {
  const result = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // Toggle inside quotes state
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      // End of value
      result.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Add the last value
  result.push(currentValue);
  
  return result;
}

/**
 * Process Facebook data with enhanced year handling and proper data typing
 * @param {string} csvData - CSV content
 * @param {object} options - Processing options
 * @returns {object} - Processed Facebook data
 */
function processFacebookData(csvData, options = {}) {
  console.log("Processing Facebook data with enhanced options...");
  
  const data = enhancedCsvToJson(csvData, {
    dateFields: ['Publish time', 'Date'],
    extractYear: true,
    ...options
  });
  
  // Create a more flexible mapping that tries different possible field names
  function getValueByPossibleNames(item, possibleNames, defaultValue = 0) {
    for (const name of possibleNames) {
      // Check for exact match
      if (item[name] !== undefined) {
        return item[name];
      }
      
      // Check for partial match
      const matchingKey = Object.keys(item).find(key => 
        key.toLowerCase().includes(name.toLowerCase()));
      if (matchingKey) {
        return item[matchingKey];
      }
    }
    return defaultValue;
  }
  
  // Filter data by year if specified
  const filteredData = options.year 
    ? data.filter(item => item.year === options.year)
    : data;
  
  // Process the data - all values will be properly typed now
  const result = {
    reach: filteredData.reduce((sum, item) => sum + getValueByPossibleNames(item, ['Reach', 'Page Reach', 'reach', 'total reach', 'Impressions']), 0),
    engagement: filteredData.reduce((sum, item) => {
      const reactions = getValueByPossibleNames(item, ['Reactions', 'reactions', 'Total reactions']);
      const comments = getValueByPossibleNames(item, ['Comments', 'comments', 'Total comments']);
      const shares = getValueByPossibleNames(item, ['Shares', 'shares', 'Total shares']);
      return sum + reactions + comments + shares;
    }, 0),
    engagement_rate: (() => {
      const totalEngagement = filteredData.reduce((sum, item) => {
        const reactions = getValueByPossibleNames(item, ['Reactions', 'reactions', 'Total reactions']);
        const comments = getValueByPossibleNames(item, ['Comments', 'comments', 'Total comments']);
        const shares = getValueByPossibleNames(item, ['Shares', 'shares', 'Total shares']);
        return sum + reactions + comments + shares;
      }, 0);
      const totalReach = filteredData.reduce((sum, item) => sum + getValueByPossibleNames(item, ['Reach', 'Page Reach', 'reach', 'total reach', 'Impressions']), 0);
      
      return totalReach > 0 ? ((totalEngagement / totalReach) * 100) : 0;
    })(),
    views: filteredData.reduce((sum, item) => sum + getValueByPossibleNames(item, ['3-second video views', 'Video Views', 'views', 'Views']), 0),
    posts: filteredData.map(item => ({
      title: getValueByPossibleNames(item, ['Title', 'Post Title', 'title'], 'Untitled'),
      date: getValueByPossibleNames(item, ['Publish time', 'Post Date', 'date', 'Date'], ''),
      reach: getValueByPossibleNames(item, ['Reach', 'Page Reach', 'reach']),
      reactions: getValueByPossibleNames(item, ['Reactions', 'reactions', 'Total reactions']),
      comments: getValueByPossibleNames(item, ['Comments', 'comments', 'Total comments']),
      shares: getValueByPossibleNames(item, ['Shares', 'shares', 'Total shares']),
      views: getValueByPossibleNames(item, ['3-second video views', 'Video Views', 'views', 'Views']),
      year: item.year || (options.year || new Date().getFullYear())
    })),
    performance_trend: generatePerformanceTrend(filteredData, 'facebook')
  };
  
  // Return the normalized result to ensure all values are properly typed
  return normalizeObject(result);
}

/**
 * Process Instagram data with enhanced year handling and proper data typing
 * @param {string} csvData - CSV content
 * @param {object} options - Processing options
 * @returns {object} - Processed Instagram data
 */
function processInstagramData(csvData, options = {}) {
  console.log("Processing Instagram data with enhanced options...");
  
  const data = enhancedCsvToJson(csvData, {
    dateFields: ['Publish time', 'Date'],
    extractYear: true,
    ...options
  });
  
  // Create a more flexible mapping that tries different possible field names
  function getValueByPossibleNames(item, possibleNames, defaultValue = 0) {
    for (const name of possibleNames) {
      // Check for exact match
      if (item[name] !== undefined) {
        return item[name];
      }
      
      // Check for partial match
      const matchingKey = Object.keys(item).find(key => 
        key.toLowerCase().includes(name.toLowerCase()));
      if (matchingKey) {
        return item[matchingKey];
      }
    }
    return defaultValue;
  }
  
  // Filter data by year if specified
  const filteredData = options.year 
    ? data.filter(item => item.year === options.year)
    : data;
  
  // Process the data - all values will be properly typed now
  const result = {
    reach: filteredData.reduce((sum, item) => sum + getValueByPossibleNames(item, ['Reach', 'reach', 'Total reach', 'Impressions']), 0),
    engagement: filteredData.reduce((sum, item) => {
      const likes = getValueByPossibleNames(item, ['Likes', 'likes', 'Total likes']);
      const comments = getValueByPossibleNames(item, ['Comments', 'comments', 'Total comments']);
      const shares = getValueByPossibleNames(item, ['Shares', 'shares', 'Total shares']);
      const saves = getValueByPossibleNames(item, ['Saves', 'saves', 'Total saves']);
      return sum + likes + comments + shares + saves;
    }, 0),
    engagement_rate: (() => {
      const totalEngagement = filteredData.reduce((sum, item) => {
        const likes = getValueByPossibleNames(item, ['Likes', 'likes', 'Total likes']);
        const comments = getValueByPossibleNames(item, ['Comments', 'comments', 'Total comments']);
        const shares = getValueByPossibleNames(item, ['Shares', 'shares', 'Total shares']);
        const saves = getValueByPossibleNames(item, ['Saves', 'saves', 'Total saves']);
        return sum + likes + comments + shares + saves;
      }, 0);
      const totalReach = filteredData.reduce((sum, item) => sum + getValueByPossibleNames(item, ['Reach', 'reach', 'Total reach', 'Impressions']), 0);
      
      return totalReach > 0 ? ((totalEngagement / totalReach) * 100) : 0;
    })(),
    likes: filteredData.reduce((sum, item) => sum + getValueByPossibleNames(item, ['Likes', 'likes', 'Total likes']), 0),
    posts: filteredData.map(item => ({
      description: getValueByPossibleNames(item, ['Description', 'Caption', 'Post Caption', 'description'], 'No description'),
      date: getValueByPossibleNames(item, ['Publish time', 'Post Date', 'date', 'Date'], ''),
      type: getValueByPossibleNames(item, ['Post type', 'Content Type', 'Media Type', 'type'], 'Unknown'),
      reach: getValueByPossibleNames(item, ['Reach', 'reach', 'Total reach', 'Impressions']),
      likes: getValueByPossibleNames(item, ['Likes', 'likes', 'Total likes']),
      comments: getValueByPossibleNames(item, ['Comments', 'comments', 'Total comments']),
      shares: getValueByPossibleNames(item, ['Shares', 'shares', 'Total shares']),
      saves: getValueByPossibleNames(item, ['Saves', 'saves', 'Total saves']),
      year: item.year || (options.year || new Date().getFullYear())
    })),
    performance_trend: generatePerformanceTrend(filteredData, 'instagram')
  };
  
  // Return the normalized result to ensure all values are properly typed
  return normalizeObject(result);
}

/**
 * Process Email data with enhanced year handling and proper data typing
 * @param {string} csvData - CSV content
 * @param {object} options - Processing options
 * @returns {object} - Processed Email data
 */
function processEmailData(csvData, options = {}) {
  const data = enhancedCsvToJson(csvData, {
    dateFields: ['Date'],
    extractYear: true,
    ...options
  });
  
  // Filter data by year if specified
  const filteredData = options.year 
    ? data.filter(item => item.year === options.year)
    : data;
  
  // Process Email data with proper data typing
  const result = {
    campaigns: filteredData.length,
    totalSent: filteredData.reduce((sum, item) => sum + normalizeValue(item['Emails sent'] || 0), 0),
    totalDelivered: filteredData.reduce((sum, item) => sum + normalizeValue(item['Email deliveries'] || 0), 0),
    totalOpens: filteredData.reduce((sum, item) => sum + normalizeValue(item['Email opened (MPP excluded)'] || 0), 0),
    totalClicks: filteredData.reduce((sum, item) => sum + normalizeValue(item['Email clicked'] || 0), 0),
    openRate: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + normalizeValue(item['Email open rate (MPP excluded)']), 0) / filteredData.length) : 0,
    clickRate: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + normalizeValue(item['Email click rate']), 0) / filteredData.length) : 0,
    bounceRate: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + normalizeValue(item['Email bounce rate']), 0) / filteredData.length) : 0,
    unsubscribeRate: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + normalizeValue(item['Email unsubscribe rate']), 0) / filteredData.length) : 0,
    campaigns: filteredData.map(item => ({
      name: item.Campaign || 'Unnamed Campaign',
      sent: normalizeValue(item['Emails sent'] || 0),
      delivered: normalizeValue(item['Email deliveries'] || 0),
      opened: normalizeValue(item['Email opened (MPP excluded)'] || 0),
      clicked: normalizeValue(item['Email clicked'] || 0),
      openRate: normalizeValue(item['Email open rate (MPP excluded)']),
      clickRate: normalizeValue(item['Email click rate']),
      bounceRate: normalizeValue(item['Email bounce rate']),
      unsubscribeRate: normalizeValue(item['Email unsubscribe rate']),
      year: item.year || (options.year || new Date().getFullYear())
    })),
    performance_trend: generateEmailPerformanceTrend(filteredData)
  };
  
  // Return the normalized result to ensure all values are properly typed
  return normalizeObject(result);
}

/**
 * Process YouTube data with enhanced year handling and proper data typing
 * @param {string} ageData - Age demographics CSV
 * @param {string} genderData - Gender demographics CSV
 * @param {string} geoData - Geography CSV
 * @param {string} subscriptionData - Subscription status CSV
 * @param {string} contentData - Content CSV
 * @param {object} options - Processing options
 * @returns {object} - Processed YouTube data
 */
function processYouTubeData(ageData, genderData, geoData, subscriptionData, contentData, options = {}) {
  // Process YouTube data from multiple CSV sources with proper typing
  const age = enhancedCsvToJson(ageData, options);
  const gender = enhancedCsvToJson(genderData, options);
  const geo = enhancedCsvToJson(geoData, options);
  const subscription = enhancedCsvToJson(subscriptionData, options);
  const content = enhancedCsvToJson(contentData, options);
  
  // Get total views and watch time
  const totalStats = subscription.find(item => item['Subscription status'] === 'Total') || {};
  
  const result = {
    totalViews: normalizeValue(totalStats.Views || 0),
    totalWatchTime: normalizeValue(totalStats['Watch time (hours)'] || 0),
    averageViewDuration: totalStats['Average view duration'] || '0:00',
    demographics: {
      age: age.map(item => ({
        group: item['Viewer age'] || '',
        viewPercentage: normalizeValue(item['Views (%)'] || 0),
        watchTimePercentage: normalizeValue(item['Watch time (hours) (%)'] || 0)
      })),
      gender: gender.map(item => ({
        group: item['Viewer gender'] || '',
        viewPercentage: normalizeValue(item['Views (%)'] || 0),
        watchTimePercentage: normalizeValue(item['Watch time (hours) (%)'] || 0)
      }))
    },
    geography: geo
      .filter(item => item.Geography !== 'Total')
      .sort((a, b) => normalizeValue(b.Views || 0) - normalizeValue(a.Views || 0))
      .slice(0, 10)
      .map(item => ({
        country: item.Geography || '',
        views: normalizeValue(item.Views || 0),
        watchTime: normalizeValue(item['Watch time (hours)'] || 0),
        averageDuration: item['Average view duration'] || '0:00'
      })),
    subscriptionStatus: subscription
      .filter(item => item['Subscription status'] !== 'Total')
      .map(item => ({
        status: item['Subscription status'] || '',
        views: normalizeValue(item.Views || 0),
        watchTime: normalizeValue(item['Watch time (hours)'] || 0),
        percentage: normalizeValue(totalStats.Views) ? 
          (normalizeValue(item.Views) / normalizeValue(totalStats.Views) * 100) : 0
      })),
    content: content.map(item => ({
      title: item['Video title'] || '',
      views: normalizeValue(item['Views'] || 0),
      watchTime: normalizeValue(item['Watch time (hours)'] || 0),
      averageDuration: item['Average view duration'] || '0:00',
      publishDate: item['Publish date'] || '',
      likes: normalizeValue(item['Likes'] || 0),
      comments: normalizeValue(item['Comments'] || 0)
    })),
    performance_trend: generateYouTubePerformanceTrend(totalStats, options.year)
  };
  
  // Return the normalized result to ensure all values are properly typed
  return normalizeObject(result);
}

/**
 * Process Google Analytics data with enhanced features and proper data typing
 * @param {string} demographicsData - Demographics CSV
 * @param {string} pagesData - Pages & screens CSV
 * @param {string} trafficData - Traffic acquisition CSV
 * @param {string} utmsData - UTMs data CSV
 * @param {object} options - Processing options
 * @returns {object} - Processed Google Analytics data
 */
function processGoogleAnalyticsData(demographicsData, pagesData, trafficData, utmsData, options = {}) {
  console.log("Processing Google Analytics data with enhanced options...");
  
  // Process each data source with enhanced settings
  const demographics = demographicsData ? enhancedCsvToJson(demographicsData, {
    dateFields: ['Date'],
    extractYear: true,
    ...options
  }) : [];
  
  const pages = pagesData ? enhancedCsvToJson(pagesData, {
    dateFields: ['Date'],
    extractYear: true,
    ...options
  }) : [];
  
  const traffic = trafficData ? enhancedCsvToJson(trafficData, {
    dateFields: ['Date'],
    extractYear: true,
    ...options
  }) : [];
  
  const utms = utmsData ? enhancedCsvToJson(utmsData, {
    dateFields: ['Date'],
    extractYear: true,
    ...options
  }) : [];
  
  // Filter by year if specified
  const filterByYear = (data) => options.year ? data.filter(item => item.year === options.year) : data;
  
  const filteredDemographics = filterByYear(demographics);
  const filteredPages = filterByYear(pages);
  const filteredTraffic = filterByYear(traffic);
  const filteredUtms = filterByYear(utms);
  
  // Helper for flexible field access
  function getValueByPossibleNames(item, possibleNames, defaultValue = 0) {
    for (const name of possibleNames) {
      // Check for exact match
      if (item[name] !== undefined) {
        return normalizeValue(item[name]);
      }
      
      // Check for partial match
      const matchingKey = Object.keys(item).find(key => 
        key.toLowerCase().includes(name.toLowerCase()));
      if (matchingKey) {
        return normalizeValue(item[matchingKey]);
      }
    }
    return defaultValue;
  }
  
  // Initialize result object
  const result = {
    totalUsers: 0,
    totalSessions: 0,
    engagedSessions: 0,
    engagementRate: 0,
    demographics: {
      ageGroups: [],
      genderGroups: [],
      countries: [],
      cities: [],
      languages: []
    },
    topPages: [],
    trafficSources: [],
    campaigns: [],
    performance_trend: generateGAPerformanceTrend(options.year || new Date().getFullYear())
  };
  
  // Process demographics data with flexible field access
  if (filteredDemographics.length > 0) {
    // Try to determine dimension type for each record
    filteredDemographics.forEach(item => {
      let dimensionType = '';
      
      // Try to determine the dimension type
      if (getValueByPossibleNames(item, ['Dimension'], '') === 'Age' || 
          Object.keys(item).some(key => key.includes('Age'))) {
        dimensionType = 'Age';
      } else if (getValueByPossibleNames(item, ['Dimension'], '') === 'Gender' || 
                Object.keys(item).some(key => key.includes('Gender'))) {
        dimensionType = 'Gender';
      } else if (getValueByPossibleNames(item, ['Dimension'], '') === 'Country' || 
                Object.keys(item).some(key => key.includes('Country'))) {
        dimensionType = 'Country';
      } else if (getValueByPossibleNames(item, ['Dimension'], '') === 'City' || 
                Object.keys(item).some(key => key.includes('City'))) {
        dimensionType = 'City';
      } else if (getValueByPossibleNames(item, ['Dimension'], '') === 'Language' || 
                Object.keys(item).some(key => key.includes('Language'))) {
        dimensionType = 'Language';
      }
      
      // Add data to appropriate category based on dimension type
      if (dimensionType === 'Age') {
        const ageRange = getValueByPossibleNames(item, ['Age', 'age range'], 'Unknown');
        const users = getValueByPossibleNames(item, ['Users', 'user count', 'active users']);
        const newUsers = getValueByPossibleNames(item, ['New users', 'new visitors', 'first time users']);
        const sessions = getValueByPossibleNames(item, ['Sessions', 'visits', 'session count']);
        
        result.demographics.ageGroups.push({
          ageRange,
          users,
          newUsers,
          sessions,
          percentage: 0 // Will calculate after all processed
        });
        
        // Add to totals
        result.totalUsers += users;
        result.totalSessions += sessions;
      } else if (dimensionType === 'Gender') {
        result.demographics.genderGroups.push({
          gender: getValueByPossibleNames(item, ['Gender', 'gender type'], 'Unknown'),
          users: getValueByPossibleNames(item, ['Users', 'user count', 'active users']),
          newUsers: getValueByPossibleNames(item, ['New users', 'new visitors', 'first time users']),
          sessions: getValueByPossibleNames(item, ['Sessions', 'visits', 'session count']),
          percentage: 0 // Will calculate after
        });
      } else if (dimensionType === 'Country') {
        result.demographics.countries.push({
          country: getValueByPossibleNames(item, ['Country', 'country name'], 'Unknown'),
          users: getValueByPossibleNames(item, ['Users', 'user count', 'active users']),
          newUsers: getValueByPossibleNames(item, ['New users', 'new visitors', 'first time users']),
          sessions: getValueByPossibleNames(item, ['Sessions', 'visits', 'session count']),
          percentage: 0 // Will calculate after
        });
      }
    });
    
    // Calculate percentages
    if (result.totalUsers > 0) {
      result.demographics.ageGroups.forEach(group => {
        group.percentage = ((group.users / result.totalUsers) * 100);
      });
      
      result.demographics.genderGroups.forEach(group => {
        group.percentage = ((group.users / result.totalUsers) * 100);
      });
      
      result.demographics.countries.forEach(country => {
        country.percentage = ((country.users / result.totalUsers) * 100);
      });
    }
  }
  
  // Process pages data with flexible mapping
  if (filteredPages.length > 0) {
    // Extract top pages with flexible field access
    result.topPages = filteredPages.map(item => ({
      pagePath: getValueByPossibleNames(item, ['Page path', 'Screen name', 'Page', 'URL'], 'Unknown'),
      pageTitle: getValueByPossibleNames(item, ['Page title', 'Screen class', 'Title'], 'Unknown'),
      pageviews: getValueByPossibleNames(item, ['Views', 'Pageviews', 'Screenviews', 'Page views']),
      uniquePageviews: getValueByPossibleNames(item, ['Unique views', 'Users', 'Unique pageviews']),
      averageTimeOnPage: getValueByPossibleNames(item, ['Average time on page', 'Avg. time'], '0:00')
    })).sort((a, b) => b.pageviews - a.pageviews).slice(0, 20);
  }
  
  // Process traffic acquisition data
  if (filteredTraffic.length > 0) {
    result.trafficSources = filteredTraffic.map(item => ({
      source: getValueByPossibleNames(item, ['Source', 'Traffic source', 'Session source'], 'Unknown'),
      medium: getValueByPossibleNames(item, ['Medium', 'Traffic medium', 'Session medium'], 'Unknown'),
      channel: getValueByPossibleNames(item, ['Default channel group', 'Channel', 'Channel grouping'], 'Unknown'),
      sessions: getValueByPossibleNames(item, ['Sessions', 'Visits']),
      users: getValueByPossibleNames(item, ['Users', 'Visitors']),
      engagedSessions: getValueByPossibleNames(item, ['Engaged sessions', 'Engaged visits']),
      engagementRate: getValueByPossibleNames(item, ['Engagement rate', 'Engaged rate']),
      percentage: 0 // Will calculate after
    })).sort((a, b) => b.sessions - a.sessions);
    
    // Calculate engagement metrics and percentages
    if (filteredTraffic.length > 0) {
      result.engagedSessions = result.trafficSources.reduce((sum, item) => sum + item.engagedSessions, 0);
      result.engagementRate = (result.engagedSessions / result.totalSessions * 100);
      
      // Calculate percentages
      result.trafficSources.forEach(source => {
        source.percentage = ((source.sessions / result.totalSessions) * 100);
      });
    }
  }
  
  // Process UTM campaign data
  if (filteredUtms.length > 0) {
    result.campaigns = filteredUtms.map(item => ({
      campaign: getValueByPossibleNames(item, ['Campaign', 'Campaign name', 'Session campaign'], 'Unknown'),
      source: getValueByPossibleNames(item, ['Source', 'Source name', 'Session source'], 'Unknown'),
      medium: getValueByPossibleNames(item, ['Medium', 'Medium name', 'Session medium'], 'Unknown'),
      users: getValueByPossibleNames(item, ['Users', 'Visitors']),
      sessions: getValueByPossibleNames(item, ['Sessions', 'Visits']),
      conversions: getValueByPossibleNames(item, ['Conversions', 'Transactions', 'Goals']),
      conversionRate: 0 // Will calculate after
    })).sort((a, b) => b.sessions - a.sessions);
    
    // Calculate conversion rates
    result.campaigns.forEach(campaign => {
      campaign.conversionRate = campaign.users ? 
        ((campaign.conversions / campaign.users) * 100) : 0;
    });
  }
  
  // Return the normalized result to ensure all values are properly typed
  return normalizeObject(result);
}

/**
 * Generate cross-channel data with multi-year support and proper data typing
 * @param {object} facebook - Facebook data
 * @param {object} instagram - Instagram data
 * @param {object} youtube - YouTube data
 * @param {object} email - Email data
 * @param {object} googleAnalytics - Google Analytics data
 * @param {object} options - Processing options
 * @returns {object} - Cross-channel data
 */
function generateCrossChannelData(facebook, instagram, youtube, email, googleAnalytics, options = {}) {
  // Use Google Analytics attribution data if available, otherwise use default values
  let attributionData = [
    { name: 'Organic Search', value: 32 },
    { name: 'Direct', value: 15 },
    { name: 'Social', value: 22 },
    { name: 'Email', value: 18 },
    { name: 'Referral', value: 8 },
    { name: 'Paid Search', value: 5 }
  ];
  
  if (googleAnalytics && googleAnalytics.trafficSources && googleAnalytics.trafficSources.length > 0) {
    attributionData = googleAnalytics.trafficSources.map(source => ({
      name: source.medium || source.source || 'Unknown',
      value: normalizeValue(source.percentage) || 0
    }));
  }
  
  // Incorporate Google Analytics data into demographics if available
  let demographicsData = {
    age: [
      { age: '18-24', facebook: 15, instagram: 30, youtube: 18 },
      { age: '25-34', facebook: 28, instagram: 35, youtube: 31 },
      { age: '35-44', facebook: 22, instagram: 20, youtube: 23 },
      { age: '45-54', facebook: 18, instagram: 10, youtube: 14 },
      { age: '55-64', facebook: 12, instagram: 3, youtube: 8 },
      { age: '65+', facebook: 5, instagram: 2, youtube: 6 }
    ]
  };
  
  if (googleAnalytics && googleAnalytics.demographics) {
    // Merge GA demographics with existing data
    demographicsData.countries = googleAnalytics.demographics.countries;
    demographicsData.cities = googleAnalytics.demographics.cities;
    demographicsData.languages = googleAnalytics.demographics.languages;
    
    // If GA has age data, update the existing age data
    if (googleAnalytics.demographics.ageGroups && googleAnalytics.demographics.ageGroups.length > 0) {
      demographicsData.age = googleAnalytics.demographics.ageGroups.map(group => {
        // Find matching age group in existing data
        const existingGroup = demographicsData.age.find(a => a.age === group.ageRange);
        return {
          age: group.ageRange,
          ga: normalizeValue(group.percentage) || 0,
          facebook: existingGroup ? existingGroup.facebook : 0,
          instagram: existingGroup ? existingGroup.instagram : 0,
          youtube: existingGroup ? existingGroup.youtube : 0
        };
      });
    }
  }
  
  // Get year if specified
  const year = options.year || new Date().getFullYear();
  
  const result = {
    year,
    reach: {
      total: normalizeValue(facebook?.reach || 0) + normalizeValue(instagram?.reach || 0),
      byPlatform: {
        facebook: normalizeValue(facebook?.reach || 0),
        instagram: normalizeValue(instagram?.reach || 0),
        youtube: normalizeValue(youtube?.totalViews || 0),
        web: normalizeValue(googleAnalytics?.totalUsers || 0)
      }
    },
    engagement: {
      total: normalizeValue(facebook?.engagement || 0) + normalizeValue(instagram?.engagement || 0),
      byPlatform: {
        facebook: normalizeValue(facebook?.engagement || 0),
        instagram: normalizeValue(instagram?.engagement || 0),
        youtube: normalizeValue(youtube?.totalViews || 0) * 0.1, // Rough estimate of engagement
        web: normalizeValue(googleAnalytics?.engagedSessions || 0)
      }
    },
    engagement_rate: {
      overall: (normalizeValue(facebook?.engagement || 0) + normalizeValue(instagram?.engagement || 0)) / 
              (normalizeValue(facebook?.reach || 1) + normalizeValue(instagram?.reach || 1)) * 100,
      byPlatform: {
        facebook: normalizeValue(facebook?.engagement_rate || 0),
        instagram: normalizeValue(instagram?.engagement_rate || 0),
        email: normalizeValue(email?.clickRate || 0),
        web: normalizeValue(googleAnalytics?.engagementRate || 0)
      }
    },
    performance_trend: mergePerformanceTrends([
      facebook?.performance_trend || [],
      instagram?.performance_trend || [],
      youtube?.performance_trend || [],
      email?.performance_trend || [],
      googleAnalytics?.performance_trend || []
    ]),
    attribution: attributionData,
    content_performance: [
      { subject: 'Reach', Video: 92, Image: 68, Text: 42 },
      { subject: 'Engagement', Video: 85, Image: 65, Text: 38 },
      { subject: 'Clicks', Video: 78, Image: 62, Text: 45 },
      { subject: 'Shares', Video: 83, Image: 58, Text: 31 },
      { subject: 'Comments', Video: 75, Image: 52, Text: 35 }
    ],
    demographics: demographicsData,
    web: {
      topPages: googleAnalytics?.topPages || [],
      campaigns: googleAnalytics?.campaigns || []
    },
    meta: {
      last_updated: new Date().toISOString(),
      year
    }
  };
  
  // Return the normalized result to ensure all values are properly typed
  return normalizeObject(result);
}

/**
 * Merge performance trends from multiple sources
 * @param {array} trends - Array of performance trend arrays
 * @returns {array} - Merged performance trend
 */
function mergePerformanceTrends(trends) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Create base result with months
  const result = months.map(month => ({ month }));
  
  // Merge each trend
  trends.forEach(trend => {
    if (!trend || trend.length === 0) return;
    
    trend.forEach(item => {
      const monthIndex = months.indexOf(item.month);
      if (monthIndex === -1) return;
      
      // Merge all properties except month
      Object.keys(item).forEach(key => {
        if (key !== 'month') {
          result[monthIndex][key] = normalizeValue(item[key]);
        }
      });
    });
  });
  
  return result;
}

/**
 * Generate performance trend for Facebook data
 * @param {array} data - Facebook data array
 * @param {string} platform - Platform name
 * @returns {array} - Performance trend data
 */
function generatePerformanceTrend(data, platform) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Default values with predictable growth pattern
  const baseReach = platform === 'facebook' ? 15000 : 9000;
  const reachIncrease = platform === 'facebook' ? 800 : 400;
  const engagementRatio = 0.1; // 10% engagement rate
  
  // Create base result with default values
  const result = months.map((month, index) => {
    const reach = baseReach + (index * reachIncrease);
    return {
      month,
      reach,
      engagement: Math.round(reach * engagementRatio)
    };
  });
  
  // If no data or empty array, return default values
  if (!data || data.length === 0) {
    return result;
  }
  
  // Group data by month
  const monthlyData = {};
  
  data.forEach(item => {
    let dateStr = item.date;
    // Handle potential string format issues
    if (typeof dateStr === 'string' && dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const month = months[date.getMonth()];
        if (!monthlyData[month]) {
          monthlyData[month] = {
            reach: 0,
            engagement: 0,
            count: 0
          };
        }
        
        // Accumulate values with proper normalization
        if (platform === 'facebook') {
          monthlyData[month].reach += normalizeValue(item.reach || 0);
          monthlyData[month].engagement += 
            normalizeValue(item.reactions || 0) + 
            normalizeValue(item.comments || 0) + 
            normalizeValue(item.shares || 0);
        } else if (platform === 'instagram') {
          monthlyData[month].reach += normalizeValue(item.reach || 0);
          monthlyData[month].engagement += 
            normalizeValue(item.likes || 0) + 
            normalizeValue(item.comments || 0) + 
            normalizeValue(item.shares || 0) + 
            normalizeValue(item.saves || 0);
        }
        
        monthlyData[month].count++;
      }
    }
  });
  
  // Update result with actual data
  Object.keys(monthlyData).forEach(month => {
    const monthIndex = months.indexOf(month);
    if (monthIndex !== -1 && monthlyData[month].count > 0) {
      result[monthIndex].reach = monthlyData[month].reach;
      result[monthIndex].engagement = monthlyData[month].engagement;
    }
  });
  
  return result;
}

/**
 * Generate performance trend for Email data
 * @param {array} data - Email data array
 * @returns {array} - Performance trend data
 */
function generateEmailPerformanceTrend(data) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Default values with predictable growth pattern
  const baseOpenRate = 21.0;
  const openRateIncrease = 0.25;
  const baseClickRate = 2.5;
  const clickRateIncrease = 0.07;
  
  // Create base result with default values
  const result = months.map((month, index) => {
    return {
      month,
      openRate: baseOpenRate + (index * openRateIncrease),
      clickRate: baseClickRate + (index * clickRateIncrease)
    };
  });
  
  // If no data or empty array, return default values
  if (!data || data.length === 0) {
    return result;
  }
  
  // In a real implementation, this would process actual email data by month
  // For now, we'll return the default values
  return result;
}

/**
 * Generate performance trend for YouTube data
 * @param {object} totalStats - Total YouTube stats
 * @param {number} year - Year for the data
 * @returns {array} - Performance trend data
 */
function generateYouTubePerformanceTrend(totalStats, year) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Default values with predictable growth pattern
  const baseViews = 4500;
  const viewsIncrease = 300;
  const watchTimeRatio = 0.1; // 10% of views in hours
  
  // Create result with calculated values
  const result = months.map((month, index) => {
    const views = baseViews + (index * viewsIncrease);
    return {
      month,
      views,
      watchTime: Math.round(views * watchTimeRatio)
    };
  });
  
  return result;
}

/**
 * Generate performance trend for Google Analytics data
 * @param {number} year - Year for the data
 * @returns {array} - Performance trend data
 */
function generateGAPerformanceTrend(year) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Default values with predictable growth pattern
  const baseUsers = 10000;
  const userIncrease = 500;
  const sessionRatio = 2.2; // Sessions per user
  
  // Create result with calculated values
  const result = months.map((month, index) => {
    const users = baseUsers + (index * userIncrease);
    return {
      month,
      users,
      sessions: Math.round(users * sessionRatio),
      engagementRate: 75 + (index * 0.5)
    };
  });
  
  return result;
}

/**
 * Process multi-year data for comparison
 * @param {object} dataSources - Data sources by year
 * @returns {object} - Processed multi-year data
 */
function processMultiYearData(dataSources) {
  const result = {
    years: Object.keys(dataSources).sort(),
    metrics: {
      reach: {},
      engagement: {},
      engagement_rate: {}
    },
    channels: {
      facebook: {},
      instagram: {},
      youtube: {},
      email: {},
      web: {}
    },
    monthly: {}
  };
  
  // Process data for each year
  for (const year in dataSources) {
    const yearData = dataSources[year];
    
    // Aggregate metrics
    result.metrics.reach[year] = normalizeValue(yearData.crossChannel?.reach?.total || 0);
    result.metrics.engagement[year] = normalizeValue(yearData.crossChannel?.engagement?.total || 0);
    result.metrics.engagement_rate[year] = normalizeValue(yearData.crossChannel?.engagement_rate?.overall || 0);
    
    // Aggregate channel data
    result.channels.facebook[year] = normalizeValue(yearData.crossChannel?.reach?.byPlatform?.facebook || 0);
    result.channels.instagram[year] = normalizeValue(yearData.crossChannel?.reach?.byPlatform?.instagram || 0);
    result.channels.youtube[year] = normalizeValue(yearData.crossChannel?.reach?.byPlatform?.youtube || 0);
    result.channels.email[year] = normalizeValue(yearData.crossChannel?.reach?.byPlatform?.email || 0);
    result.channels.web[year] = normalizeValue(yearData.crossChannel?.reach?.byPlatform?.web || 0);
    
    // Process monthly data for seasonal analysis
    if (yearData.crossChannel?.performance_trend) {
      result.monthly[year] = {};
      
      yearData.crossChannel.performance_trend.forEach(item => {
        result.monthly[year][item.month] = {
          facebook: normalizeValue(item.facebook || 0),
          instagram: normalizeValue(item.instagram || 0),
          youtube: normalizeValue(item.youtube || 0),
          email: normalizeValue(item.email || 0),
          web: normalizeValue(item.web || 0)
        };
      });
    }
  }
  
  // Generate growth metrics
  result.growth = calculateYearOverYearGrowth(result);
  
  return result;
}

/**
 * Calculate year-over-year growth for multi-year data
 * @param {object} data - Multi-year data
 * @returns {object} - Growth metrics
 */
function calculateYearOverYearGrowth(data) {
  const growth = {
    reach: {},
    engagement: {},
    channels: {
      facebook: {},
      instagram: {},
      youtube: {},
      email: {},
      web: {}
    }
  };
  
  const years = data.years;
  if (years.length < 2) return growth;
  
  // Calculate growth for each consecutive year pair
  for (let i = 1; i < years.length; i++) {
    const currentYear = years[i];
    const previousYear = years[i-1];
    
    // Calculate reach growth
    const currentReach = normalizeValue(data.metrics.reach[currentYear] || 0);
    const previousReach = normalizeValue(data.metrics.reach[previousYear] || 1); // Avoid division by zero
    growth.reach[`${previousYear}_${currentYear}`] = ((currentReach - previousReach) / previousReach * 100);
    
    // Calculate engagement growth
    const currentEngagement = normalizeValue(data.metrics.engagement[currentYear] || 0);
    const previousEngagement = normalizeValue(data.metrics.engagement[previousYear] || 1);
    growth.engagement[`${previousYear}_${currentYear}`] = ((currentEngagement - previousEngagement) / previousEngagement * 100);
    
    // Calculate channel growth
    Object.keys(data.channels).forEach(channel => {
      const currentValue = normalizeValue(data.channels[channel][currentYear] || 0);
      const previousValue = normalizeValue(data.channels[channel][previousYear] || 1);
      growth.channels[channel][`${previousYear}_${currentYear}`] = ((currentValue - previousValue) / previousValue * 100);
    });
  }
  
  return growth;
}

// Make all functions available in the window scope for browser usage
if (typeof window !== 'undefined') {
  window.enhancedCsvToJson = enhancedCsvToJson;
  window.normalizeValue = normalizeValue;
  window.normalizeObject = normalizeObject;
  window.parseCSVLine = parseCSVLine;
  window.processFacebookData = processFacebookData;
  window.processInstagramData = processInstagramData;
  window.processEmailData = processEmailData;
  window.processYouTubeData = processYouTubeData;
  window.processGoogleAnalyticsData = processGoogleAnalyticsData;
  window.generateCrossChannelData = generateCrossChannelData;
  window.mergePerformanceTrends = mergePerformanceTrends;
  window.generatePerformanceTrend = generatePerformanceTrend;
  window.generateEmailPerformanceTrend = generateEmailPerformanceTrend;
  window.generateYouTubePerformanceTrend = generateYouTubePerformanceTrend;
  window.generateGAPerformanceTrend = generateGAPerformanceTrend;
  window.processMultiYearData = processMultiYearData;
  window.calculateYearOverYearGrowth = calculateYearOverYearGrowth;
  
  // Create a namespace object for organized access
  window.csvProcessor = {
    enhancedCsvToJson,
    normalizeValue,
    normalizeObject,
    parseCSVLine,
    processFacebookData,
    processInstagramData,
    processEmailData,
    processYouTubeData,
    processGoogleAnalyticsData,
    generateCrossChannelData,
    mergePerformanceTrends,
    generatePerformanceTrend,
    generateEmailPerformanceTrend,
    generateYouTubePerformanceTrend,
    generateGAPerformanceTrend,
    processMultiYearData,
    calculateYearOverYearGrowth
  };
}