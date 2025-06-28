// Array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "You miss 100% of the shots you don't take.", category: "Inspiration" }
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// Function to show a random quote
function showRandomQuote() {
  // Clear previous quote
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

// Function to dynamically create the quote input form
function createAddQuoteForm() {
  const formContainer = document.getElementById('quoteFormContainer');

  const quoteInput = document.createElement('input');
  quoteInput.type = 'text';
  quoteInput.id = 'newQuoteText';
  quoteInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.id = 'newQuoteCategory';
  categoryInput.placeholder = 'Enter quote category';

  const addButton = document.createElement('button');
  addButton.id = 'addQuoteBtn';
  addButton.textContent = 'Add Quote';

  addButton.addEventListener('click', addQuote);

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Function to add a new quote
function addQuote() {
  const newText = document.getElementById('newQuoteText').value.trim();
  const newCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please fill in both the quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });

  // Clear inputs
  document.getElementById('newQuoteText').value = "";
  document.getElementById('newQuoteCategory').value = "";

  alert("Quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);
createAddQuoteForm(); // Render the form dynamically on page load
