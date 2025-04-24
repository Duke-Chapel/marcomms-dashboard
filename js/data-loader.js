/**
 * Data loading utilities for marketing dashboard
 */
class DataLoader {
    constructor() {
        this.data = {
            overview: null,
            ga: null,
            social: null,
            email: null,
            youtube: null
        };
        this.dateFilterActive = false;
        this.startDate = null;
        this.endDate = null;
    }
    
    /**
     * Load all data files
     */
    async loadAllData() {
        try {
            // Load all data simultaneously
            const [overview, ga, social, email, youtube] = await Promise.all([
                this.fetchJSON('data/overview.json'),
                this.fetchJSON('data/ga_data.json'),
                this.fetchJSON('data/social_data.json'),
                this.fetchJSON('data/email_data.json'),
                this.fetchJSON('data/youtube_data.json')
            ]);
            
            // Store data
            this.data.overview = overview;
            this.data.ga = ga;
            this.data.social = social;
            this.data.email = email;
            this.data.youtube = youtube;
            
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    }
    
    /**
     * Fetch and parse JSON file
     */
    async fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    }
    
    /**
     * Get data with optional date filtering
     */
    getData(dataType) {
        // Get the raw data
        const rawData = this.data[dataType];
        
        // If no date filter or data doesn't have dates, return raw data
        if (!this.dateFilterActive || !rawData || !rawData.length || !rawData[0].date) {
            return rawData;
        }
        
        // Filter data by date range
        return rawData.filter(item => {
            if (!item.date) return true;
            return item.date >= this.startDate && item.date <= this.endDate;
        });
    }
    
    /**
     * Set date filter
     */
    setDateFilter(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.dateFilterActive = true;
    }
    
    /**
     * Clear date filter
     */
    clearDateFilter() {
        this.dateFilterActive = false;
        this.startDate = null;
        this.endDate = null;
    }
    
    /**
     * Get last updated timestamp
     */
    getLastUpdated() {
        return this.data.overview?.last_updated || 'Unknown';
    }
}

// Create global data loader instance
const dataLoader = new DataLoader();