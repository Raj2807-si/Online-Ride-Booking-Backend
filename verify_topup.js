const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const updateRiderWallet = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking');
        const user = await User.findOneAndUpdate(
            { email: 'rider@test.com' },
            { walletBalance: 10000 },
            { new: true }
        );
        if (user) {
            console.log(`Rider wallet updated: ${user.email} balance = ₹${user.walletBalance}`);
        } else {
            console.error('Rider not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateRiderWallet();
