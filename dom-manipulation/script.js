const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const importFileInput = document.getElementById('importFile');
const exportBtn = document.getElementById('exportBtn');

let quotes = [];

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

function displayRandomQuote() {
  const selected = categoryFilter.value;
  const filtered = selected === 'all' ? quotes : quotes.filter(q => q.category === selected);

  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes in this category.';
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" — [${random.category}]`;

  sessionStorage.setItem('lastQuote', JSON.stringify(random));
}

function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => q.category))).sort();
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem('lastFilter');
  if (lastFilter && uniqueCategories.includes(lastFilter)) {
    categoryFilter.value = lastFilter;
  } else {
    categoryFilter.value = 'all';
  }
}

function filterQuotes() {
  localStorage.setItem('lastFilter', categoryFilter.value);
  displayRandomQuote();
}

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

function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();

  if (!text || !category) {
    alert('Please enter both quote and category.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();

  textInput.value = '';
  categoryInput.value = '';
  alert('Quote added successfully!');
}

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
      alert('Quotes imported successfully!');
    } catch (e) {
      alert('Error importing quotes: ' + e.message);
    }
  };
  if (event.target.files[0]) {
    fileReader.readAsText(event.target.files[0]);
  }
}

function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
  alert('Quotes exported successfully!');
}

async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await res.json();
    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    }));

    let updated = false;
    serverQuotes.forEach(sq => {
      const localIndex = quotes.findIndex(q => q.text === sq.text);
      if (localIndex === -1) {
        quotes.push(sq);
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert('Quotes synchronized with server!');
    }
  } catch (e) {
    alert('Error fetching from server: ' + e.message);
  }
}

async function syncQuotes() {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotes)
    });
    alert('Quotes synced with server!');
  } catch (e) {
    alert('Error posting to server: ' + e.message);
  }
}

function init() {
  loadQuotes();
  populateCategories();
  createAddQuoteForm();
  displayRandomQuote();

  categoryFilter.addEventListener('change', filterQuotes);
  newQuoteBtn.addEventListener('click', displayRandomQuote);
  importFileInput.addEventListener('change', importFromJsonFile);
  exportBtn.addEventListener('click', exportQuotes);

  setInterval(fetchQuotesFromServer, 60000);
  setInterval(syncQuotes, 120000);
}

init();

