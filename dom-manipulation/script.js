// Array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "You miss 100% of the shots you don't take.", category: "Inspiration" }
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const quoteTextInput = document.getElementById('newQuoteText');
const quoteCategoryInput = document.getElementById('newQuoteCategory');

// Show a random quote without using innerHTML
function showRandomQuote() {
  // Clear previous content
  quoteDisplay.textContent = '';

  if (quotes.length === 0) {
    const noQuote = document.createElement('p');
    noQuote.textContent = "No quotes available. Add one below!";
    quoteDisplay.appendChild(noQuote);
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteParagraph = document.createElement('p');
  const strongCategory = document.createElement('strong');
  strongCategory.textContent = quote.category + ": ";
  quoteParagraph.appendChild(strongCategory);
  quoteParagraph.append(`"${quote.text}"`);

  quoteDisplay.appendChild(quoteParagraph);
}

// Add a new quote (no innerHTML needed here either)
function addQuote() {
  const newText = quoteTextInput.value.trim();
  const newCategory = quoteCategoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote text and category.");
    return;
  }

  // Add the new quote
  quotes.push({ text: newText, category: newCategory });

  // Clear input fields
  quoteTextInput.value = "";
  quoteCategoryInput.value = "";

  alert("Quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
addQuoteBtn.addEventListener('click', addQuote);
