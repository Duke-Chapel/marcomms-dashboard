document.addEventListener("DOMContentLoaded", () => {
    const dataPath = DASHBOARD_CONFIG.data.dataPath;
    const platforms = DASHBOARD_CONFIG.data.platforms;

    // Example: load one of the web data files
    const demoFile = platforms.web.dataFiles[0]; // e.g., 'ga_demographics.json'
    const fullPath = `${dataPath}/${demoFile}`;

    fetch(fullPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Loaded JSON data:", data);

            // Example: populate a field for demo
            const sessionsEl = document.getElementById("total-sessions");
            if (sessionsEl) {
                sessionsEl.textContent = data.total_sessions || "12345";
            }
        })
        .catch(error => {
            console.error("Failed to load JSON data:", error);
        });
});