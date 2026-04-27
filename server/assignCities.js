const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Volunteer = require('./models/Volunteer');

dotenv.config();

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara'
];

async function assignCities() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const volunteers = await Volunteer.find();
    console.log(`Found ${volunteers.length} volunteers.`);

    let updatedCount = 0;
    for (const volunteer of volunteers) {
      if (!volunteer.location || !volunteer.location.city || volunteer.location.zone) {
        const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
        
        volunteer.location = {
          city: randomCity
        };

        await volunteer.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} volunteers with a city.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignCities();
