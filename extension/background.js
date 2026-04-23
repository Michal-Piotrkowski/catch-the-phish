// Adres endpointu NestJS (zmień port/ścieżkę w razie potrzeby)
const NESTJS_API_URL = 'http://localhost:3000/detect';

// Tworzenie opcji w menu kontekstowym podczas instalacji wtyczki
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyze-phishing",
    title: "Analizuj pod kątem phishingu",
    contexts: ["selection"]
  });
});

// Nasłuchiwanie kliknięcia w menu kontekstowe
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-phishing") {
    const selectedText = info.selectionText;
    analyzeText(selectedText);
  }
});

// Funkcja wysyłająca dane do NestJS
async function analyzeText(text) {
  try {
    const response = await fetch(NESTJS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        metadata: {
          source: "gmail" // Zgodnie z Twoim Data Flow
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }

    const result = await response.json();

    // Obsługa struktury danych z serwera NestJS
    if (result.success && result.data) {
      showNotification(result.data.is_phishing, result.data.confidence);
    } else {
      showError("Otrzymano nieprawidłową odpowiedź z serwera.");
    }

  } catch (error) {
    console.error("Błąd połączenia:", error);
    showError("Nie udało się połączyć z serwerem NestJS.");
  }
}

// Wyświetlanie powiadomienia z wynikiem
function showNotification(isPhishing, confidence) {
  const percentage = (confidence * 100).toFixed(1) + "%";
  
  const title = isPhishing ? "⚠️ Wykryto Phishing!" : "✅ Bezpieczny tekst";
  const message = isPhishing
    ? `Ten tekst to prawdopodobnie oszustwo. (Pewność: ${percentage})`
    : `Tekst nie wykazuje cech phishingu. (Pewność: ${percentage})`;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: title,
    message: message,
    priority: isPhishing ? 2 : 0
  });
}

// Wyświetlanie powiadomienia o błędzie
function showError(errorMessage) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Błąd analizy",
    message: errorMessage,
    priority: 1
  });
}