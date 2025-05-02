document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.DASHBOARD_CONFIG === "undefined") {
        console.error("DASHBOARD_CONFIG is not defined! Make sure dashboard.js is loaded before loader.js.");
        return;
    }

    // Helper: fetch JSON and return a Promise
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

    // For each platform, fetch all data files and store results
    async function loadAllData() {
        const platformData = {};
        for (const [platform, settings] of Object.entries(platforms)) {
            if (!settings.enabled) continue;
            platformData[platform] = {};
            for (const file of settings.dataFiles) {
                const data = await fetchData(file);
                if (data) {
                    // Store data by filename minus extension
                    const key = file.replace(/\.json$/, "");
                    platformData[platform][key] = data;
                }
            }
        }
        return platformData;
    }

    // Populate KPIs if data is available
    function populateKPIs(platformData) {
        // Overview KPIs
        if (kpis.overview) {
            kpis.overview.forEach(kpi => {
                let value = "--";
                if (platformData[kpi.platform]) {
                    // Look through all data files for the KPI value
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
        // You can expand this for other sections (web, facebook, etc.) as needed
    }

    // Show/hide loading overlay
    function hideLoadingOverlay() {
        const overlay = document.getElementById("loading-overlay");
        if (overlay) overlay.style.display = "none";
    }

    // Main
    loadAllData().then(platformData => {
        populateKPIs(platformData);
        hideLoadingOverlay();
    });
});