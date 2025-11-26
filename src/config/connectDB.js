const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../logger').default;

dotenv.config();

const sanitize = (uri) => {
    try {
        const u = new URL(uri);
        if (u.password) u.password = encodeURIComponent(u.password);
        return u.toString();
    } catch {
        return uri;
    }
};

const connectDB = async () => {
    try {
        const safe = sanitize(process.env.MONGO_URI);
        const conn = await mongoose.connect(safe);
        logger.success(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        logger.info(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
