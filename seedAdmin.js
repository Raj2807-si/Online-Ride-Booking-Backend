const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust path as needed
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking');
        
        const existingAdmin = await User.findOne({ email: 'admin@test.com' });
        if (existingAdmin) {
            console.log('Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        const admin = new User({
            fullname: { firstname: 'System', lastname: 'Admin' },
            email: 'admin@test.com',
            password: hashedPassword,
            role: 'admin',
            walletBalance: 0
        });

        await admin.save();
        console.log('Admin created successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
};

createAdmin();
