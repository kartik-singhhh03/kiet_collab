require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function run() {
  const mongo = process.env.MONGODB_URI || 'mongodb://localhost:27017/kiet-collab';
  await mongoose.connect(mongo, { maxPoolSize: 10 });
  console.log('Connected to MongoDB');

  const seeds = [
    {
      name: 'Aman Kumar',
      email: 'aman@kiet.edu',
      password: 'password123',
      availability: 'available',
      skills: ['react', 'node'],
      role: 'student'
    },
    {
      name: 'Priya Sharma',
      email: 'priya@kiet.edu',
      password: 'password123',
      availability: 'busy',
      skills: ['ui', 'mongodb'],
      role: 'student'
    },
    {
      name: 'Admin User',
      email: 'admin@kiet.edu',
      password: 'password123',
      availability: 'available',
      skills: ['admin'],
      role: 'admin'
    }
  ];

  for (const s of seeds) {
    const existing = await User.findOne({ email: s.email }).select('+password');
    if (existing) {
      existing.name = s.name;
      existing.availability = s.availability;
      existing.skills = s.skills;
      // Always ensure known seed password
      existing.password = s.password; // triggers pre('save') hashing
      await existing.save();
      console.log(`Updated: ${s.email}`);
    } else {
      const u = new User(s);
      await u.save();
      console.log(`Created: ${s.email}`);
    }
  }

  await mongoose.connection.close();
  console.log('Done.');
}

run().catch(async (e) => {
  console.error(e);
  await mongoose.connection.close();
  process.exit(1);
});
