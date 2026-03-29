const axios = require('axios');

/**
 * Calculates current fare based on distance (km) and time (minutes).
 */
const getFare = async (distanceKm, durationMs) => {
    if (!distanceKm || !durationMs) {
        throw new Error('Distance and duration are required for fare calculation');
    }

    const durationMin = durationMs / 60000;

    const baseFare = {
        auto: 30,
        car: 50,
        motorcycle: 15
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        motorcycle: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        motorcycle: 1.5
    };

    const fare = {
        auto: Math.round(baseFare.auto + (distanceKm * perKmRate.auto) + (durationMin * perMinuteRate.auto)),
        car: Math.round(baseFare.car + (distanceKm * perKmRate.car) + (durationMin * perMinuteRate.car)),
        motorcycle: Math.round(baseFare.motorcycle + (distanceKm * perKmRate.motorcycle) + (durationMin * perMinuteRate.motorcycle))
    };

    return fare;
};

/**
 * Gets distance and duration using Google Distance Matrix API.
 */
const getDistanceTime = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error('Origin and destination are required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        // Return mock data for development if no API key is provided
        return {
            distance: { text: "5.2 km", value: 5200 },
            duration: { text: "15 mins", value: 900 }
        };
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            if (response.data.rows[0].elements[0].status === 'ZERO_RESULTS') {
                throw new Error('No route found between coordinates');
            }
            return response.data.rows[0].elements[0];
        } else {
            throw new Error('Unable to fetch distance and duration');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

module.exports = {
    getFare,
    getDistanceTime
};
