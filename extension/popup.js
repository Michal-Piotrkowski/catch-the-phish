document.addEventListener('DOMContentLoaded', async () => {
  const scoreValue = document.getElementById('scoreValue');
  const confidenceValue = document.getElementById('confidenceValue');
  const NESTJS_API_URL = 'http://localhost:3000/detect';

  // Funkcja resetująca panel wyników
  const setDisplay = (scoreText, confidenceText, className) => {
    scoreValue.textContent = scoreText;
    scoreValue.className = `value ${className}`;
    confidenceValue.textContent = confidenceText;
    confidenceValue.className = `value ${className}`;
  };

  try {
    // 1. Pobranie aktywnej karty
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // DODANE ZABEZPIECZENIE: Sprawdzamy, czy to nie jest strona systemowa Chrome
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('https://chrome.google.com/webstore')) {
      setDisplay("Zablokowana strona", "--", "error");
      return; // Przerywamy dalsze działanie
    }

    // 2. Wstrzyknięcie skryptu (reszta kodu zostaje tak jak była)
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim(),
    });

    const selectedText = injectionResults[0].result;

    // 3. Sprawdzenie, czy użytkownik coś zaznaczył
    if (!selectedText) {
      setDisplay("Wymagany", "--", "error");
      return;
    }

    // 4. Rozpoczęcie analizy
    setDisplay("Analiza AI...", "...", "loading");

    const response = await fetch(NESTJS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: selectedText,
        metadata: { source: "popup_auto_grab" }
      })
    });

    if (!response.ok) throw new Error("Błąd serwera");

    const result = await response.json();

    // 5. Wyświetlenie samego wyniku i procentów zgodnie z nową strukturą
    if (result.success && result.data) {
      const isPhishing = result.data.is_phishing;
      const confidence = (result.data.confidence * 100).toFixed(1) + "%";
      
      const scoreText = isPhishing ? "Wykryto Phishing!" : "Bezpieczny";
      setDisplay(scoreText, confidence, isPhishing ? "phishing" : "safe");
    }

  } catch (error) {
    console.error("Błąd:", error);
    setDisplay("Błąd połączenia", "--", "error");
  }
});