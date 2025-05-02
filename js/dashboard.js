/**
 * Marketing Dashboard Configuration
 * 
 * This file contains customizable settings for the marketing dashboard.
 * Edit these values to match your organization's needs.
 */

var DASHBOARD_CONFIG = {
    // General Settings
    general: {
        // Dashboard title displayed in the header
        dashboardTitle: "Marketing Performance Dashboard",

        // Default date range in days (how many days of data to show by default)
        defaultDateRange: 30,

        // Whether to allow date range selection (if false, will use fixed date range)
        allowDateSelection: true,

        // Enable tutorial mode for first-time users (shows tooltips)
        tutorialMode: true,

        // Refresh data automatically (in milliseconds, 0 to disable)
        autoRefresh: 0
    },

    // Visual Customization
    appearance: {
        // Color theme - options: 'light', 'dark', 'custom'
        theme: 'light',

        // Custom theme colors (used if theme is 'custom')
        customColors: {
            background: '#ffffff',
            cardBackground: '#f8f9fa',
            headerBackground: '#2c3e50',
            headerText: '#ffffff',
            text: '#333333',
            lightText: '#6c757d'
        },

        // Chart colors for each platform
        chartColors: {
            facebook: '#4267B2',
            instagram: '#C13584',
            youtube: '#FF0000',
            website: '#34A853',
            email: '#5851DB'
        },

        // Font family for the dashboard
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

        // Show platform icons next to labels
        showIcons: true
    },

    // Data Sources and Paths
    data: {
        // Path to data files (relative to index.html)
        dataPath: './data',  // Changed from '/data' to a relative path

        // File format (json or csv)
        fileFormat: 'json',

        // Definition of data mapping for each platform
        platforms: {
            web: {
                enabled: true,
                dataFiles: ['ga_demographics.json', 'ga_pages.json', 'ga_traffic.json'],
                label: 'Web Analytics'
            },
            facebook: {
                enabled: true,
                dataFiles: ['fb_audience.json', 'fb_posts.json', 'fb_videos.json', 'fb_interactions.json', 'fb_reach.json'],
                label: 'Facebook'
            },
            instagram: {
                enabled: true,
                dataFiles: ['ig_audience.json', 'ig_posts.json', 'ig_interactions.json', 'ig_reach.json'],
                label: 'Instagram'
            },
            email: {
                enabled: true,
                dataFiles: ['email_campaigns.json'],
                label: 'Email Marketing'
            },
            youtube: {
                enabled: true,
                dataFiles: ['yt_demographics.json', 'yt_geography.json', 'yt_content.json', 'yt_subscription.json'],
                label: 'YouTube'
            }
        }
    },

    // KPI Configuration
    kpis: {
        // Overview KPIs to display
        overview: [
            {
                id: 'total-sessions',
                label: 'Total Website Sessions',
                platform: 'web',
                metric: 'sessions',
                format: 'number'
            },
            {
                id: 'social-engagement',
                label: 'Social Media Engagement',
                platform: 'social',
                metric: 'engagement',
                format: 'number'
            },
            {
                id: 'email-open-rate',
                label: 'Email Open Rate',
                platform: 'email',
                metric: 'open_rate',
                format: 'percentage'
            },
            {
                id: 'youtube-views',
                label: 'YouTube Views',
                platform: 'youtube',
                metric: 'views',
                format: 'number'
            }
        ],

        // Web analytics KPIs
        web: [
            {
                id: 'web-sessions',
                label: 'Sessions',
                metric: 'sessions',
                format: 'number'
            },
            {
                id: 'web-pageviews',
                label: 'Pageviews',
                metric: 'pageviews',
                format: 'number'
            },
            {
                id: 'web-duration',
                label: 'Avg. Session Duration',
                metric: 'avg_session_duration',
                format: 'time'
            },
            {
                id: 'web-bounce',
                label: 'Bounce Rate',
                metric: 'bounce_rate',
                format: 'percentage',
                inverse: true
            }
        ],

        // Facebook KPIs
        facebook: [
            {
                id: 'fb-reach',
                label: 'Page Reach',
                metric: 'reach',
                format: 'number'
            },
            {
                id: 'fb-engagement',
                label: 'Page Engagement',
                metric: 'engagement',
                format: 'number'
            },
            {
                id: 'fb-followers',
                label: 'Page Followers',
                metric: 'followers',
                format: 'number'
            },
            {
                id: 'fb-clicks',
                label: 'Link Clicks',
                metric: 'clicks',
                format: 'number'
            }
        ],

        // Instagram KPIs
        instagram: [
            {
                id: 'ig-reach',
                label: 'Profile Reach',
                metric: 'reach',
                format: 'number'
            },
            {
                id: 'ig-engagement',
                label: 'Profile Engagement',
                metric: 'engagement',
                format: 'number'
            },
            {
                id: 'ig-followers',
                label: 'Profile Followers',
                metric: 'followers',
                format: 'number'
            },
            {
                id: 'ig-views',
                label: 'Profile Views',
                metric: 'views',
                format: 'number'
            }
        ],

        // Email KPIs
        email: [
            {
                id: 'email-open',
                label: 'Open Rate',
                metric: 'open_rate',
                format: 'percentage'
            },
            {
                id: 'email-click',
                label: 'Click Rate',
                metric: 'click_rate',
                format: 'percentage'
            },
            {
                id: 'email-bounce',
                label: 'Bounce Rate',
                metric: 'bounce_rate',
                format: 'percentage',
                inverse: true
            },
            {
                id: 'email-unsub',
                label: 'Unsubscribe Rate',
                metric: 'unsubscribe_rate',
                format: 'percentage',
                inverse: true
            }
        ],

        // YouTube KPIs
        youtube: [
            {
                id: 'yt-views',
                label: 'Total Views',
                metric: 'views',
                format: 'number'
            },
            {
                id: 'yt-watch-time',
                label: 'Watch Time (hrs)',
                metric: 'watch_time',
                format: 'number'
            },
            {
                id: 'yt-duration',
                label: 'Avg. View Duration',
                metric: 'avg_view_duration',
                format: 'time'
            },
            {
                id: 'yt-subscribers',
                label: 'Subscriber Growth',
                metric: 'new_subscribers',
                format: 'number'
            }
        ]
    },

    // Advanced Settings
    advanced: {
        // Debug mode (logs additional information to console)
        debug: true, // Enable debug mode for troubleshooting

        // Enable experimental features
        experimental: false,

        // Timeout for data loading (milliseconds)
        dataLoadTimeout: 30000,

        // Custom field mappings for data processing
        fieldMappings: {
            // Example: map a field in source data to a standardized field name
            // 'source_field_name': 'standardized_field_name'
        }
    }
};

// Make config available globally in browser context
window.DASHBOARD_CONFIG = DASHBOARD_CONFIG;

// For Node.js environments (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DASHBOARD_CONFIG;
}