const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
const Vehicle = require('./models/Vehicle');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tripzo';

const newVehicles = [
  {
    name: 'Mahindra Thar',
    category: 'car',
    vehicleType: 'suv',
    plate: 'KA 01 TM 4455',
    hourlyRate: 250,
    dailyRate: 2500,
    address: 'Tripzo Hub, Indiranagar',
    contactNumber: '+91 9988776655',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1627042633145-b78aa8ec74cc?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Honda City',
    category: 'car',
    vehicleType: 'sedan',
    plate: 'KA 03 HC 8822',
    hourlyRate: 180,
    dailyRate: 1800,
    address: 'Tripzo Hub, Koramangala',
    contactNumber: '+91 9988776655',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Tata Nexon EV',
    category: 'ev',
    vehicleType: 'suv',
    plate: 'KA 53 EV 9011',
    hourlyRate: 200,
    dailyRate: 2200,
    address: 'Tripzo EV Station, Whitefield',
    contactNumber: '+91 9988776655',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800'
  },
  {
    name: 'Yamaha R15',
    category: 'bike',
    vehicleType: 'motorcycle',
    plate: 'KA 05 YR 1022',
    hourlyRate: 120,
    dailyRate: 1200,
    address: 'Tripzo Hub, HSR Layout',
    contactNumber: '+91 9988776655',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800'
  }
];

async function addData() {
    try {
        await mongoose.connect(mongoURI);
        
        for (const v of newVehicles) {
          const exists = await Vehicle.findOne({ plate: v.plate });
          if (!exists) {
            const added = new Vehicle(v);
            await added.save();
            console.log(`Added ${v.name}`);
          } else {
            console.log(`${v.name} already exists`);
          }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

addData();
