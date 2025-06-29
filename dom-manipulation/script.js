// Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const importFileInput = document.getElementById('importFile');
const exportBtn = document.getElementById('exportBtn');
const notification = document.getElementById('notification');

// Quotes array
let quotes = [];

// Load from localStorage or start with defaults
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "The best way to predict the future is to invent it.", category: "Inspirational" },
      { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Motivational" },
      { text: "To be, or not to be, that is the question.", category: "Philosophy" },
    ];
    saveQuotes();
  }
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote (filtered by category)
function displayRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes in this category.';
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;

  // Save last shown quote to sessionStorage
  sessionStorage.setItem('lastQuote', JSON.stringify(random));
}

// Populate category filter dropdown dynamically
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category))).sort();
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter from localStorage
  const lastFilter = localStorage.getItem('lastFilter');
  if (lastFilter && uniqueCategories.includes(lastFilter)) {
    categoryFilter.value = lastFilter;
  } else {
    categoryFilter.value = 'all';
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  localStorage.setItem('lastFilter', categoryFilter.value);
  displayRandomQuote();
}

// Add new quote form and handler
function createAddQuoteForm() {
  addQuoteSection.innerHTML = '';

  const inputText = document.createElement('input');
  inputText.type = 'text';
  inputText.placeholder = 'Enter a new quote';
  inputText.id = 'newQuoteText';

  const inputCategory = document.createElement('input');
  inputCategory.type = 'text';
  inputCategory.placeholder = 'Enter quote category';
  inputCategory.id = 'newQuoteCategory';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);

  addQuoteSection.appendChild(inputText);
  addQuoteSection.appendChild(inputCategory);
  addQuoteSection.appendChild(addBtn);
}

// Add quote to array, update UI and storage
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    showNotification('Please enter both quote and category.', true);
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = '';
  categoryInput.value = '';
  showNotification('Quote added successfully!');
}

// Show temporary notification
function showNotification(msg, isError = false) {
  notification.textContent = msg;
  notification.style.color = isError ? 'red' : 'green';
  notification.classList.add('show');
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(evt) {
    try {
      const importedQuotes = JSON.parse(evt.target.result);
      if (!Array.isArray(importedQuotes)) throw new Error('Invalid JSON format');
      importedQuotes.forEach(q => {
        if (q.text && q.category) {
          quotes.push(q);
        }
      });
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification('Quotes imported successfully!');
    } catch (e) {
      showNotification('Error importing quotes: ' + e.message, true);
    }
  };
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
}

// Export quotes to JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeOb
