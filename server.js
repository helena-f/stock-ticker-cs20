const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
let collection;

async function connectToDB() {
  await client.connect();
  const db = client.db('Stock');
  collection = db.collection('PublicCompanies');
}
connectToDB();

app.use(express.static('views'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/process', async (req, res) => {
  const { searchTerm, searchType } = req.query;

  let query = {};
  if (searchType === 'name') {
    query = { name: { $regex: new RegExp(searchTerm, 'i') } };
  } else if (searchType === 'ticker') {
    query = { ticker: { $regex: new RegExp(searchTerm, 'i') } };
  }

  const results = await collection.find(query).toArray();

  console.log('Results:', results);

  // Extra credit: display results on a web page
  let html = '<h1>Search Results</h1>';
  if (results.length === 0) {
    html += '<p>No matching companies found.</p>';
  } else {
    html += '<ul>';
    results.forEach(company => {
      html += `<li>${company.name} (${company.ticker}): $${company.price}</li>`;
    });
    html += '</ul>';
  }

  res.send(html);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
