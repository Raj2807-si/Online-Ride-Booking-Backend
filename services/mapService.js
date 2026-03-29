const axios = require('axios');

/**
 * Calculates current fare based on distance (km) and time (minutes).
 */
const getFare = async (distanceKm, durationMs) => {
    if (distanceKm === undefined || durationMs === undefined) {
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
 * Geocodes an address string to coordinates using Nominatim.
 */
const geocodeAddress = async (address) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'Tripzo-Ride-Booking-App' }
        });
        if (response.data && response.data.length > 0) {
            return {
                lat: parseFloat(response.data[0].lat),
                lng: parseFloat(response.data[0].lon)
            };
        }
        throw new Error('Address not found');
    } catch (err) {
        console.error('Geocoding error:', err.message);
        throw err;
    }
}

/**
 * Gets distance and duration using OSRM (Open Source Routing Machine) API.
 * Accepts either coordinate objects {lat, lng} or address strings.
 */
const getDistanceTime = async (origin, destination) => {
    let startCoords = origin;
    let endCoords = destination;

    // Geocode if strings are provided
    if (typeof origin === 'string') startCoords = await geocodeAddress(origin);
    if (typeof destination === 'string') endCoords = await geocodeAddress(destination);

    if (!startCoords || !endCoords) {
        throw new Error('Origin and destination coordinates are required');
    }

    const url = `http://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=false`;

    try {
        const response = await axios.get(url);
        if (response.data.code === 'Ok' && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            return {
                distance: { text: `${(route.distance / 1000).toFixed(1)} km`, value: route.distance },
                duration: { text: `${Math.round(route.duration / 60)} mins`, value: Math.round(route.duration) }
            };
        } else {
            throw new Error('No route found between coordinates');
        }
    } catch (err) {
        console.error('OSRM error:', err.message);
        // Fallback to mock data if OSRM is down
        return {
            distance: { text: "5.0 km", value: 5000 },
            duration: { text: "12 mins", value: 720 }
        };
    }
};

module.exports = {
    getFare,
    getDistanceTime
};
