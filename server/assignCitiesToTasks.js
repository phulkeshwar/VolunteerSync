const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Task = require('./models/Task');

dotenv.config();

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'
];

async function assignCitiesToTasks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const tasks = await Task.find({ $or: [{ city: { $exists: false } }, { city: '' }] });
    console.log(`Found ${tasks.length} tasks missing a city.`);

    let updatedCount = 0;
    for (const task of tasks) {
      // If it had a zone previously, we can use that as the city if it's a valid string
      // Otherwise, pick a random city
      if (task.zone && typeof task.zone === 'string' && task.zone.trim().length > 0) {
        task.city = task.zone;
      } else {
        const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
        task.city = randomCity;
      }
      
      await task.save();
      updatedCount++;
    }

    console.log(`Successfully updated ${updatedCount} tasks with a city.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

assignCitiesToTasks();
