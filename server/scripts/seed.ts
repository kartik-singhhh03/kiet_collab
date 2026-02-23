import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seeds = [
  {
    name: 'Aman Kumar',   email: 'aman@kiet.edu',  password: 'password123',
    skills: ['react', 'node', 'typescript'], interests: ['web dev', 'hackathons'],
    role: 'student' as const, availability_status: 'available' as const,
    branch: 'CSE', passout_year: new Date().getFullYear() + 2, gender: 'male' as const,
  },
  {
    name: 'Priya Sharma', email: 'priya@kiet.edu', password: 'password123',
    skills: ['ui', 'mongodb', 'figma'],      interests: ['design', 'ML'],
    role: 'student' as const, availability_status: 'busy' as const,
    branch: 'CSE(AIML)', passout_year: new Date().getFullYear() + 3, gender: 'female' as const,
  },
  {
    name: 'Judge User',   email: 'judge@kiet.edu', password: 'password123',
    skills: ['evaluation', 'mentoring'],     interests: ['startups'],
    role: 'judge' as const,   availability_status: 'available' as const,
    branch: 'Other', passout_year: new Date().getFullYear(), gender: 'prefer_not_to_say' as const,
  },
  {
    name: 'Admin User',   email: 'admin@kiet.edu', password: 'password123',
    skills: ['admin'],                       interests: [],
    role: 'admin' as const,   availability_status: 'available' as const,
    branch: 'Other', passout_year: new Date().getFullYear(), gender: 'prefer_not_to_say' as const,
  },
];

async function run() {
  const uri = process.env.MONGO_URI ?? 'mongodb://localhost:27017/kiet-collab';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  for (const s of seeds) {
    const existing = await User.findOne({ email: s.email }).select('+password');
    if (existing) {
      Object.assign(existing, s);
      await existing.save();
      console.log(`Updated: ${s.email}`);
    } else {
      await User.create(s);
      console.log(`Created: ${s.email}`);
    }
  }

  await mongoose.connection.close();
  console.log('✅  Seed complete');
}

run().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
