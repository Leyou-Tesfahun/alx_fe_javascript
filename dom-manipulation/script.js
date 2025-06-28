// Array of quote objects
const quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Get busy living or get busy dying.", category: "Life" },
  { text: "You only live once, but if you do it right, once is enough.", category: "Life" },
];

// Select DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteSection = document.getElementById('addQuoteSection');

// Function to display a random quote from the quotes array
function displayRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add some!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — [${quote.category}]`;
}

// Function to create and insert the form to add new quotes
function createAddQuoteForm() {
  // Create form container
  const form = document.createElement('div');

  // Quote text input
  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';

  // Category input
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';

  // Add Quote button
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';

  // Add click event to button to add the quote
  addBtn.addEventListener('click', () => {
    addQuote(quoteInput.value.trim(), categoryInput.value.trim());
  });

  // Append inputs and button to form container
  form.appendChild(quoteInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);

  // Append form container to the addQuoteSection div
  addQuoteSection.appendChild(form);
}

// Function to add a new quote to the array and update the UI
function addQuote(text, category) {
  if (!text || !category) {
    alert("Please enter both quote text and category.");
    return;
  }
  // Add new quote object to quotes array
  quotes.push({ text, category });

  // Clear inputs
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  alert("Quote added successfully!");

  // Show the newly added quote immediately
  displayRandomQuote();
}

// Event listener for Show New Quote button
newQuoteBtn.addEventListener('click', displayRandomQuote);

// Initialize: show first quote and create the add quote form
displayRandomQuote();
createAddQuoteForm();
