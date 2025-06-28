<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dynamic Quote Generator</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Dynamic Quote Generator</h1>

  <!-- Category filter dropdown -->
  <label for="categoryFilter">Filter by Category: </label>
  <select id="categoryFilter" onchange="filterQuotes()">
    <option value="all">All Categories</option>
    <!-- Categories will be dynamically populated here -->
  </select>

  <div id="quoteDisplay">Loading...</div>

  <button id="newQuote">Show New Quote</button>

  <div id="addQuoteSection"></div>

  <script src="script.js"></script>
</body>
</html>
