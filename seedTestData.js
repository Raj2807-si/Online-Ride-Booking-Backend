const mongoose = require('mongoose');
const User = require('./models/User');
const Driver = require('./models/Driver');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const seedTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking');
        
        // 1. Seed Rider
        const existingRider = await User.findOne({ email: 'rider@test.com' });
        const hashedRiderPassword = await bcrypt.hash('rider123', 10);
        if (!existingRider) {
            const rider = new User({
                fullname: { firstname: 'John', lastname: 'Rider' },
                email: 'rider@test.com',
                password: hashedRiderPassword,
                role: 'user',
                walletBalance: 500
            });
            await rider.save();
            console.log('Rider created successfully: rider@test.com / rider123');
        } else {
            existingRider.password = hashedRiderPassword;
            existingRider.walletBalance = 500;
            await existingRider.save();
            console.log('Rider already exists, password and wallet updated to 500');
        }

        // 2. Seed Driver (Captain)
        const existingDriver = await Driver.findOne({ email: 'driver@test.com' });
        const hashedDriverPassword = await bcrypt.hash('driver123', 10);
        if (!existingDriver) {
            const driver = new Driver({
                fullname: { firstname: 'Dave', lastname: 'Captain' },
                email: 'driver@test.com',
                password: hashedDriverPassword,
                status: 'inactive',
                isVerified: true,
                vehicle: {
                    color: 'Black',
                    plate: 'DL01-AB-1234',
                    capacity: 4,
                    vehicleType: 'car'
                },
                walletBalance: 0
            });
            await driver.save();
            console.log('Driver created successfully: driver@test.com / driver123');
        } else {
            existingDriver.password = hashedDriverPassword;
            existingDriver.isVerified = true;
            existingDriver.walletBalance = 0;
            await existingDriver.save();
            console.log('Driver already exists, password, verification and wallet reset');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error seeding test data:', err);
        process.exit(1);
    }
};

seedTestData();
