const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteTextInput = document.getElementById('newQuoteText');
const newQuoteCategoryInput = document.getElementById('newQuoteCategory');
const syncBtn = document.getElementById('syncBtn');
const syncStatus = document.getElementById('syncStatus');

const LOCAL_STORAGE_KEY = 'dynamicQuotes';

// Load quotes from localStorage or use default initial quotes
let quotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [
  { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { id: 2, text: "In the middle of difficulty lies opportunity.", category: "Motivation" },
  { id: 3, text: "Be yourself; everyone else is already taken.", category: "Humor" },
  { id: 4, text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", category: "Humor" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Please add some!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
}

// Add a new quote
function addQuote() {
  const text = newQuoteTextInput.value.trim();
  const category = newQuoteCategoryInput.value.trim();

  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  // Generate a new ID (max existing id + 1)
  const maxId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) : 0;
  const newQuoteObj = { id: maxId + 1, text, category };

  quotes.push(newQuoteObj);
  saveQuotes();

  newQuoteTextInput.value = '';
  newQuoteCategoryInput.value = '';

  quoteDisplay.textContent = `"${text}" — [${category}]`;
  syncStatus.textContent = "Quote added locally (not yet synced).";
}

// Simulated fetch from server (replace URL with your real server API)
async function fetchServerQuotes() {
  // Example: you can use a mock server or your own API here
  // For demonstration, we'll simulate with a timeout and returning some quotes
  // In a real app: return fetch('https://your-api/quotes').then(res => res.json());

  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
        { id: 2, text: "In the middle of difficulty lies opportunity.", category: "Motivation" },
        { id: 3, text: "Be yourself; everyone else is already taken.", category: "Humor" },
        // Simulated server update: a new quote added on the server
        { id: 5, text: "Life is what happens when you're busy making other plans.", category: "Life" }
      ]);
    }, 1000);
  });
}

// Sync local quotes with server quotes (server wins conflicts)
async function syncQuotes() {
  syncStatus.textContent = "Syncing with server...";
  try {
    const serverQuotes = await fetchServerQuotes();

    // Create maps by id for easy lookup
    const localMap = new Map(quotes.map(q => [q.id, q]));
    const serverMap = new Map(serverQuotes.map(q => [q.id, q]));

    // Resolve conflicts: server wins
    // New quotes from server that local doesn't have
    serverQuotes.forEach(sq => {
      if (!localMap.has(sq.id)) {
        quotes.push(sq);
      } else {
        // Conflict resolution: replace local with server version
        const localQuote = localMap.get(sq.id);
        if (localQuote.text !== sq.text || localQuote.category !== sq.category) {
          const idx = quotes.findIndex(q => q.id === sq.id);
          if (idx > -1) quotes[idx] = sq;
        }
      }
    });

    // Optionally, remove local quotes not on server? (depends on policy)
    // For now, keep local-only quotes.

    saveQuotes();
    showRandomQuote();
    syncStatus.textContent = "Sync complete! Local data updated from server.";
  } catch (error) {
    syncStatus.style.color = 'red';
    syncStatus.textContent = "Sync failed: " + error.message;
    setTimeout(() => {
      syncStatus.style.color = 'green';
      syncStatus.textContent = '';
    }, 4000);
  }
}

// Periodic sync every 60 seconds
setInterval(syncQuotes, 60000);

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
syncBtn.addEventListener('click', syncQuotes);

// Show initial random quote on load
showRandomQuote();
