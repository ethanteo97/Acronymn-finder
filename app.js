const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require("mongodb");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri,{ useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db("cluster0").collection("acronymDB"); // Replace with your collection name
  } catch (err) {
    console.error("Error:", err);
  }
}

app.use(bodyParser.json());

app.use(async (req, res, next) => {
  req.acronymCollection = await connect();
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to fetch suggestions
app.get("/suggestions", async (req, res) => {
    try {
      const { text } = req.query;
      const filteredAcronyms = await req.acronymCollection.find({
        acronym: { $regex: `^${text}`, $options: 'i' }
      }).toArray();
      
      const suggestions = filteredAcronyms.map(acronym => ({
        acronym: acronym.acronym,
        meaning: acronym.meaning 
      }));
  
      res.json(suggestions);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("An error occurred while fetching suggestions.");
    }
});

// Endpoint to add new acronym
app.post("/addAcronym", async (req, res) => {
  try {
    const { newAcronym, newMeaning } = req.body;
    if (!newAcronym || !newMeaning) {
      return res.status(400).send("Please provide both acronym and meaning.");
    }

    await req.acronymCollection.insertOne({ acronym: newAcronym.toUpperCase(), meaning: newMeaning });
    res.status(200).send("Acronym added successfully!");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while adding the acronym.");
  }
});

// Endpoint to fetch multiple meanings for an acronym
app.get("/meanings", async (req, res) => {
  try {
    const { acronym } = req.query;
    const meanings = await req.acronymCollection.find({ acronym: acronym.toUpperCase() }).toArray();

    if (meanings.length === 0) {
      res.json([]); // Return an empty array if no meanings are found
    } else {
      const meaningsList = meanings.map(item => item.meaning);
      res.json(meaningsList);
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while fetching meanings.");
  }
});

// Route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
