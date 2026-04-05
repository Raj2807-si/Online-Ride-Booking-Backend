const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tripzo';

async function checkData() {
    try {
        await mongoose.connect(mongoURI);
        const users = await User.find({}, 'fullname email role walletBalance licenseNumber');
        const vehicles = await Vehicle.find({});
        console.log('--- USERS ---');
        console.log(JSON.stringify(users, null, 2));
        console.log('--- VEHICLES ---');
        console.log(JSON.stringify(vehicles, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
