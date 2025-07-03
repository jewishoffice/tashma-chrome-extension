function normalizeSite(site) {
  try {
    const url = new URL(site);
    return url.hostname;
  } catch (e) {
    return site; // כנראה כבר שם מתחם תקין
  }
}

function inject(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId, allFrames: true },
    files: ["injector.js"]
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  chrome.storage.local.get(["mode", "siteList"], (data) => {
    const mode = data.mode || "auto";
    if (mode === "manual") {
      // לא עושים כלום אוטומטית
      return;
    }

    let currentHost;
    try {
      currentHost = new URL(tab.url).hostname;
    } catch (e) {
      return;
    }

    if (mode === "auto") {
      inject(tabId);
    } else if (mode === "sites") {
      const normalizedSites = (data.siteList || []).map(normalizeSite);

      const matched = normalizedSites.some(site =>
        currentHost === site || currentHost.endsWith("." + site)
      );

      if (matched) {
        inject(tabId);
      }
    }
  });
});
