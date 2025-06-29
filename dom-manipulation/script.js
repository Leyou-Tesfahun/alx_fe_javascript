// Load from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Life" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const addQuoteSection = document.getElementById("addQuoteSection");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Get unique categories
function getUniqueCategories() {
  return [...new Set(quotes.map(q => q.category))];
}

// Populate the category dropdown
function populateCategories() {
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  getUniqueCategories().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore selected category
  const lastCategory = localStorage.getItem("selectedCategory");
  if (lastCategory && getUniqueCategories().includes(lastCategory)) {
    categoryFilter.value = lastCategory;
  } else {
    categoryFilter.value = "all";
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);

  let filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.textContent = `"${randomQuote.text}" — [${randomQuote.category}]`;
}

// Add new quote
function addQuote(text, category) {
  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();

  populateCategories();
  categoryFilter.value = category;
  localStorage.setItem("selectedCategory", category);
  filterQuotes();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully.");
}

// Display random quote based on filter
function displayRandomQuote() {
  filterQuotes();
}

// Create form to add new quote
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", () => {
    const quote = quoteInput.value.trim();
    const category = categoryInput.value.trim();
    addQuote(quote, category);
  });

  formDiv.appendChild(quoteInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  addQuoteSection.appendChild(formDiv);
}

// Event listeners
newQuoteBtn.addEventListener("click", displayRandomQuote);

// Initial setup
populateCategories();
createAddQuoteForm();
filterQuotes();
