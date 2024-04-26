const express = require('express');
const app = express();
app.use(express.json());
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
app.use(cors());

// MongoDB connection URL
const uri = 'mongodb+srv://heiditeng22:Arcadia123@project348.fqbqzlw.mongodb.net/?retryWrites=true&w=majority&appName=Project348';

// MongoDB database name
const dbName = 'sample_mflix';

// Connect to MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();
const db = client.db(dbName);

// Correctly identify your collections
const flightsCollection = db.collection('flights');
const airlineCollection = db.collection('airlines');

// Start the server
app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});

// Serve the HTML file
const path = require('path');
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to fetch airlines data
app.get('/airlines', async (req, res) => {
    try {
        const airlines = await airlineCollection.find({}).toArray(); // Ensure using airlineCollection
        res.json(airlines);
    } catch (error) {
        console.error('Error fetching airline data:', error);
        res.status(500).send('Error fetching airline data');
    }
});

// API endpoint to fetch flight data
app.get('/flights', async (req, res) => {
    try {
        const flights = await flightsCollection.find({}).toArray(); // Correct collection
        res.json(flights);
    } catch (error) {
        console.error('Error fetching flights data:', error);
        res.status(500).send('Error fetching flights data');
    }
});

// API endpoint to add a new flight
app.post('/flights', async (req, res) => {
    const newFlight = req.body;

    const requiredFields = ['flight_number', 'origin', 'destination', 'departure_time', 'arrival_time', 'airline_id'];
    const missingFields = requiredFields.filter(field => !newFlight[field]);

    if (missingFields.length > 0) {
        return res.status(400).send(`Missing required fields: ${missingFields.join(', ')}`);
    }

    try {
        const result = await flightsCollection.insertOne(newFlight);
        res.status(201).json(newFlight);
    } catch (error) {
        console.error('Error adding new flight:', error);
        res.status(500).send('Error adding flight');
    }
});

// API endpoint to delete a flight
app.delete('/flights/:id', async (req, res) => {
    const flightId = req.params.id;

    try {
        const result = await flightsCollection.deleteOne({ _id: new ObjectId(flightId) });

        if (result.deletedCount === 1) {
            res.status(200).send('Flight deleted successfully');
        } else {
            res.status(404).send('Flight not found');
        }
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).send('Error deleting flight');
    }
});

// API endpoint to update a flight
app.patch('/flights/:id', async (req, res) => {
    const flightId = req.params.id;

    if (!ObjectId.isValid(flightId)) {
        return res.status(400).send('Invalid flight ID');
    }

    const updatedFlight = req.body;

    try {
        const result = await flightsCollection.updateOne(
            { _id: new ObjectId(flightId) },
            { $set: updatedFlight }
        );

        if (result.matchedCount === 1) {
            res.status(200).json(updatedFlight);
        } else {
            res.status(404).send('Flight not found');
        }
    } catch (error) {
        console.error('Error updating flight:', error);
        res.status(500).send('Error updating flight');
    }
});
