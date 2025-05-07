/**
 * Marketing Dashboard Configuration
 */
const DASHBOARD_CONFIG = {
    // Company name to display
    companyName: "Your Company",
    
    // Data path - change this if needed for your GitHub Pages setup
    dataPath: "./data",
    
    // Dashboard title
    dashboardTitle: "Marketing Analytics Dashboard",
    
    // Timeframe options
    timeframeOptions: [
        { id: "7d", name: "Last 7 Days" },
        { id: "30d", name: "Last 30 Days" },
        { id: "90d", name: "Last 90 Days" },
        { id: "1y", name: "Last Year" },
        { id: "all", name: "All Time" }
    ],
    
    // Default timeframe
    defaultTimeframe: "30d",
    
    // Chart colors
    colors: {
        facebook: "#4267B2",
        instagram: "#C13584",
        youtube: "#FF0000",
        email: "#5851DB",
        web: "#34A853",
        positive: "#4CAF50",
        negative: "#F44336",
        neutral: "#9E9E9E"
    },
    
    // Platform display names
    platformNames: {
        facebook: "Facebook",
        instagram: "Instagram",
        youtube: "YouTube",
        email: "Email",
        web: "Website"
    },
    
    // Benchmark values for comparisons
    benchmarks: {
        facebook: {
            engagement_rate: 0.9,
            reach_growth: 5.0
        },
        instagram: {
            engagement_rate: 1.2,
            reach_growth: 7.0
        },
        youtube: {
            view_duration: 4.2, // minutes
            engagement_rate: 5.0
        },
        email: {
            open_rate: 21.33,
            click_rate: 2.62,
            bounce_rate: 0.63,
            unsubscribe_rate: 0.17
        },
        web: {
            bounce_rate: 55.0,
            conversion_rate: 2.35
        }
    }
};
