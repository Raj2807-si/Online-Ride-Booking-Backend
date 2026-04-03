const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Driver = require('./models/Driver');
const Ride = require('./models/Ride');

async function seedHistory(email) {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking');
    console.log('Connected to MongoDB...');

    // Find the user/driver by email
    const user = await User.findOne({ email });
    const driver = await Driver.findOne({ email });

    if (!user && !driver) {
      console.error(`Could not find User or Driver with email: ${email}`);
      process.exit(1);
    }

    // Assign a secondary opposite for linkage
    let targetUser = user;
    let targetDriver = driver;

    if (user && !driver) {
        // Find any existing driver as a fallback for the history records
        targetDriver = await Driver.findOne();
        if (!targetDriver) {
            console.log('Creating a dummy driver for history records...');
            targetDriver = new Driver({
                fullname: { firstname: 'Demo', lastname: 'Captain' },
                email: 'demo_captain@tripzo.com',
                password: 'password123',
                vehicle: { color: 'Black', plate: 'TS-01-DEMO', capacity: 4, vehicleType: 'car' },
                isVerified: true,
                status: 'active'
            });
            await targetDriver.save();
        }
    } else if (driver && !user) {
        // Find any existing user as a fallback
        targetUser = await User.findOne();
        if (!targetUser) {
            console.log('Creating a dummy rider for history records...');
            targetUser = new User({
                fullname: { firstname: 'Demo', lastname: 'Rider' },
                email: 'demo_rider@tripzo.com',
                password: 'password123'
            });
            await targetUser.save();
        }
    }

    console.log(`Seeding history for: ${email}`);
    
    const locations = [
       { p: 'Ameerpet, Hyderabad, Telangana', d: 'Gachibowli, Hyderabad, Telangana', fare: 250 },
       { p: 'Banjara Hills, Hyderabad', d: 'Secunderabad Railway Station', fare: 180 },
       { p: 'Charminar, Hyderabad', d: 'Golconda Fort, Hyderabad', fare: 120 },
       { p: 'Hitech City, Hyderabad', d: 'Rajiv Gandhi International Airport', fare: 650 },
       { p: 'Inorbit Mall, Madhapur', d: 'Forum Mall, Kukatpally', fare: 210 }
    ];

    const statuses = ['completed', 'completed', 'completed', 'cancelled', 'completed'];
    const methods = ['wallet', 'cash', 'upi', 'wallet', 'wallet'];

    for (let i = 0; i < 10; i++) {
        const loc = locations[i % locations.length];
        const ride = new Ride({
            user: targetUser._id,
            captain: targetDriver._id,
            pickup: loc.p,
            destination: loc.d,
            fare: loc.fare + Math.floor(Math.random() * 50),
            status: statuses[i % statuses.length],
            otp: Math.floor(100000 + Math.random() * 900000).toString(),
            paymentStatus: statuses[i % statuses.length] === 'completed' ? 'paid' : 'pending',
            paymentMethod: methods[i % methods.length],
            createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // 1 ride per day over 10 days
        });
        await ride.save();
    }

    console.log('Successfully seeded 10 trips!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

const emailArg = process.argv[2];
if (!emailArg) {
  console.log('Usage: node seed_history.js <email>');
  process.exit(1);
}

seedHistory(emailArg);
