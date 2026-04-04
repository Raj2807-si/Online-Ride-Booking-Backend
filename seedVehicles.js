const mongoose = require('mongoose');
const Vehicle = require('./models/Vehicle');
const dotenv = require('dotenv');
dotenv.config();

const vehicles = [
  {
    name: 'Tesla Model 3',
    category: 'ev',
    vehicleType: 'sedan',
    plate: 'TS-01-EV-0001',
    color: 'White',
    status: 'available',
    hourlyRate: 500,
    dailyRate: 5000,
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Royal Enfield Classic 350',
    category: 'bike',
    vehicleType: 'motorcycle',
    plate: 'RE-350-001',
    color: 'Stealth Black',
    status: 'available',
    hourlyRate: 150,
    dailyRate: 1200,
    image: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Hyundai Verna',
    category: 'car',
    vehicleType: 'sedan',
    plate: 'DL-01-VR-1234',
    color: 'Silver',
    status: 'available',
    hourlyRate: 300,
    dailyRate: 2500,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Toyota Fortuner',
    category: 'car',
    vehicleType: 'suv',
    plate: 'HR-26-FT-5678',
    color: 'Phantom Brown',
    status: 'available',
    hourlyRate: 600,
    dailyRate: 6000,
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Ola S1 Pro',
    category: 'ev',
    vehicleType: 'motorcycle',
    plate: 'OL-01-S1-9999',
    color: 'Neon Green',
    status: 'available',
    hourlyRate: 80,
    dailyRate: 700,
    image: 'https://images.unsplash.com/photo-1591438128065-2766324268e3?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'KTM Duke 390',
    category: 'bike',
    vehicleType: 'motorcycle',
    plate: 'KT-390-007',
    color: 'Orange',
    status: 'available',
    hourlyRate: 200,
    dailyRate: 1800,
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=400'
  }
];

const seedVehicles = async () => {
  try {
    const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tripzo_ride_booking';
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB for seeding vehicles...');

    // Clear existing vehicles to avoid duplicates during testing
    await Vehicle.deleteMany({ plate: { $in: vehicles.map(v => v.plate) } });
    
    await Vehicle.insertMany(vehicles);
    console.log('Vehicles seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding vehicles:', error);
    process.exit(1);
  }
};

seedVehicles();
