const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });
const Vehicle = require('./models/Vehicle');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/tripzo';

async function updateImages() {
    try {
        await mongoose.connect(mongoURI);
        
        // Update Mahindra Thar
        const tharResult = await Vehicle.updateMany(
            { name: /Mahindra Thar/i },
            { $set: { image: 'https://images.unsplash.com/photo-1627042633145-b78aa8ec74cc?auto=format&fit=crop&q=80&w=800' } }
        );
        console.log('Mahindra Thar updated:', tharResult.modifiedCount);

        // Update Ola S1 Pro
        const olaResult = await Vehicle.updateMany(
            { name: /Ola S1 Pro/i },
            { $set: { image: 'https://images.unsplash.com/photo-1661605658607-4eab2697b0a8?auto=format&fit=crop&q=80&w=800' } }
        );
        console.log('Ola S1 Pro updated:', olaResult.modifiedCount);

        // Also check if any other vehicle is missing an image
        const missingImages = await Vehicle.find({ $or: [{ image: { $exists: false } }, { image: '' }, { image: null }] });
        for (const v of missingImages) {
            console.log(`Vehicle missing image: ${v.name}`);
            // Let's just put a generic placeholder for anything else missing
            v.image = `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800`;
            await v.save();
            console.log(`Assigned generic image to ${v.name}`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateImages();
