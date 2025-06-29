let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const notification = document.getElementById('notification');

// ✅ REQUIRED MOCK API
function fetchQuotesFromServer() {
  return fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then(data => {
      return data.map(post => ({
        text: post.body,
        category: `User ${post.userId}`
      }));
    })
    .catch(error => {
      console.error('Error fetching from server:', error);
      return [];
    });
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show notification
function showNotification(message) {
  notification.textContent = message;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}

// Initial sync: merge local + server
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

// Periodic sync: server takes precedence
async function periodicSync() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    const index = quotes.findIndex(q => q.text === serverQuote.text);
    if (index >= 0) {
      if (JSON.stringify(quotes[index]) !== JSON.stringify(serverQuote)) {
        quotes[index] = serverQuote;
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

// Populate filter dropdown
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

// Filter and display a quote
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem('selectedCategory', selected);

  const filtered = selected === 'all'
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes in this category.';
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;
}

// Add new quote
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

// Display random quote
function displayRandomQuote() {
  filterQuotes();
}

// Add quote form
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

// Export to JSON
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import from JSON
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

// Setup import/export buttons
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

// 🔁 Initialize everything
newQuoteBtn.addEventListener('click', displayRandomQuote);

populateCategories();
createAddQuoteForm();
setupImportExport();
filterQuotes();
initialSync();
setInterval(periodicSync, 60000); // every 60 seconds
