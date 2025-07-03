document.addEventListener("DOMContentLoaded", () => {
  const radios = document.querySelectorAll('input[name="mode"]');
  const siteList = document.getElementById("siteList");
  const siteBlock = document.getElementById("siteBlock");
  const saveBtn = document.getElementById("saveBtn");
  const runBtn = document.getElementById("runBtn");

  // טען הגדרות שמורות
  chrome.storage.local.get(["mode", "siteList"], (data) => {
    const mode = data.mode || "auto";
    radios.forEach(r => r.checked = r.value === mode);
    siteList.value = (data.siteList || []).join("\n");
    siteBlock.style.display = mode === "sites" ? "block" : "none";
  });

  // עדכון תצוגה כשמשנים מצב
  radios.forEach(r => {
    r.addEventListener("change", () => {
      siteBlock.style.display = r.value === "sites" ? "block" : "none";
    });
  });

  // שמירת הגדרות
  saveBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="mode"]:checked').value;
    const sites = siteList.value.split("\n").map(s => s.trim()).filter(Boolean);
    chrome.storage.local.set({ mode: selected, siteList: sites }, () => {
      window.close();
    });
  });

  // הפעלת הסקריפט בלחיצה על הכפתור
  runBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) return;
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id, allFrames: true },
        files: ["injector.js"]
      });
      window.close();
    });
  });
});
