document.addEventListener('DOMContentLoaded', async () => {
  const scoreValue = document.getElementById('scoreValue');
  const confidenceValue = document.getElementById('confidenceValue');
  const NESTJS_API_URL = 'http://localhost:3000/ml/detect';

  const setDisplay = (scoreText, confidenceText, className) => {
    scoreValue.textContent = scoreText;
    scoreValue.className = `value ${className}`;
    confidenceValue.textContent = confidenceText;
    confidenceValue.className = `value ${className}`;
  };

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
      setDisplay("Restricted page", "--", "error");
      return;
    }

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim(),
    });

    const selectedText = injectionResults[0].result;

    if (!selectedText) {
      setDisplay("Selection required", "--", "error");
      return;
    }

    setDisplay("Analyzing...", "...", "loading");

    const response = await fetch(NESTJS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: selectedText
      })
    });

    if (!response.ok) throw new Error("Server error");

    const result = await response.json();

    if (result.isPhishing !== undefined && result.confidence !== undefined) {
      const isPhishing = result.isPhishing;
      const confidence = (result.confidence * 100).toFixed(1) + "%";

      const scoreText = isPhishing ? "Phishing Detected!" : "Safe";
      setDisplay(scoreText, confidence, isPhishing ? "phishing" : "safe");
    }

  } catch (error) {
    console.error("Error:", error);
    setDisplay("Connection error", "--", "error");
  }
});