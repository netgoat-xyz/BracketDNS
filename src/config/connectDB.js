
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../logger').default;
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
    
        logger.success(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.info(`Error: ${error.message}`);
        process.exit(1);
    }
}


module.exports = connectDB;