let quotes = [];

// Load from localStorage or default quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The journey of a thousand miles begins with a single step.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success" }
    ];
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a filtered random quote based on current filter
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);

  const display = document.getElementById("quoteDisplay");
  display.innerHTML = "";

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    display.innerHTML = "<p>No quotes found in this category.</p>";
    return;
  }

  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerHTML = `
    <p><strong>Quote:</strong> "${quote.text}"</p>
    <p><em>Category:</em> ${quote.category}</p>
  `;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Load last viewed quote if available or show filtered quote
function loadLastViewedQuote() {
  const last = sessionStorage.getItem("lastQuote");
  if (last) {
    const quote = JSON.parse(last);
    const display = document.getElementById("quoteDisplay");
    display.innerHTML = `
      <p><strong>Quote:</strong> "${quote.text}"</p>
      <p><em>Category:</em> ${quote.category}</p>
    `;
  } else {
    filterQuotes();
  }
}

// Populate category dropdown dynamically
function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  filter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    filter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("selectedCategory") || "all";
  filter.value = lastFilter;
}

// Add a new quote from user input
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote text and category.");
  }
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();

  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (error) {
      alert("Failed to import. Check file format.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Notify helper for sync messages
function notify(message, isError = false) {
  const statusDiv = document.getElementById("syncStatus");
  statusDiv.textContent = message;
  statusDiv.style.color = isError ? "red" : "blue";
  setTimeout(() => {
    statusDiv.textContent = "";
  }, 5000);
}

// Sync with server (mock API) and resolve conflicts
async function syncWithServer() {
  notify("Syncing with server...");

  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const serverData = await response.json();

    // Convert server data to quote format
    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Map local quotes by text for quick lookup
    const localMap = new Map(quotes.map(q => [q.text, q]));

    // Merge quotes with server priority on conflicts
    serverQuotes.forEach(sq => {
      if (localMap.has(sq.text)) {
        // Override local quote if category differs
        localMap.set(sq.text, sq);
      } else {
        localMap.set(sq.text, sq);
      }
    });

    const mergedQuotes = Array.from(localMap.values());

    // Find conflicts (text same but category differs)
    const conflicts = quotes.filter(localQ => {
      const serverQ = serverQuotes.find(sq => sq.text === localQ.text);
      return serverQ && serverQ.category !== localQ.category;
    });

    // Update local data & UI
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    notify(`Sync complete. ${conflicts.length} conflict(s) resolved.`);
  } catch (error) {
    console.error("Sync error:", error);
    notify("Failed to sync with server.", true);
  }
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", filterQuotes);
document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
document.getElementById("syncBtn").addEventListener("click", syncWithServer);

// Initial load
loadQuotes();
populateCategories();
loadLastViewedQuote();
