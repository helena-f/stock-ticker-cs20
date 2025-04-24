const fs = require('fs');
const readline = require('readline');
const { MongoClient } = require('mongodb');

// MongoDB connection URL and Database
const uri = 'mongodb://localhost:27017';
const dbName = 'Stock';
const collectionName = 'PublicCompanies';

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const fileStream = fs.createReadStream('companies.csv');

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let isFirstLine = true; // Flag to skip the header line

    for await (const line of rl) {
      if (isFirstLine) {
        isFirstLine = false;
        continue; 
      }

      console.log(line);  

      const [name, ticker, priceStr] = line.split(',');
      const price = parseFloat(priceStr);

      if (name && ticker && !isNaN(price)) {
        const company = {
          name: name.trim(),
          ticker: ticker.trim(),
          price: price
        };

        await collection.insertOne(company);
      } else {
        console.error(`Invalid data: ${line}`);
      }
    }

    console.log('Data import complete.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

run();
