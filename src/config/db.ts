import mongoose from 'mongoose';
import { ENV } from './env';
import process from 'process';

const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
    } catch {
        console.error('Failed to connect to MongoDB. Check MONGO_URI in your .env file.');
        process.exit(1);
    }
};

export default connectDB;
