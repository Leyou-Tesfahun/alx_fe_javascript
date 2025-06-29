const API_URL = 'https://dummyjson.com/quotes?limit=100';
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const notification = document.getElementById('notification');

// ✅ REQUIRED: fetchQuotesFromServer function
function fetchQuotesFromServer() {
  return fetch(API_URL)
    .then(response => response.json())
    .then(data => data.quotes.map(q => ({
      text: q.quote,
      category: q.author
    })))
    .catch(error => {
      console.error('Error fetching from server:', error);
      return [];
    });
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show notification banner
function showNotification(message) {
  notification.textContent = message;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Initial sync: merge server and local quotes
async function initialSync() {
  const serverQuotes = await fetchQuotesFromServer();
  const merged = [...serverQuotes];

  quotes.forEach(localQuote => {
    if (!merged.some(q => q.text === localQuote.text)) {
      merged.push(localQuote);
    }
  });

  quotes = merged;
  saveQuotes();
  populateCategories();
  filterQuotes();
  showNotification('Initial sync complete');
}

// Periodic sync
async function periodicSync() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const index = quotes.findIndex(q => q.text === serverQuote.text);
    if (index >= 0) {
      if (JSON.stringify(quotes[index]) !== JSON.stringify(serverQuote)) {
        quotes[index] = serverQuote; // server wins
        updated = true;
      }
    } else {
      quotes.push(serverQuote);
      updated = true;
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    showNotification('Quotes updated from server');
  }
}

// Populate category dropdown
function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter && categories.includes(savedFilter)) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('selectedCategory', selected);

  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes available for this category.';
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;
}

// Add quote
function addQuote(text, category) {
  if (!text || !category) {
    alert('Both fields are required.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  categoryFilter.value = category;
  filterQuotes();
  showNotification('Quote added!');
}

// Display random quote (from selected category)
function displayRandomQuote() {
  filterQuotes();
}

// Add quote input form
function createAddQuoteForm() {
  const inputQuote = document.createElement('input');
  inputQuote.type = 'text';
  inputQuote.id = 'newQuoteText';
  inputQuote.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.type = 'text';
  inputCategory.id = 'newQuoteCategory';
  inputCategory.placeholder = 'Enter category';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.onclick = () => {
    const text = inputQuote.value.trim();
    const cat = inputCategory.value.trim();
    addQuote(text, cat);
    inputQuote.value = '';
    inputCategory.value = '';
  };

  addQuoteSection.appendChild(inputQuote);
  addQuoteSection.appendChild(inputCategory);
  addQuoteSection.appendChild(addBtn);
}

// Export quotes to JSON
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification('Quotes imported!');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Setup import/export UI
function setupImportExport() {
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.accept = '.json';
  importInput.addEventListener('change', importFromJsonFile);

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export Quotes';
  exportBtn.onclick = exportToJson;

  addQuoteSection.appendChild(document.createElement('br'));
  addQuoteSection.appendChild(importInput);
  addQuoteSection.appendChild(exportBtn);
}

// Initial setup
newQuoteBtn.addEventListener('click', displayRandomQuote);

populateCategories();
createAddQuoteForm();
setupImportExport();
filterQuotes();
initialSync();
setInterval(periodicSync, 60000); // sync every 60 seconds
