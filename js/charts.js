/**
 * Chart Creation Utilities
 */

// Create a bar chart
function createBarChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'bar',
        data: data,
        options: chartOptions
    });
}

// Create a line chart
function createLineChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'line',
        data: data,
        options: chartOptions
    });
}

// Create a pie chart
function createPieChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'pie',
        data: data,
        options: chartOptions
    });
}

// Create a doughnut chart
function createDoughnutChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '50%'
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: chartOptions
    });
}

// Create a radar chart
function createRadarChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            line: {
                borderWidth: 3
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            r: {
                angleLines: {
                    display: true
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'radar',
        data: data,
        options: chartOptions
    });
}

// Create a stacked bar chart
function createStackedBarChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options for stacked bars
    const defaultOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true
            }
        }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'bar',
        data: data,
        options: chartOptions
    });
}

// Create a horizontal bar chart
function createHorizontalBarChart(canvasId, data, options = {}) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Default options
    const defaultOptions = {
        indexAxis: 'y', // This makes the bars horizontal
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            }
        }
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    return new Chart(ctx, {
        type: 'bar',
        data: data,
        options: chartOptions
    });
}

// Format number with thousands separator
function formatNumber(num, decimals = 0) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString(undefined, { 
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Format percentage
function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return '0%';
    return `${parseFloat(value).toFixed(decimals)}%`;
}

// Abbreviate large numbers
function abbreviateNumber(num) {
    if (num === null || num === undefined) return '0';
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}
