const API_URL = 'https://dummyjson.com/quotes?limit=0';

let quotes = JSON.parse(localStorage.getItem('quotes')) || [];
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteSection = document.getElementById('addQuoteSection');
const notification = document.getElementById('notification');

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

async function fetchServerQuotes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data.quotes.map(q => ({ text: q.quote, category: q.author }));
  } catch (e) { console.error('Fetch error', e); return []; }
}

async function initialSync() {
  const serverQuotes = await fetchServerQuotes();
  if (serverQuotes.length === 0) return;
  const merged = [...serverQuotes];
  quotes.forEach(local => {
    if (!merged.some(s => s.text === local.text)) merged.push(local);
  });
  if (JSON.stringify(merged) !== JSON.stringify(quotes)) {
    quotes = merged;
    saveQuotes();
    showNotification('Initial sync completed');
  }
  populateCategories();
  filterQuotes();
}

async function periodicSync() {
  const serverQuotes = await fetchServerQuotes();
  let updated = false;
  serverQuotes.forEach(s => {
    const i = quotes.findIndex(q => q.text === s.text);
    if (i >= 0) {
      if (JSON.stringify(quotes[i]) !== JSON.stringify(s)) {
        quotes[i] = s;
        updated = true;
      }
    } else {
      quotes.push(s);
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

function showNotification(msg) {
  notification.textContent = msg;
  notification.classList.remove('hidden');
  setTimeout(() => notification.classList.add('hidden'), 3000);
}

// --- UI and existing functions below (populateCategories, filterQuotes, createAddQuoteForm, addQuote, displayRandomQuote)...

newQuoteBtn.addEventListener('click', displayRandomQuote);

// Initialize
populateCategories();
createAddQuoteForm();
initialSync();

// Run periodic sync every minute
setInterval(periodicSync, 60000);
