const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const user = await User.findOneAndUpdate(
            { email: 'tester@example.com' }, 
            { walletBalance: 20000 },
            { new: true }
        );
        if (user) {
            console.log(`Success: Balance for ${user.email} is now ₹${user.walletBalance}`);
        } else {
            console.error('User not found');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
