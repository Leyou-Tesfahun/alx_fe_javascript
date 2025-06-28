// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Life" },
  { text: "You only live once, but if you do it right, once is enough.", category: "Life" },
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteSection = document.getElementById('addQuoteSection');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function getUniqueCategories() {
  const categories = new Set();
  quotes.forEach(q => categories.add(q.category));
  return Array.from(categories);
}

function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = getUniqueCategories();

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore saved filter or default to 'all'
  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory && (savedCategory === 'all' || categories.includes(savedCategory))) {
    categoryFilter.value = savedCategory;
  } else {
    categoryFilter.value = 'all';
  }
}

// Display quote and save it in sessionStorage (last viewed quote)
function displayQuote(quote) {
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Filter quotes by category, display random filtered quote
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);

  let filteredQuotes;
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = 'No quotes available for this category.';
    sessionStorage.removeItem('lastViewedQuote');
    return;
  }

  // Show random quote from filtered list
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  displayQuote(filteredQuotes[randomIndex]);
}

function displayRandomQuote() {
  filterQuotes();
}

function createAddQuoteForm() {
  const form = document.createElement('div');

  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';

  addBtn.addEventListener('click', () => {
    addQuote(quoteInput.value.trim(), categoryInput.value.trim());
  });

  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);

  addQuoteSection.appendChild(form);
}

function addQuote(text, category) {
  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  alert('Quote added successfully!');

  populateCategories();

  categoryFilter.value = category;
  localStorage.setItem('selectedCategory', category);

  displayRandomQuote();
}

// Export quotes as JSON file
function exportToJsonFile() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
}

// Import quotes from JSON file input
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.onload = function(evt) {
    try {
      const importedQuotes = JSON.parse(evt.target.result);

      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format: expected an array of quotes.');
        return;
      }

      // Filter out invalid entries and avoid duplicates (simple check)
      let addedCount = 0;
      importedQuotes.forEach(q => {
        if (q.text && q.category && !quotes.some(existing => existing.text === q.text && existing.category === q.category)) {
          quotes.push({ text: q.text, category: q.category });
          addedCount++;
        }
      });

      if (addedCount > 0) {
        saveQuotes();
        populateCategories();
        displayRandomQuote();
        alert(`Imported ${addedCount} new quote(s) successfully!`);
      } else {
        alert('No new quotes were imported (duplicates or invalid data).');
      }
    } catch (err) {
      alert('Failed to parse JSON: ' + err.message);
    }
  };

  fileReader.readAsText(file);

  // Reset file input so same file can be re-imported if needed
  event.target.value = '';
}

// Load last viewed quote from sessionStorage or show a random one
function loadLastViewedQuoteOrRandom() {
  const lastQuoteStr = sessionStorage.getItem('lastViewedQuote');
  if (lastQuoteStr) {
    try {
      const lastQuote = JSON.parse(lastQuoteStr);
      if (lastQuote && lastQuote.text && lastQuote.category) {
        displayQuote(lastQuote);
        return;
      }
    } catch {}
  }
  displayRandomQuote();
}

// Event Listeners
newQuoteBtn.addEventListener('click', displayRandomQuote);
exportBtn.addEventListener('click', exportToJsonFile);
importFile.addEventListener('change', importFromJsonFile);

// Initial setup
populateCategories();
loadLastViewedQuoteOrRandom();
createAddQuoteForm();
