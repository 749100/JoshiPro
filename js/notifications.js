document.addEventListener("DOMContentLoaded", () => {
    const feedContainer = document.getElementById("notificationsContainer");
    
    if (typeof firebase === "undefined" || !firebase.database) {
        console.error("Firebase Realtime Database library is missing from your HTML scripts.");
        if (feedContainer) {
            feedContainer.innerHTML = `<div style="padding:20px; color:#ef4444; font-weight:bold; text-align:center;">Setup Error: Database Script Missing.</div>`;
        }
        return;
    }

    const realtimeDb = firebase.database();
    
    // In-memory data caches for our separate parallel streams
    let jobsList = [];
    let notificationsList = [];

    // Unified Master UI Compiler
    function renderUnifiedHubUI() {
        if (!feedContainer) return;

        // Merge both arrays into a single list
        let combinedFeedArray = [...jobsList, ...notificationsList];

        // Clear out loading messages
        feedContainer.innerHTML = "";

        if (combinedFeedArray.length === 0) {
            feedContainer.innerHTML = `
                <div style="padding: 30px; border: 2px dashed #94a3b8; border-radius: 8px; text-align: center; color: #1e293b; font-weight: 700; background: #ffffff; font-family: sans-serif;">
                    No recent updates or active career postings located in workspace records.
                </div>`;
            return;
        }

        // Sort the entire unified timeline array (Newest First)
        combinedFeedArray.sort((a, b) => b.sortTime - a.sortTime);

        // Build HTML Elements
        combinedFeedArray.forEach((item) => {
            const cardNode = document.createElement("div");
            
            // Inline layouts to bypass any stylesheet color/visibility glitches
            cardNode.style.display = "flex";
            cardNode.style.justifyContent = "space-between";
            cardNode.style.alignItems = "center";
            cardNode.style.background = "#ffffff";
            cardNode.style.padding = "20px";
            cardNode.style.marginBottom = "15px";
            cardNode.style.borderRadius = "8px";
            cardNode.style.boxShadow = "0 4px 6px rgba(0,0,0,0.06)";
            cardNode.style.borderLeft = item.badgeClass === "marketplace" ? "6px solid #0066cc" : "6px solid #d97706";

            cardNode.innerHTML = `
                <div style="flex: 1; padding-right: 20px; text-align: left;">
                    <h3 style="margin: 0 0 6px 0; font-size: 17px; font-weight: 800; color: #1e293b; font-family: sans-serif;">${item.title}</h3>
                    <p style="margin: 0; font-size: 14px; color: #475569; font-weight: 500; line-height: 1.4; font-family: sans-serif;">${item.message}</p>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px; min-width: 110px;">
                    <span style="font-size: 12px; color: #64748b; font-weight: 600; font-family: sans-serif;">${item.timeStr}</span>
                    <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; background: ${item.badgeClass === 'marketplace' ? '#dbeafe' : '#fef3c7'}; color: ${item.badgeClass === 'marketplace' ? '#1e40af' : '#92400e'}; font-family: sans-serif;">${item.badgeLabel}</span>
                </div>
            `;
            feedContainer.appendChild(cardNode);
        });
    }

    // Date/Time parsing utility helper
    function getDisplayTime(timestampValue) {
        let rawTimeNum = timestampValue ? Number(timestampValue) : Date.now();
        let displayTime = "Just Now";
        try {
            displayTime = new Date(rawTimeNum).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch(e) { console.error("Timestamp parsing error:", e); }
        return { rawTimeNum, displayTime };
    }

    // ==========================================================================
    // AUTH MONITOR CONTENT FLOW WRAPPER
    // ==========================================================================
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Generate sanitized path node matching user profiles setup
        const emailKey = user.email.replace(/\./g, "_").replace(/@/g, "_at_");

        // ==========================================================================
        // DATA STREAM A: Real-Time Observer for Job Board Posts (Public Node)
        // ==========================================================================
        realtimeDb.ref("jobs").on("value", (snapshot) => {
            jobsList = []; 
            
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const jobData = child.val();
                    const { rawTimeNum, displayTime } = getDisplayTime(jobData.timestamp);

                    const company = jobData.company || "Premium Employer";
                    const roleTitle = jobData.title || "Career Position";

                    jobsList.push({
                        id: String(child.key),
                        title: "New Job Opportunity Live",
                        message: `A clean opening for a "${roleTitle}" was just published by ${company}.`,
                        badgeLabel: "Marketplace",
                        badgeClass: "marketplace",
                        sortTime: rawTimeNum,
                        timeStr: displayTime
                    });
                });
            }
            renderUnifiedHubUI();
        }, (err) => console.error("Jobs Stream Failed:", err.message));

        // ==========================================================================
        // DATA STREAM B: Real-Time Observer for Profile Updates (Private Secure Node)
        // ==========================================================================
        realtimeDb.ref("notifications/" + emailKey).on("value", (snapshot) => {
            notificationsList = []; 
            
            if (snapshot.exists()) {
                snapshot.forEach((child) => {
                    const notifData = child.val();
                    const { rawTimeNum, displayTime } = getDisplayTime(notifData.timestamp);

                    notificationsList.push({
                        id: String(child.key),
                        title: notifData.title || "System Activity Log",
                        message: notifData.message || "An account modification action completed successfully.",
                        badgeLabel: notifData.badgeLabel || "Account",
                        badgeClass: notifData.badgeClass || "security",
                        sortTime: rawTimeNum,
                        timeStr: displayTime
                    });
                });
            } else {
                // FALLBACK: If user hasn't modified profile under new path yet, check legacy public path
                realtimeDb.ref("notifications").once("value", (legacySnapshot) => {
                    if (legacySnapshot.exists()) {
                        legacySnapshot.forEach((child) => {
                            const notifData = child.val();
                            const { rawTimeNum, displayTime } = getDisplayTime(notifData.timestamp);
                            
                            // Only pull the global items if they don't explicitly belong to another user path
                            if (!child.hasChildren()) {
                                notificationsList.push({
                                    id: String(child.key),
                                    title: notifData.title || "System Activity Log",
                                    message: notifData.message || "An account modification action completed successfully.",
                                    badgeLabel: notifData.badgeLabel || "Account",
                                    badgeClass: notifData.badgeClass || "security",
                                    sortTime: rawTimeNum,
                                    timeStr: displayTime
                                });
                            }
                        });
                        renderUnifiedHubUI();
                    }
                });
            }
            renderUnifiedHubUI();
        }, (err) => console.error("Notifications Stream Failed:", err.message));
    });
});