const mongoose = require("mongoose");

// Access your MongoDB connection string from secrets
const mongoURI =
    "mongodb+srv://neoGStudent:Manoj2024@neog.lxvqqao.mongodb.net/MajorProject2?retryWrites=true&w=majority&appName=neoG";

const initializeDatabase = async () => {
    try {
        const connection = await mongoose.connect(mongoURI);
        if (connection) {
            console.log('Connected Successfully');
        }
    }

    catch (error) {
        console.log('Connection Failed', error)
    }
};

module.exports = { initializeDatabase };
