const mongoose = require("mongoose");
const Country = require("../models/country.model");
const { default: countries } = require("./data/Countries");
require("dotenv").config();

async function seedDatabase() {
    const uri = process.env.MONGO_URI;
        mongoose.connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
});

    try {
        for (const country of countries) {
            await Country.updateOne(
                { code: country.code }, // Find existing country by `code`
                { $setOnInsert: country }, // Only set if inserting
                { upsert: true } // Insert if not exists
            );
        }

        console.log("Seeding completed without duplicates.");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();