const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripzo');
        const users = await User.find({}, 'fullname email role walletBalance licenseNumber');
        const vehicles = await Vehicle.find({});
        console.log('---USERS_START---');
        console.log(JSON.stringify(users));
        console.log('---USERS_END---');
        console.log('---VEHICLES_START---');
        console.log(JSON.stringify(vehicles));
        console.log('---VEHICLES_END---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkData();
