document.addEventListener("DOMContentLoaded", () => {
    // Check that DASHBOARD_CONFIG is available
    if (typeof window.DASHBOARD_CONFIG === "undefined") {
        alert("DASHBOARD_CONFIG is not defined! Check your script order in index.html.");
        return;
    }
    window.DASHBOARD_CONFIG = DASHBOARD_CONFIG;

    const config = window.DASHBOARD_CONFIG;
    const dataPath = config.data.dataPath;
    const platforms = config.data.platforms;
    const kpis = config.kpis;

    // Helper: fetch a JSON file from the server
    function fetchData(file) {
        return fetch(`${dataPath}/${file}`)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                return response.json();
            })
            .catch(error => {
                console.error(`Failed to load ${file}:`, error);
                return null;
            });
    }

    // Load all data files for all enabled platforms; returns { platform: { fileKey: data, ... }, ... }
    async function loadAllData() {
        const platformData = {};
        for (const [platform, settings] of Object.entries(platforms)) {
            if (!settings.enabled) continue;
            platformData[platform] = {};
            for (const file of settings.dataFiles) {
                const data = await fetchData(file);
                if (data) {
                    const key = file.replace(/\.json$/, "");
                    platformData[platform][key] = data;
                }
            }
        }
        return platformData;
    }

    // Populate dashboard KPIs from loaded data objects
    function populateKPIs(platformData) {
        // Overview KPIs
        if (kpis.overview) {
            kpis.overview.forEach(kpi => {
                let value = "--";
                // Try to find the KPI value in any dataset for the platform
                if (platformData[kpi.platform]) {
                    for (const dataset of Object.values(platformData[kpi.platform])) {
                        if (dataset && dataset[kpi.metric] !== undefined) {
                            value = dataset[kpi.metric];
                            break;
                        }
                    }
                }
                const el = document.getElementById(kpi.id);
                if (el) el.textContent = value;
            });
        }
        // Add more sections here for web, facebook, etc., as needed
    }

    // Hide the loading overlay when ready
    function hideLoadingOverlay() {
        const overlay = document.getElementById("loading-overlay");
        if (overlay) overlay.style.display = "none";
    }

    // Main logic
    loadAllData().then(platformData => {
        populateKPIs(platformData);
        hideLoadingOverlay();
    });
});