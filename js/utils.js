/**
 * Utility Functions for Marketing Dashboard
 * Common helper functions used across dashboard components
 */

// Format number with thousands separator
function formatNumber(value) {
  if (value === undefined || value === null) return '0';
  
  if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + 'M';
  } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
  }
  
  return value.toLocaleString();
}

// Format percentage
function formatPercentage(value) {
  if (value === undefined || value === null) return '0%';
  return `${parseFloat(value).toFixed(1)}%`;
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Generate list of darker colors
function generateColorPalette(numColors) {
  const colors = [];
  const hueStep = 360 / numColors;
  
  for (let i = 0; i < numColors; i++) {
      const hue = i * hueStep;
      colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  
  return colors;
}

// Convert date string to formatted date
function formatDate(dateString, format = 'short') {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  if (format === 'short') {
      return date.toLocaleDateString();
  } else if (format === 'long') {
      return date.toLocaleDateString(undefined, { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
      });
  } else if (format === 'month') {
      return date.toLocaleDateString(undefined, { month: 'short' });
  }
  
  return date.toLocaleDateString();
}

// Calculate percentage change between two values
function calculatePercentageChange(newValue, oldValue) {
  if (oldValue === 0 || !oldValue) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

// Format time duration (from seconds)
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Extract year from date
function getYearFromDate(dateString) {
  if (!dateString) return new Date().getFullYear();
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return new Date().getFullYear();
  
  return date.getFullYear();
}

// Group array by key
function groupBy(array, key) {
  return array.reduce((result, item) => {
      const groupKey = item[key];
      if (!result[groupKey]) {
          result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
  }, {});
}

// Calculate average for array of values
function calculateAverage(array) {
  if (!array || array.length === 0) return 0;
  const sum = array.reduce((a, b) => a + b, 0);
  return sum / array.length;
}

// Calculate median for array of values
function calculateMedian(array) {
  if (!array || array.length === 0) return 0;
  
  const sorted = [...array].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  
  return sorted[mid];
}

// Convert HH:MM:SS to minutes
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

// Scale a value from one range to another
function scaleValue(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Get color based on value (red to green gradient)
function getColorByValue(value, min, max, reverse = false) {
  // Scale value between 0 and 1
  let scaled = scaleValue(value, min, max, 0, 1);
  
  // Optionally reverse (higher values = red, lower values = green)
  if (reverse) {
      scaled = 1 - scaled;
  }
  
  // Convert to HSL
  // 0 = red (0), 0.5 = yellow (60), 1 = green (120)
  const hue = scaled * 120;
  
  return `hsl(${hue}, 70%, 50%)`;
}