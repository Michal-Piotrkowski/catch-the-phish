const NESTJS_API_URL = 'http://localhost:3000/ml/detect';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyze-phishing",
    title: "Analyze for phishing",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-phishing") {
    const selectedText = info.selectionText;
    analyzeText(selectedText);
  }
});

async function analyzeText(text) {
  try {
    const response = await fetch(NESTJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: text
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();

    if (result.isPhishing !== undefined && result.confidence !== undefined) {
      showNotification(result.isPhishing, result.confidence);
    } else {
      showError("Invalid response from server.");
    }

  } catch (error) {
    console.error("Connection error:", error);
    showError("Failed to connect to the server.");
  }
}

function showNotification(isPhishing, confidence) {
  const percentage = (confidence * 100).toFixed(1) + "%";

  const title = isPhishing ? "⚠️ Phishing Detected!" : "✅ Safe Text";
  const message = isPhishing
    ? `This text appears to be phishing. (Confidence: ${percentage})`
    : `Text does not show phishing characteristics. (Confidence: ${percentage})`;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
    priority: isPhishing ? 2 : 0
  });
}

function showError(errorMessage) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Analysis Error",
    message: errorMessage,
    priority: 1
  });
}