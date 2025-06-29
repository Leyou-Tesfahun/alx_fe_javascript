let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const notification = document.getElementById('notification');

// Fetch quotes from mock server API
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

// Post new quote to mock server API
function postQuoteToServer(quote) {
  fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Quote',
      body: quote.text,
      userId: quote.category
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Quote posted to server:', data);
  })
  .catch(error => {
    console.error('Error posting to server:', error);
  });
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show notification message
function showNotification(message) {
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 3000);
}

// Sync quotes with server data, server data takes precedence
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    let updated = false;

    serverQuotes.forEach(serverQuote => {
      const index = quotes.findIndex(q => q.text === serverQuote.text);
      if (index >= 0) {
        if (JSON.stringify(quotes[index]) !== JSON.stringify(serverQuote)) {
          quotes[index] = serverQuote; // server wins conflict
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
      showNotification('Quotes synced with server!');
    }
  } catch (error) {
    console.error('Error syncing quotes:', error);
  }
}

// Populate categories dropdown dynamically
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

// Filter quotes by selected category and display a random one
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

// Add a new quote locally and post to server
function addQuote(text, category) {
  if (!text || !category) {
    alert('Both quote and category are required.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  categoryFilter.value = category;
  filterQuotes();
  showNotification('Quote added!');

  // Post new quote to server
  postQuoteToServer(newQuote);
}

// Display a random quote based on current filter
function displayRandomQuote() {
  filterQuotes();
}

// Create form to add new quote dynamically
function createAddQuoteForm() {
  const inputQuote = document.createElement('input');
  inputQuote.type = 'text';
  inputQuote.id = 'newQuoteText';
  inputQuote.placeholder = 'Enter a new quote';

  const inputCategory = document.createElement('input');
  inputCategory.type = 'text';
  inputCategory.id = 'newQuoteCategory';
  inputCategory.placeholder = 'Enter quote category';

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

// Export quotes to JSON file
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file input
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Invalid JSON format');
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

// Setup import/export buttons and file input
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

// Initialization
newQuoteBtn.addEventListener('click', displayRandomQuote);
populateCategories();
createAddQuoteForm();
setupImportExport();
filterQuotes();
syncQuotes();
setInterval(syncQuotes, 60000); // sync every 60 seconds
