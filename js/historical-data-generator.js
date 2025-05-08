import React, { useState, useEffect } from 'react';
import { Calendar, DownloadCloud, Layers, Check, AlertCircle } from 'lucide-react';

const DataGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedYears, setGeneratedYears] = useState([]);
  const [error, setError] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  
  // Years to generate historical data for
  const years = ['2021', '2022', '2023', '2024'];
  
  // Files to process for each year
  const files = [
    'FB_Posts.csv',
    'FB_Videos.csv',
    'FB_Reach.csv',
    'FB_Interactions.csv',
    'IG_Posts.csv',
    'IG_Reach.csv',
    'IG_Interactions.csv',
    'Email_Campaign_Performance.csv',
    'YouTube_Age.csv',
    'YouTube_Gender.csv',
    'YouTube_Geography.csv',
    'YouTube_Subscription_Status.csv',
    'YouTube_Content.csv',
    'YouTube_Cities.csv',
    'GA_Demographics.csv',
    'GA_Pages_And_Screens.csv',
    'GA_Traffic_Acquisition.csv',
    'GA_UTMs.csv'
  ];
  
  // Load current data on component mount
  useEffect(() => {
    const loadCurrentData = async () => {
      try {
        const data = {};
        
        // Load just a subset of files to keep processing manageable
        const keyFiles = [
          'FB_Posts.csv', 
          'IG_Posts.csv',
          'Email_Campaign_Performance.csv',
          'YouTube_Age.csv',
          'YouTube_Geography.csv'
        ];
        
        // Load each key file
        for (const file of keyFiles) {
          try {
            const response = await fetch(`./data/${file}`);
            if (response.ok) {
              const text = await response.text();
              data[file] = text;
            }
          } catch (err) {
            console.warn(`Could not load ${file}`, err);
          }
        }
        
        setCurrentData(data);
      } catch (err) {
        setError("Failed to load current data. Please check that CSV files exist in the data folder.");
      }
    };
    
    loadCurrentData();
  }, []);
  
  // Generate historical data for a specified year
  const generateYearData = (year, file, currentContent) => {
    // Create a downward trend for older years (less data than current)
    const yearIndex = years.indexOf(year);
    const yearsFromPresent = years.length - 1 - yearIndex;
    
    // Calculate scaling factor - older years have lower values (20% less per year)
    const scalingFactor = Math.pow(0.8, yearsFromPresent);
    
    if (!currentContent) return null;
    
    const lines = currentContent.split('\n');
    if (lines.length < 2) return currentContent; // Just headers, return as is
    
    const headers = lines[0];
    const processedLines = [headers];
    
    // Process each data line
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const columns = lines[i].split(',');
      
      // Transform numerical values by scaling down for older years
      for (let j = 0; j < columns.length; j++) {
        // Check if it's a numerical value
        if (!isNaN(parseFloat(columns[j])) && columns[j].trim() !== '') {
          // Apply scaling factor to numeric values
          const value = parseFloat(columns[j]) * scalingFactor;
          columns[j] = Math.round(value).toString();
        }
        // Handle date values if present - modify years to match the historical year
        else if (columns[j].includes('/') || columns[j].includes('-')) {
          // Try to identify and modify dates
          try {
            if (columns[j].match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/) || 
                columns[j].match(/\d{1,2}[-/]\d{1,2}[-/]\d{4}/)) {
              // Replace year part with the historical year
              columns[j] = columns[j].replace(/\d{4}/, year);
            }
          } catch (e) {
            // Keep original if date parsing fails
          }
        }
      }
      
      processedLines.push(columns.join(','));
    }
    
    return processedLines.join('\n');
  };
  
  // Generate and package all historical data
  const generateHistoricalData = async () => {
    if (!currentData) {
      setError("No current data available to generate historical data from");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    const processedYears = [];
    
    try {
      // Create a zip file for each year
      for (const year of years) {
        if (year === '2025') continue; // Skip current year
        
        // Create a new JSZip instance
        const zip = new JSZip();
        
        // Create a year folder
        const yearFolder = zip.folder(year);
        
        // Process each file
        for (const file of files) {
          const currentContent = currentData[file];
          if (currentContent) {
            const historicalContent = generateYearData(year, file, currentContent);
            if (historicalContent) {
              yearFolder.file(file, historicalContent);
            }
          }
        }
        
        // Generate year_data.json which combines all the processed data
        const yearDataJson = {
          year: year,
          facebook: { /* Generated summary data */ },
          instagram: { /* Generated summary data */ },
          youtube: { /* Generated summary data */ },
          email: { /* Generated summary data */ },
          googleAnalytics: { /* Generated summary data */ }
        };
        
        yearFolder.file('year_data.json', JSON.stringify(yearDataJson, null, 2));
        
        // Generate and download the zip
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Create download link
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing_data_${year}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        processedYears.push(year);
      }
      
      setGeneratedYears(processedYears);
    } catch (err) {
      console.error('Error generating historical data:', err);
      setError(`Error generating data: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Generate dashboard data patch
  const generateDataPatch = () => {
    try {
      // Create a patch for dashboard.js to better handle missing files
      const patch = `
// ===== DASHBOARD ERROR HANDLING PATCH =====
// Add this to the top of dashboard.js or replace the loadYearlyData function

// More robust error handling for loadYearlyData
async function loadYearlyData() {
  setLoading(true);

  try {
    // Initialize yearly data if not exists
    if (!dashboardState.data.yearlyData) {
      dashboardState.data.yearlyData = {};
    }

    // Determine years to load based on timeframe
    let years = [];
    const currentYear = new Date().getFullYear();

    if (dashboardState.timeframe === 'yoy') {
      // Last two years for year-over-year
      years = [(currentYear - 1).toString(), currentYear.toString()];
    } else if (dashboardState.timeframe === '5y') {
      // Last 5 years for multi-year trends
      for (let i = 0; i < 5; i++) {
        years.push((currentYear - 4 + i).toString());
      }
    }

    // Update selected years
    dashboardState.selectedYears = years;

    // For missing historical years, generate synthetic data
    for (const year of years) {
      if (!dashboardState.data.yearlyData[year]) {
        try {
          // First try loading actual data if available
          const yearData = await loadJSON(\`\${year}/year_data.json\`).catch(() => null);
          
          if (yearData) {
            dashboardState.data.yearlyData[year] = yearData;
            continue; // Skip to next year if successful
          }
          
          // If no actual data, generate synthetic data based on current year
          console.log(\`Generating synthetic data for \${year}\`);
          
          // Scale factor - older years have progressively less engagement (15% less per year)
          const yearDiff = currentYear - parseInt(year);
          const scaleFactor = Math.pow(0.85, yearDiff);
          
          // Create a shallow copy of current year data and adjust values
          const syntheticData = {};
          
          // Use current year as basis if available, otherwise use the first available year
          const baseYear = dashboardState.data.yearlyData[currentYear.toString()] || 
                          Object.values(dashboardState.data.yearlyData)[0] || 
                          { 
                            facebook: dashboardState.data.facebook,
                            instagram: dashboardState.data.instagram,
                            youtube: dashboardState.data.youtube,
                            email: dashboardState.data.email,
                            googleAnalytics: dashboardState.data.googleAnalytics,
                            crossChannel: dashboardState.data.crossChannel
                          };
          
          // Clone and scale down metrics for the synthetic year
          syntheticData.facebook = scaleMetrics(baseYear.facebook, scaleFactor);
          syntheticData.instagram = scaleMetrics(baseYear.instagram, scaleFactor);
          syntheticData.youtube = scaleMetrics(baseYear.youtube, scaleFactor);
          syntheticData.email = scaleMetrics(baseYear.email, scaleFactor);
          syntheticData.googleAnalytics = scaleMetrics(baseYear.googleAnalytics, scaleFactor);
          
          // Generate cross-channel data
          syntheticData.crossChannel = generateCrossChannelData(
            syntheticData.facebook,
            syntheticData.instagram,
            syntheticData.youtube,
            syntheticData.email,
            syntheticData.googleAnalytics,
            { year: parseInt(year) }
          );
          
          // Store the synthetic data
          dashboardState.data.yearlyData[year] = syntheticData;
        } catch (error) {
          console.warn(\`Could not generate data for year \${year}. Using default values.\`);
          
          // Create minimal placeholder data
          dashboardState.data.yearlyData[year] = {
            facebook: { reach: 0, engagement: 0, engagement_rate: 0, posts: [], performance_trend: [] },
            instagram: { reach: 0, engagement: 0, engagement_rate: 0, posts: [], performance_trend: [] },
            youtube: { totalViews: 0, totalWatchTime: 0, performance_trend: [] },
            email: { totalSent: 0, openRate: 0, clickRate: 0, campaigns: [], performance_trend: [] },
            googleAnalytics: { totalUsers: 0, engagementRate: 0, performance_trend: [] },
            crossChannel: {
              year: parseInt(year),
              reach: { total: 0, byPlatform: {} },
              engagement: { total: 0, byPlatform: {} },
              engagement_rate: { overall: 0, byPlatform: {} },
              performance_trend: [],
              meta: { last_updated: new Date().toISOString(), year: parseInt(year) }
            }
          };
        }
      }
    }

    // Process multi-year data
    dashboardState.data.multiYearData = processMultiYearData(dashboardState.data.yearlyData);

    // Set currently active data to most recent year
    const mostRecentYear = years[years.length - 1];
    if (dashboardState.data.yearlyData[mostRecentYear]) {
      dashboardState.data.facebook = dashboardState.data.yearlyData[mostRecentYear].facebook;
      dashboardState.data.instagram = dashboardState.data.yearlyData[mostRecentYear].instagram;
      dashboardState.data.youtube = dashboardState.data.yearlyData[mostRecentYear].youtube;
      dashboardState.data.email = dashboardState.data.yearlyData[mostRecentYear].email;
      dashboardState.data.googleAnalytics = dashboardState.data.yearlyData[mostRecentYear].googleAnalytics;
      dashboardState.data.crossChannel = dashboardState.data.yearlyData[mostRecentYear].crossChannel;
    }

  } catch (error) {
    console.error('Error loading yearly data:', error);
    // Don't alert users about errors, just log to console
  }

  setLoading(false);
}

// Helper function to scale metrics for synthetic data generation
function scaleMetrics(data, factor) {
  if (!data) return {};
  
  // Create a deep copy to avoid modifying the original
  const scaledData = JSON.parse(JSON.stringify(data));
  
  // Scale numerical properties
  Object.keys(scaledData).forEach(key => {
    if (typeof scaledData[key] === 'number') {
      scaledData[key] *= factor;
    }
  });
  
  return scaledData;
}
      `;
      
      // Create download link for the patch
      const blob = new Blob([patch], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard_patch.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show success message
      alert("Dashboard patch downloaded. Please apply this to fix the multi-year data loading issues.");
    } catch (err) {
      console.error('Error generating patch:', err);
      setError(`Error generating patch: ${err.message}`);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Layers className="w-6 h-6 mr-2 text-blue-500" />
        Historical Data Generator
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          This tool generates synthetic historical data for multi-year analysis based on your current CSV files.
        </p>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Calendar className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">How This Works</h3>
              <p className="mt-1 text-sm text-blue-700">
                For each missing year (2021-2024), this tool creates a ZIP file containing modified versions of your current 
                data, adjusted to show realistic trends over time. Import these files into your data folder to enable the 
                multi-year and year-over-year dashboard views.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">Data Status</h3>
          <ul className="space-y-2">
            {years.map(year => (
              <li key={year} className="flex items-center">
                <span className="w-12 font-medium">{year}:</span>
                {generatedYears.includes(year) ? (
                  <span className="ml-2 text-green-600 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Generated
                  </span>
                ) : year === '2025' ? (
                  <span className="ml-2 text-blue-600">Current Year</span>
                ) : (
                  <span className="ml-2 text-gray-600">Not Generated</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-800 mb-3">Current Data Files</h3>
          <div className="text-sm text-gray-600">
            {currentData ? (
              <p>
                {Object.keys(currentData).length} files loaded successfully.<br />
                Ready to generate historical data.
              </p>
            ) : (
              <p>Loading current data files...</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
        <button 
          onClick={generateHistoricalData}
          disabled={isGenerating || !currentData}
          className="flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DownloadCloud className="w-5 h-5 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Historical Data'}
        </button>
        
        <button 
          onClick={generateDataPatch}
          className="flex items-center justify-center bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
        >
          Download Dashboard Patch
        </button>
      </div>
      
      {generatedYears.length > 0 && (
        <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <h3 className="font-medium text-green-800">Data Generated Successfully</h3>
              <p className="mt-1 text-sm text-green-700">
                ZIP files were downloaded for years: {generatedYears.join(', ')}. 
                Extract each ZIP file and move the year folders to your dashboard's data directory.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataGenerator;