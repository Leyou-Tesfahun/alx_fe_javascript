// Initial quotes array with some sample data
let quotes = [
  { text: "The journey of a thousand miles begins with one step.", category: "Inspirational" },
  { text: "To be or not to be, that is the question.", category: "Philosophy" },
  { text: "I think, therefore I am.", category: "Philosophy" },
  { text: "Be yourself; everyone else is already taken.", category: "Inspirational" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const newQuoteBtn = document.getElementById("newQuote");
const syncStatus = document.getElementById("syncStatus");

// Load quotes from local storage if available
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display a random quote (filtered by category)
function showRandomQuote() {
  let filteredQuotes = quotes;
  const selectedCategory = categoryFilter.value;

  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// Add a new quote dynamically
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();  // refresh displayed quotes with new filter
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added successfully!");
}

// Populate categories dropdown dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  // Clear previous options except 'all'
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category from local storage if any
  const lastCategory = localStorage.getItem("lastCategory");
  if (lastCategory && categories.includes(lastCategory)) {
    categoryFilter.value = lastCategory;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  localStorage.setItem("lastCategory", categoryFilter.value);
  showRandomQuote();
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
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error("Invalid JSON format");
      // Validate each item
      importedQuotes.forEach(q => {
        if (!q.text || !q.category) throw new Error("Each quote must have text and category");
      });
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch (e) {
      alert("Failed to import quotes: " + e.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Notify helper for sync status
function notify(message, isError = false) {
  syncStatus.textContent = message;
  syncStatus.style.color = isError ? "red" : "blue";
  setTimeout(() => {
    syncStatus.textContent = "";
  }, 5000);
}

// Sync with mock server and resolve conflicts
async function syncWithServer() {
  notify("Syncing with server...");
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const serverData = await response.json();

    // Convert server data into quote format (use first 10 posts)
    const serverQuotes = serverData.slice(0, 10).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Map local quotes by text for quick lookup
    const localMap = new Map(quotes.map(q => [q.text, q]));

    // Detect conflicts where same text but different categories
    const conflicts = [];

    serverQuotes.forEach(sq => {
      const localQ = localMap.get(sq.text);
      if (localQ && localQ.category !== sq.category) {
        conflicts.push({ text: sq.text, localCategory: localQ.category, serverCategory: sq.category });
      }
      // Server data takes precedence
      localMap.set(sq.text, sq);
    });

    // Update quotes array with merged data
    quotes = Array.from(localMap.values());
    saveQuotes();
    populateCategories();
    filterQuotes();

    notify(`Sync complete. ${conflicts.length} conflict(s) resolved.`);
    if (conflicts.length > 0) {
      console.table(conflicts);
      // Optionally, show conflict details to user in UI or alert
      // alert(`Conflicts resolved for ${conflicts.length} quotes. See console for details.`);
    }
  } catch (error) {
    console.error(error);
    notify("Failed to sync with server.", true);
  }
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
document.getElementById("syncBtn").addEventListener("click", syncWithServer);
categoryFilter.addEventListener("change", filterQuotes);

// Initial setup
loadQuotes();
populateCategories();
filterQuotes();

// Optional: Periodic automatic sync every 5 minutes
setInterval(syncWithServer, 300000);
