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

// Save quotes array to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Get unique categories from quotes array
function getUniqueCategories() {
  const categories = new Set();
  quotes.forEach(q => categories.add(q.category));
  return Array.from(categories);
}

// Populate categories dropdown dynamically
function populateCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = getUniqueCategories();

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem('selectedCategory');
  if (savedCategory && (savedCategory === "all" || categories.includes(savedCategory))) {
    categoryFilter.value = savedCategory;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes and display a random one based on selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem('selectedCategory', selectedCategory);

  let filteredQuotes;
  if (selectedCategory === "all") {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
}

// Display random quote according to filter
function displayRandomQuote() {
  filterQuotes();
}

// Create the add quote form dynamically
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

// Add new quote and update categories and storage
function addQuote(text, category) {
  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  alert("Quote added successfully!");

  populateCategories();

  categoryFilter.value = category;
  localStorage.setItem('selectedCategory', category);

  displayRandomQuote();
}

newQuoteBtn.addEventListener('click', displayRandomQuote);

// Initial setup
populateCategories();
displayRandomQuote();
createAddQuoteForm();
