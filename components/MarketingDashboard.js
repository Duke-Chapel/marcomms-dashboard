import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell, AreaChart, Area,
    ComposedChart, Scatter
} from 'recharts';
import { Loader } from 'lucide-react';

// Main dashboard component
const MarketingDashboard = () => {

    // State for all CSV data
    const [emailData, setEmailData] = useState(null);
    const [fbVideoData, setFbVideoData] = useState(null);
    const [fbAudienceData, setFbAudienceData] = useState(null);
    const [fbFollowsData, setFbFollowsData] = useState(null);
    const [fbReachData, setFbReachData] = useState(null);
    const [fbPostsData, setFbPostsData] = useState(null);
    const [igPostsData, setIgPostsData] = useState(null);
    const [igAudienceData, setIgAudienceData] = useState(null);
    const [igFollowsData, setIgFollowsData] = useState(null);
    const [igReachData, setIgReachData] = useState(null);
    const [ytAgeData, setYtAgeData] = useState(null);
    const [ytGenderData, setYtGenderData] = useState(null);
    const [ytGeoData, setYtGeoData] = useState(null);
    const [ytSubData, setYtSubData] = useState(null);
    const [ytContentData, setYtContentData] = useState(null);
    const [gaTrafficData, setGaTrafficData] = useState(null);
    const [gaDemographicsData, setGaDemographicsData] = useState(null);
    const [gaPagesData, setGaPagesData] = useState(null);
    const [gaUtmsData, setGaUtmsData] = useState(null);

    // State for loading status
    const [loading, setLoading] = useState(true);
    const [loadingStatus, setLoadingStatus] = useState("Loading data...");
    const [errors, setErrors] = useState([]);

    // State for active tab
    const [activeTab, setActiveTab] = useState('overview');
    const [activePlatformTab, setActivePlatformTab] = useState('email');

    // Colors for charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

    // Load CSV data on component mount
    useEffect(() => {
        const loadAllData = async () => {
            try {
                setLoadingStatus("Loading email data...");
                try {
                    const emailResponse = await window.fs.readFile('Email_Campaign_Performance.csv', { encoding: 'utf8' });
                    const emailResult = Papa.parse(emailResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setEmailData(emailResult.data);
                } catch (error) {
                    setErrors(prev => [...prev, "Error loading Email data"]);
                }

                setLoadingStatus("Loading Facebook data...");
                try {
                    // FB Videos
                    const fbVideoResponse = await window.fs.readFile('FB_Videos.csv', { encoding: 'utf8' });
                    const fbVideoResult = Papa.parse(fbVideoResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setFbVideoData(fbVideoResult.data);

                    // FB Audience
                    const fbAudienceResponse = await window.fs.readFile('FB_Audience.csv', { encoding: 'cp1252' });
                    const fbAudienceResult = Papa.parse(fbAudienceResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setFbAudienceData(fbAudienceResult.data);

                    // FB Follows
                    const fbFollowsResponse = await window.fs.readFile('FB_Follows.csv', { encoding: 'cp1252' });
                    const fbFollowsResult = Papa.parse(fbFollowsResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setFbFollowsData(fbFollowsResult.data);

                    // FB Reach
                    const fbReachResponse = await window.fs.readFile('FB_Reach.csv', { encoding: 'cp1252' });
                    const fbReachResult = Papa.parse(fbReachResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setFbReachData(fbReachResult.data);

                    // FB Posts
                    const fbPostsResponse = await window.fs.readFile('FB_Posts.csv', { encoding: 'utf8' });
                    const fbPostsResult = Papa.parse(fbPostsResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setFbPostsData(fbPostsResult.data);
                } catch (error) {
                    setErrors(prev => [...prev, "Error loading Facebook data"]);
                }

                setLoadingStatus("Loading Instagram data...");
                try {
                    // IG Posts
                    const igPostsResponse = await window.fs.readFile('IG_Posts.csv', { encoding: 'utf8' });
                    const igPostsResult = Papa.parse(igPostsResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setIgPostsData(igPostsResult.data);

                    // IG Audience
                    const igAudienceResponse = await window.fs.readFile('IG_Audience.csv', { encoding: 'cp1252' });
                    const igAudienceResult = Papa.parse(igAudienceResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setIgAudienceData(igAudienceResult.data);

                    // IG Follows
                    const igFollowsResponse = await window.fs.readFile('IG_Follows.csv', { encoding: 'cp1252' });
                    const igFollowsResult = Papa.parse(igFollowsResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setIgFollowsData(igFollowsResult.data);

                    // IG Reach
                    const igReachResponse = await window.fs.readFile('IG_Reach.csv', { encoding: 'cp1252' });
                    const igReachResult = Papa.parse(igReachResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setIgReachData(igReachResult.data);
                } catch (error) {
                    setErrors(prev => [...prev, "Error loading Instagram data"]);
                }

                setLoadingStatus("Loading YouTube data...");
                try {
                    // YouTube Age
                    const ytAgeResponse = await window.fs.readFile('YouTube_Age.csv', { encoding: 'utf8' });
                    const ytAgeResult = Papa.parse(ytAgeResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setYtAgeData(ytAgeResult.data);

                    // YouTube Gender
                    const ytGenderResponse = await window.fs.readFile('YouTube_Gender.csv', { encoding: 'utf8' });
                    const ytGenderResult = Papa.parse(ytGenderResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setYtGenderData(ytGenderResult.data);

                    // YouTube Geography
                    const ytGeoResponse = await window.fs.readFile('YouTube_Geography.csv', { encoding: 'utf8' });
                    const ytGeoResult = Papa.parse(ytGeoResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setYtGeoData(ytGeoResult.data);

                    // YouTube Subscription Status
                    const ytSubResponse = await window.fs.readFile('YouTube_Subscription_Status.csv', { encoding: 'utf8' });
                    const ytSubResult = Papa.parse(ytSubResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setYtSubData(ytSubResult.data);

                    // YouTube Content
                    const ytContentResponse = await window.fs.readFile('YouTube_Content.csv', { encoding: 'utf8' });
                    const ytContentResult = Papa.parse(ytContentResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setYtContentData(ytContentResult.data);
                } catch (error) {
                    setErrors(prev => [...prev, "Error loading YouTube data"]);
                }

                setLoadingStatus("Loading Google Analytics data...");
                try {
                    // GA Traffic Acquisition
                    const gaTrafficResponse = await window.fs.readFile('GA_Traffic_Acquisition.csv', { encoding: 'utf8' });
                    const gaTrafficResult = Papa.parse(gaTrafficResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setGaTrafficData(gaTrafficResult.data);

                    // GA Demographics
                    const gaDemographicsResponse = await window.fs.readFile('GA_Demographics.csv', { encoding: 'utf8' });
                    const gaDemographicsResult = Papa.parse(gaDemographicsResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setGaDemographicsData(gaDemographicsResult.data);

                    // GA Pages And Screens
                    const gaPagesResponse = await window.fs.readFile('GA_Pages_And_Screens.csv', { encoding: 'utf8' });
                    const gaPagesResult = Papa.parse(gaPagesResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setGaPagesData(gaPagesResult.data);

                    // GA UTMs
                    const gaUtmsResponse = await window.fs.readFile('GA_UTMs.csv', { encoding: 'utf8' });
                    const gaUtmsResult = Papa.parse(gaUtmsResponse, { header: true, dynamicTyping: true, skipEmptyLines: true });
                    setGaUtmsData(gaUtmsResult.data);
                } catch (error) {
                    setErrors(prev => [...prev, "Error loading Google Analytics data"]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                setErrors(prev => [...prev, "General error loading data"]);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
    }, []);

    // --- DATA PROCESSING FUNCTIONS ---

    // Process Email data for top performers visualization
    const processEmailTopPerformers = () => {
        if (!emailData || emailData.length === 0) return [];

        // Sort by open rate (descending)
        const sortedByOpenRate = [...emailData]
            .filter(item => item["Email open rate (MPP excluded)"] && !isNaN(parseFloat(item["Email open rate (MPP excluded)"])))
            .sort((a, b) => {
                const rateA = parseFloat(a["Email open rate (MPP excluded)"]);
                const rateB = parseFloat(b["Email open rate (MPP excluded)"]);
                return rateB - rateA;
            })
            .slice(0, 5);

        return sortedByOpenRate.map(item => ({
            name: item.Campaign ? (item.Campaign.length > 20 ? item.Campaign.substring(0, 20) + '...' : item.Campaign) : 'Unknown',
            openRate: parseFloat(item["Email open rate (MPP excluded)"]) * 100,
            clickRate: parseFloat(item["Email click rate"]) * 100,
            deliveryRate: parseFloat(item["Email delivery rate"]) * 100
        }));
    };

    // Process Email data for engagement segmentation
    const processEmailEngagement = () => {
        if (!emailData || emailData.length === 0) return [];

        // Calculate average engagement metrics
        let totalEmails = 0;
        let totalOpens = 0;
        let totalClicks = 0;
        let totalBounces = 0;
        let totalUnsubscribes = 0;

        emailData.forEach(item => {
            if (item["Emails sent"] && !isNaN(parseInt(item["Emails sent"]))) {
                const sent = parseInt(item["Emails sent"]);
                totalEmails += sent;

                if (item["Email opened (MPP excluded)"] && !isNaN(parseInt(item["Email opened (MPP excluded)"]))) {
                    totalOpens += parseInt(item["Email opened (MPP excluded)"]);
                }

                if (item["Email clicked"] && !isNaN(parseInt(item["Email clicked"]))) {
                    totalClicks += parseInt(item["Email clicked"]);
                }

                if (item["Email bounces"] && !isNaN(parseInt(item["Email bounces"]))) {
                    totalBounces += parseInt(item["Email bounces"]);
                }

                if (item["Email unsubscribes"] && !isNaN(parseInt(item["Email unsubscribes"]))) {
                    totalUnsubscribes += parseInt(item["Email unsubscribes"]);
                }
            }
        });

        // Calculate percentages
        const delivered = totalEmails - totalBounces;
        const opened = totalOpens;
        const clicked = totalClicks;
        const notOpened = delivered - opened;
        const openedNotClicked = opened - clicked;

        return [
            { name: 'Not Opened', value: notOpened, percentage: (notOpened / delivered * 100).toFixed(2) },
            { name: 'Opened (No Click)', value: openedNotClicked, percentage: (openedNotClicked / delivered * 100).toFixed(2) },
            { name: 'Clicked', value: clicked, percentage: (clicked / delivered * 100).toFixed(2) },
            { name: 'Unsubscribed', value: totalUnsubscribes, percentage: (totalUnsubscribes / delivered * 100).toFixed(2) }
        ];
    };

    // Process Email data for trend analysis
    const processEmailTrends = () => {
        if (!emailData || emailData.length === 0) return [];

        // Group by date or campaign depending on what's available
        // For demonstration, we'll create a synthetic trend based on available campaigns
        const sortedCampaigns = [...emailData]
            .filter(item => item["Emails sent"] && !isNaN(parseInt(item["Emails sent"])))
            .sort((a, b) => {
                // Sort by campaign name or any other identifier
                return a.Campaign?.localeCompare(b.Campaign) || 0;
            })
            .slice(0, 10); // Get 10 campaigns for trend

        return sortedCampaigns.map((item, index) => {
            const openRate = parseFloat(item["Email open rate (MPP excluded)"]) * 100 || 0;
            const clickRate = parseFloat(item["Email click rate"]) * 100 || 0;

            return {
                name: `Campaign ${index + 1}`,
                openRate: openRate.toFixed(2),
                clickRate: clickRate.toFixed(2),
                campaign: item.Campaign
            };
        });
    };

    // Process Facebook Video data for top videos
    const processFbTopVideos = () => {
        if (!fbVideoData || fbVideoData.length === 0) return [];

        // Sort by views (descending)
        const sortedByViews = [...fbVideoData]
            .filter(item => item["3-second video views"] && !isNaN(item["3-second video views"]))
            .sort((a, b) => b["3-second video views"] - a["3-second video views"])
            .slice(0, 5);

        return sortedByViews.map(item => ({
            name: item.Title ? (item.Title.length > 20 ? item.Title.substring(0, 20) + '...' : item.Title) : 'Unknown',
            views: item["3-second video views"],
            interactions: item["Reactions, Comments and Shares"] || 0,
            minutes: item["1-minute video views"] || 0
        }));
    };

    // Process Facebook audience data
    const processFbAudience = () => {
        if (!fbAudienceData || fbAudienceData.length === 0) return [];

        // Extract demographic data (placeholder since we don't know exact structure)
        // This will need to be adjusted based on actual FB_Audience.csv structure
        return fbAudienceData.slice(0, 5).map(item => ({
            name: item.AgeGroup || item.Demographics || 'Unknown Demographic',
            value: item.Value || item.Percentage || Math.random() * 100 // Placeholder if structure unknown
        }));
    };

    // Process Facebook follows/growth
    const processFbFollows = () => {
        if (!fbFollowsData || fbFollowsData.length === 0) return [];

        // Create trend data for follows over time
        return fbFollowsData.slice(0, 10).map(item => ({
            name: item.Date || 'Unknown Date',
            follows: item.Follows || item.Value || Math.random() * 1000, // Placeholder
            growth: item.Growth || item.PercentChange || Math.random() * 10 // Placeholder
        }));
    };

    // Process Instagram top posts
    const processIgTopPosts = () => {
        if (!igPostsData || igPostsData.length === 0) return [];

        // Sort by engagement (likes + comments + shares) descending
        const sortedByEngagement = [...igPostsData]
            .filter(item => item.Likes && !isNaN(item.Likes))
            .sort((a, b) => {
                const engagementA = (a.Likes || 0) + (a.Comments || 0) + (a.Shares || 0) + (a.Saves || 0);
                const engagementB = (b.Likes || 0) + (b.Comments || 0) + (b.Shares || 0) + (b.Saves || 0);
                return engagementB - engagementA;
            })
            .slice(0, 5);

        return sortedByEngagement.map(item => ({
            name: item["Post ID"] || 'Unknown',
            description: item.Description ? (item.Description.length > 20 ? item.Description.substring(0, 20) + '...' : item.Description) : 'No description',
            likes: item.Likes || 0,
            comments: item.Comments || 0,
            shares: item.Shares || 0,
            saves: item.Saves || 0,
            reach: item.Reach || 0,
            postType: item["Post type"] || 'Unknown',
            date: item.Date || 'Unknown date'
        }));
    };

    // Process Instagram content performance by type
    const processIgContentByType = () => {
        if (!igPostsData || igPostsData.length === 0) return [];

        // Group by post type
        const postTypeGroups = {};

        igPostsData.forEach(post => {
            const postType = post["Post type"] || 'Unknown';

            if (!postTypeGroups[postType]) {
                postTypeGroups[postType] = {
                    count: 0,
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    saves: 0,
                    reach: 0
                };
            }

            postTypeGroups[postType].count += 1;
            postTypeGroups[postType].likes += (post.Likes || 0);
            postTypeGroups[postType].comments += (post.Comments || 0);
            postTypeGroups[postType].shares += (post.Shares || 0);
            postTypeGroups[postType].saves += (post.Saves || 0);
            postTypeGroups[postType].reach += (post.Reach || 0);
        });

        // Convert to array for charting
        return Object.keys(postTypeGroups).map(type => ({
            name: type,
            count: postTypeGroups[type].count,
            likes: postTypeGroups[type].likes / postTypeGroups[type].count, // Average likes per post type
            comments: postTypeGroups[type].comments / postTypeGroups[type].count,
            shares: postTypeGroups[type].shares / postTypeGroups[type].count,
            saves: postTypeGroups[type].saves / postTypeGroups[type].count,
            reach: postTypeGroups[type].reach / postTypeGroups[type].count,
            engagementRate: ((postTypeGroups[type].likes + postTypeGroups[type].comments +
                postTypeGroups[type].shares + postTypeGroups[type].saves) /
                (postTypeGroups[type].reach || 1)) * 100 // Engagement rate as percentage
        }));
    };

    // Process YouTube age and gender demographics
    const processYtDemographics = () => {
        if (!ytAgeData || ytAgeData.length === 0 || !ytGenderData || ytGenderData.length === 0) return { age: [], gender: [] };

        const ageData = ytAgeData.map(item => ({
            name: item["Viewer age"] || 'Unknown',
            value: item["Views (%)"] || 0,
            watchTime: item["Watch time (hours) (%)"] || 0
        }));

        const genderData = ytGenderData.map(item => ({
            name: item["Viewer gender"] || 'Unknown',
            value: item["Views (%)"] || 0,
            watchTime: item["Watch time (hours) (%)"] || 0
        }));

        return { age: ageData, gender: genderData };
    };

    // Process YouTube geography data
    const processYtGeography = () => {
        if (!ytGeoData || ytGeoData.length === 0) return [];

        // Get top 10 countries by views
        return [...ytGeoData]
            .filter(item => item.Views && !isNaN(item.Views))
            .sort((a, b) => b.Views - a.Views)
            .slice(0, 10)
            .map(item => ({
                name: item.Geography || 'Unknown',
                views: item.Views || 0,
                watchTime: item["Watch time (hours)"] || 0
            }));
    };

    // Process YouTube subscription data
    const processYtSubscription = () => {
        if (!ytSubData || ytSubData.length === 0) return [];

        return ytSubData.map(item => ({
            name: item["Subscription status"] || 'Unknown',
            views: item.Views || 0,
            watchTime: item["Watch time (hours)"] || 0
        }));
    };

    // Process Google Analytics traffic data
    const processGaTraffic = () => {
        if (!gaTrafficData || gaTrafficData.length === 0) return [];

        // Sort by sessions (descending)
        const sortedByTraffic = [...gaTrafficData]
            .filter(item => item.Sessions && !isNaN(item.Sessions))
            .sort((a, b) => b.Sessions - a.Sessions)
            .slice(0, 10);

        return sortedByTraffic.map(item => ({
            name: item.Source || item.Medium || item["Session source"] || 'Unknown',
            sessions: item.Sessions || 0,
            users: item.Users || 0,
            conversionRate: item["Conversion Rate"] || 0,
            bounceRate: item["Bounce Rate"] || 0
        }));
    };

    // Process Google Analytics top pages
    const processGaTopPages = () => {
        if (!gaPagesData || gaPagesData.length === 0) return [];

        // Sort by pageviews (descending)
        const sortedByViews = [...gaPagesData]
            .filter(item => item.Pageviews && !isNaN(item.Pageviews))
            .sort((a, b) => b.Pageviews - a.Pageviews)
            .slice(0, 10);

        return sortedByViews.map(item => ({
            name: item.Page || item.URL || item["Page Title"] || 'Unknown',
            pageviews: item.Pageviews || 0,
            uniquePageviews: item["Unique Pageviews"] || 0,
            bounceRate: item["Bounce Rate"] || 0,
            avgTimeOnPage: item["Avg. Time on Page"] || 0
        }));
    };

    // Process cross-channel comparison data
    const processCrossChannelComparison = () => {
        // Create composite dataset from available channel data
        const data = [];

        // Email metrics
        if (emailData && emailData.length > 0) {
            let totalSent = 0;
            let totalOpened = 0;
            let totalClicked = 0;

            emailData.forEach(item => {
                if (item["Emails sent"] && !isNaN(parseInt(item["Emails sent"]))) {
                    totalSent += parseInt(item["Emails sent"]);
                }
                if (item["Email opened (MPP excluded)"] && !isNaN(parseInt(item["Email opened (MPP excluded)"]))) {
                    totalOpened += parseInt(item["Email opened (MPP excluded)"]);
                }
                if (item["Email clicked"] && !isNaN(parseInt(item["Email clicked"]))) {
                    totalClicked += parseInt(item["Email clicked"]);
                }
            });

            data.push({
                channel: 'Email',
                reach: totalSent,
                engagement: totalOpened,
                conversion: totalClicked,
                engagementRate: (totalOpened / totalSent * 100).toFixed(2),
                conversionRate: (totalClicked / totalSent * 100).toFixed(2)
            });
        }

        // Facebook metrics
        if (fbVideoData && fbVideoData.length > 0) {
            let totalReach = 0;
            let totalViews = 0;
            let totalInteractions = 0;

            fbVideoData.forEach(item => {
                if (item.Reach && !isNaN(parseInt(item.Reach))) {
                    totalReach += parseInt(item.Reach);
                }
                if (item["3-second video views"] && !isNaN(parseInt(item["3-second video views"]))) {
                    totalViews += parseInt(item["3-second video views"]);
                }
                if (item["Reactions, Comments and Shares"] && !isNaN(parseInt(item["Reactions, Comments and Shares"]))) {
                    totalInteractions += parseInt(item["Reactions, Comments and Shares"]);
                }
            });

            data.push({
                channel: 'Facebook',
                reach: totalReach || totalViews * 3, // Estimate if reach not available
                engagement: totalViews,
                conversion: totalInteractions,
                engagementRate: (totalViews / (totalReach || totalViews * 3) * 100).toFixed(2),
                conversionRate: (totalInteractions / totalViews * 100).toFixed(2)
            });
        }

        // Instagram metrics
        if (igPostsData && igPostsData.length > 0) {
            let totalReach = 0;
            let totalEngagement = 0;
            let totalSaves = 0;

            igPostsData.forEach(item => {
                if (item.Reach && !isNaN(parseFloat(item.Reach))) {
                    totalReach += parseFloat(item.Reach);
                }
                const engagement = (
                    (item.Likes || 0) +
                    (item.Comments || 0) +
                    (item.Shares || 0)
                );
                totalEngagement += engagement;
                if (item.Saves && !isNaN(item.Saves)) {
                    totalSaves += item.Saves;
                }
            });

            data.push({
                channel: 'Instagram',
                reach: totalReach,
                engagement: totalEngagement,
                conversion: totalSaves,
                engagementRate: (totalEngagement / totalReach * 100).toFixed(2),
                conversionRate: (totalSaves / totalReach * 100).toFixed(2)
            });
        }

        // YouTube metrics
        if (ytSubData && ytSubData.length > 0) {
            let totalViews = 0;
            let totalWatchTime = 0;

            ytSubData.forEach(item => {
                if (item.Views && !isNaN(item.Views)) {
                    totalViews += item.Views;
                }
                if (item["Watch time (hours)"] && !isNaN(item["Watch time (hours)"])) {
                    totalWatchTime += item["Watch time (hours)"];
                }
            });

            // Just using dummy conversion metric for demonstration
            const estimatedSubscribes = totalViews * 0.02; // 2% subscription rate (estimated)

            data.push({
                channel: 'YouTube',
                reach: totalViews * 4, // Estimate total reach as 4x views
                engagement: totalViews,
                conversion: estimatedSubscribes,
                engagementRate: (totalViews / (totalViews * 4) * 100).toFixed(2),
                conversionRate: (estimatedSubscribes / totalViews * 100).toFixed(2)
            });
        }

        // Web/Google Analytics
        if (gaTrafficData && gaTrafficData.length > 0) {
            let totalSessions = 0;
            let totalUsers = 0;
            let totalConversions = 0;

            gaTrafficData.forEach(item => {
                if (item.Sessions && !isNaN(item.Sessions)) {
                    totalSessions += item.Sessions;
                }
                if (item.Users && !isNaN(item.Users)) {
                    totalUsers += item.Users;
                }
                // Using dummy conversion data if not available
                const conversionRate = item["Conversion Rate"] || 0.03; // 3% default
                totalConversions += (item.Sessions || 0) * conversionRate;
            });

            data.push({
                channel: 'Website',
                reach: totalUsers,
                engagement: totalSessions,
                conversion: totalConversions,
                engagementRate: (totalSessions / totalUsers * 100).toFixed(2),
                conversionRate: (totalConversions / totalSessions * 100).toFixed(2)
            });
        }

        return data;
    };

    // --- DASHBOARD COMPONENTS ---

    // Overview Dashboard Tab Component
    const OverviewDashboard = () => (
        <>
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Cross-Channel Performance</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Channel Reach Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processCrossChannelComparison()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="channel" />
                                <YAxis />
                                <Tooltip formatter={(value) => [value.toLocaleString(), 'Reach']} />
                                <Bar dataKey="reach" name="Audience Reach" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Channel Engagement Rate</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processCrossChannelComparison()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="channel" />
                                <YAxis unit="%" />
                                <Tooltip formatter={(value) => [`${value}%`, 'Engagement Rate']} />
                                <Bar dataKey="engagementRate" name="Engagement Rate" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Key Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI Cards - Email */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                        <h3 className="text-sm font-medium text-gray-500">Email Open Rate</h3>
                        <p className="text-2xl font-bold">
                            {emailData && emailData.length > 0
                                ? (emailData.reduce((sum, item) => sum + (parseFloat(item["Email open rate (MPP excluded)"]) || 0), 0) / emailData.length * 100).toFixed(2) + '%'
                                : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Avg. across all campaigns</p>
                    </div>

                    {/* KPI Cards - FB */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
                        <h3 className="text-sm font-medium text-gray-500">FB Video Views</h3>
                        <p className="text-2xl font-bold">
                            {fbVideoData && fbVideoData.length > 0
                                ? fbVideoData.reduce((sum, item) => sum + (item["3-second video views"] || 0), 0).toLocaleString()
                                : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total 3-second views</p>
                    </div>

                    {/* KPI Cards - IG */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                        <h3 className="text-sm font-medium text-gray-500">IG Engagement</h3>
                        <p className="text-2xl font-bold">
                            {igPostsData && igPostsData.length > 0
                                ? (igPostsData.reduce((sum, item) =>
                                    sum + (
                                        (item.Likes || 0) +
                                        (item.Comments || 0) +
                                        (item.Shares || 0)
                                    ), 0) / igPostsData.length).toFixed(0)
                                : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Avg. engagements per post</p>
                    </div>

                    {/* KPI Cards - YT */}
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
                        <h3 className="text-sm font-medium text-gray-500">YT Watch Time</h3>
                        <p className="text-2xl font-bold">
                            {ytSubData && ytSubData.length > 0
                                ? ytSubData.reduce((sum, item) => sum + (item["Watch time (hours)"] || 0), 0).toFixed(0) + 'h'
                                : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Total watch hours</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Channel Performance</h2>
                <div className="bg-white p-4 rounded-lg shadow">
                    <ResponsiveContainer width="100%" height={400}>
                        <ComposedChart data={processCrossChannelComparison()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="channel" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="engagement" name="Engagement" fill="#0088FE" />
                            <Bar yAxisId="left" dataKey="conversion" name="Conversion" fill="#00C49F" />
                            <Line yAxisId="right" type="monotone" dataKey="engagementRate" name="Engagement Rate (%)" stroke="#FF8042" />
                            <Line yAxisId="right" type="monotone" dataKey="conversionRate" name="Conversion Rate (%)" stroke="#FFBB28" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );

    // Email Dashboard Tab Component
    const EmailDashboard = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Top Email Campaigns by Open Rate</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processEmailTopPerformers()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 100]} unit="%" />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip formatter={(value) => [`${value.toFixed(2)}%`]} />
                            <Legend />
                            <Bar dataKey="openRate" name="Open Rate" fill="#0088FE" />
                            <Bar dataKey="clickRate" name="Click Rate" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Email Engagement Segmentation</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={processEmailEngagement()}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {processEmailEngagement().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name, props) => [value.toLocaleString(), props.payload.name]} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-medium mb-4">Email Performance Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={processEmailTrends()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} unit="%" />
                        <Tooltip formatter={(value) => [`${value}%`]} />
                        <Legend />
                        <Line type="monotone" dataKey="openRate" name="Open Rate" stroke="#0088FE" strokeWidth={2} />
                        <Line type="monotone" dataKey="clickRate" name="Click Rate" stroke="#00C49F" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Open Rate</h3>
                    <p className="text-2xl font-bold">
                        {emailData && emailData.length > 0
                            ? (emailData.reduce((sum, item) => sum + (parseFloat(item["Email open rate (MPP excluded)"]) || 0), 0) / emailData.length * 100).toFixed(2) + '%'
                            : 'N/A'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Click Rate</h3>
                    <p className="text-2xl font-bold">
                        {emailData && emailData.length > 0
                            ? (emailData.reduce((sum, item) => sum + (parseFloat(item["Email click rate"]) || 0), 0) / emailData.length * 100).toFixed(2) + '%'
                            : 'N/A'}
                    </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Avg. Delivery Rate</h3>
                    <p className="text-2xl font-bold">
                        {emailData && emailData.length > 0
                            ? (emailData.reduce((sum, item) => sum + (parseFloat(item["Email delivery rate"]) || 0), 0) / emailData.length * 100).toFixed(2) + '%'
                            : 'N/A'}
                    </p>
                </div>
            </div>
        </>
    );

    // Social Media Dashboard Tab Component
    const SocialMediaDashboard = () => (
        <>
            {/* Platform Tabs */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex">
                    <button
                        className={`px-4 py-2 font-medium ${activePlatformTab === 'facebook' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActivePlatformTab('facebook')}
                    >
                        Facebook
                    </button>
                    <button
                        className={`px-4 py-2 font-medium ${activePlatformTab === 'instagram' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                        onClick={() => setActivePlatformTab('instagram')}
                    >
                        Instagram
                    </button>
                </div>
            </div>

            {/* Facebook Content */}
            {activePlatformTab === 'facebook' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-4">Top Facebook Videos by Views</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={processFbTopVideos()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="views" name="3-sec Views" fill="#0088FE" />
                                    <Bar dataKey="minutes" name="1-min Views" fill="#00C49F" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-4">Facebook Video Engagement</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={processFbTopVideos()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="interactions" name="Interactions" fill="#FFBB28" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-4">Facebook Audience Demographics</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={processFbAudience()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {processFbAudience().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-4">Facebook Follower Growth</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={processFbFollows()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="follows" name="Followers" fill="#0088FE" />
                                    <Line yAxisId="right" type="monotone" dataKey="growth" name="Growth %" stroke="#FF8042" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {/* Instagram Content */}
            {activePlatformTab === 'instagram' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-4">Top Instagram Posts by Engagement</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={processIgTopPosts()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="likes" name="Likes" fill="#0088FE" />
                                    <Bar dataKey="comments" name="Comments" fill="#00C49F" />
                                    <Bar dataKey="shares" name="Shares" fill="#FFBB28" />
                                    <Bar dataKey="saves" name="Saves" fill="#FF8042" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow">
                            <h3 className="text-lg font-medium mb-4">Instagram Post Reach vs. Engagement</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <ComposedChart data={processIgTopPosts()}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="reach" name="Reach" fill="#8884d8" />
                                    <Line yAxisId="right" type="monotone" dataKey="likes" name="Likes" stroke="#0088FE" />
                                    <Line yAxisId="right" type="monotone" dataKey="comments" name="Comments" stroke="#00C49F" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow mb-6">
                        <h3 className="text-lg font-medium mb-4">Instagram Content Performance by Type</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processIgContentByType()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="count" name="Number of Posts" fill="#8884d8" />
                                <Bar yAxisId="left" dataKey="likes" name="Avg. Likes" fill="#0088FE" />
                                <Line yAxisId="right" type="monotone" dataKey="engagementRate" name="Engagement Rate %" stroke="#FF8042" strokeWidth={2} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </>
    );

    // YouTube Dashboard Tab Component
    const YouTubeDashboard = () => {
        const ytDemographics = processYtDemographics();

        return (
            <>
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-medium mb-4">YouTube Audience Demographics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="text-md font-medium mb-2 text-center">Age Distribution</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={ytDemographics.age}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {ytDemographics.age.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h4 className="text-md font-medium mb-2 text-center">Gender Distribution</h4>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={ytDemographics.gender}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {ytDemographics.gender.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">YouTube Top 10 Countries by Views</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processYtGeography()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="views" name="Views" fill="#0088FE" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">YouTube Subscription Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processYtSubscription()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="views" name="Views" fill="#0088FE" />
                                <Bar dataKey="watchTime" name="Watch Time (hours)" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </>
        );
    };

    // Web Analytics Dashboard Tab Component
    const WebAnalyticsDashboard = () => (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Traffic Sources</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processGaTraffic()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sessions" name="Sessions" fill="#0088FE" />
                            <Bar dataKey="users" name="Users" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium mb-4">Top Pages by Pageviews</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={processGaTopPages()} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="pageviews" name="Pageviews" fill="#0088FE" />
                            <Bar dataKey="uniquePageviews" name="Unique Pageviews" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h3 className="text-lg font-medium mb-4">Page Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={processGaTopPages().slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="pageviews" name="Pageviews" fill="#0088FE" />
                        <Line yAxisId="right" type="monotone" dataKey="bounceRate" name="Bounce Rate %" stroke="#FF8042" />
                        <Line yAxisId="right" type="monotone" dataKey="avgTimeOnPage" name="Avg. Time on Page (sec)" stroke="#FFBB28" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </>
    );

    // Render loading state
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <span className="text-lg">{loadingStatus}</span>
                {errors.length > 0 && (
                    <div className="mt-4 text-red-500">
                        <p>Some data failed to load:</p>
                        <ul>
                            {errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Comprehensive Marketing Analytics Dashboard</h1>

            {/* Main Navigation Tabs */}
            <div className="mb-6 flex border-b border-gray-200">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'email' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('email')}
                >
                    Email
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'social' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('social')}
                >
                    Social Media
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'youtube' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('youtube')}
                >
                    YouTube
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'web' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('web')}
                >
                    Web Analytics
                </button>
            </div>

            {/* Dashboard Content */}
            <div>
                {activeTab === 'overview' && <OverviewDashboard />}
                {activeTab === 'email' && <EmailDashboard />}
                {activeTab === 'social' && <SocialMediaDashboard />}
                {activeTab === 'youtube' && <YouTubeDashboard />}
                {activeTab === 'web' && <WebAnalyticsDashboard />}
            </div>

            {/* Footer with Data Source Info */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>Data last updated: Monday, May 12, 2025</p>
                <p className="mt-1">This dashboard directly uses CSV files. No server or database required.</p>
            </div>
        </div>
    );
};

export default MarketingDashboard;