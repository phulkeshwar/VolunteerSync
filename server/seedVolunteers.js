/**
 * seedVolunteers.js
 * Generates 100 realistic dummy volunteers + 1 coordinator account
 * Includes all new fields: reputationScore, totalPoints, badges
 *
 * Run: npm run seed
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const Volunteer = require('./models/Volunteer');

// ─── DATA POOLS ───────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'Aarav', 'Aisha', 'Arjun', 'Ananya', 'Amit', 'Amrita', 'Akash', 'Aditi',
  'Bhoomi', 'Bhavesh', 'Chetan', 'Chandani', 'Devika', 'Dhruv', 'Deepak',
  'Esha', 'Farhan', 'Fatima', 'Gaurav', 'Geeta', 'Harsh', 'Hina', 'Ishan',
  'Ishita', 'Jai', 'Jyoti', 'Kabir', 'Kavya', 'Kartik', 'Komal', 'Lokesh',
  'Lavanya', 'Manav', 'Meera', 'Mohan', 'Naina', 'Nikhil', 'Nisha', 'Om',
  'Pooja', 'Priya', 'Pranav', 'Rahul', 'Riya', 'Rajesh', 'Rohit', 'Ritu',
  'Sachin', 'Sandhya', 'Sanjay', 'Sara', 'Shivam', 'Simran', 'Sneha',
  'Tanvi', 'Tarun', 'Tushar', 'Uma', 'Uday', 'Varun', 'Vaishnavi', 'Vikram',
  'Vishal', 'Yamini', 'Yash', 'Zara', 'Alex', 'Jordan', 'Casey', 'Taylor',
  'Morgan', 'Riley', 'Avery', 'Quinn', 'Robin', 'Sam', 'Jamie', 'Drew',
  'Blake', 'Cameron', 'Dakota', 'Devon', 'Evan', 'Harper', 'Jade', 'Kerry',
  'Max', 'Noel', 'Paris', 'Reed', 'Sage', 'Tatum', 'Vale', 'Xander',
  'Austin', 'Bailey', 'Charlie', 'Elliot', 'Finley', 'Hadley',
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Joshi', 'Malhotra',
  'Chopra', 'Mehta', 'Nair', 'Pillai', 'Reddy', 'Rao', 'Iyer', 'Bhat',
  'Chauhan', 'Yadav', 'Tiwari', 'Mishra', 'Pandey', 'Shah', 'Desai', 'Jain',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Young', 'Allen', 'King', 'Wright',
  'Scott', 'Torres', 'Peterson', 'Phillips', 'Campbell', 'Parker',
];

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
  'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
  'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
  'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
  'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Ranchi',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar',
  'Navi Mumbai', 'Allahabad', 'Howrah', 'Gwalior', 'Jabalpur'
];

const SKILLS_POOL = [
  'First Aid', 'Medical', 'Nursing', 'CPR', 'Paramedic',
  'Search & Rescue', 'Firefighting', 'Disaster Response',
  'Driving', 'Heavy Vehicle', 'Logistics', 'Supply Chain',
  'Translation', 'Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Gujarati',
  'Construction', 'Carpentry', 'Plumbing', 'Electrical', 'Civil Engineering',
  'Teaching', 'Counseling', 'Psychology', 'Social Work', 'Community Outreach',
  'Cooking', 'Food Distribution', 'Water Purification', 'Shelter Setup',
  'Communication', 'Leadership', 'Project Management', 'Coordination',
  'Data Analysis', 'IT Support', 'Web Development', 'GIS Mapping',
  'Photography', 'Video Production', 'Journalism', 'Public Speaking',
  'Finance', 'Accounting', 'Legal Advice', 'Policy Writing',
  'Animal Care', 'Veterinary', 'Gardening', 'Agriculture',
];

const ORGANIZATIONS = [
  'Red Cross India', 'NDRF', 'NSS', 'Doctors Without Borders',
  'Habitat for Humanity', 'CRY India', 'HelpAge India', 'SEEDS India',
  'Goonj', 'iVolunteer', 'Make A Difference', 'Youth for Seva',
  'Teach For India', 'Akshaya Patra', 'United Way', 'Care India',
  'Save The Children', 'Smile Foundation', 'Pratham', 'Independent',
];

const BIO_TEMPLATES = [
  'Experienced disaster relief volunteer with a background in emergency medicine.',
  'Community organizer with 7+ years in humanitarian operations.',
  'Former military personnel turned volunteer coordinator.',
  'Healthcare worker dedicated to reaching underserved communities.',
  'Civil engineer specializing in rapid shelter construction.',
  'Multilingual translator helping break communication barriers in crisis zones.',
  'Logistics expert ensuring supply chain efficiency during relief ops.',
  'Passionate about empowering local communities through direct action.',
  'Teacher turned relief worker, focused on child welfare in disasters.',
  'IT professional building digital tools for NGO coordination.',
  'Social worker with a deep commitment to trauma-informed care.',
  'Driver and navigator with extensive experience in difficult terrain.',
  'Nurse with critical care experience in field hospitals.',
  'Water sanitation engineer ensuring clean water access in affected zones.',
  'Food security expert with expertise in distribution network management.',
  'Certified first responder and CPR trainer with 10+ years experience.',
  'Legal professional providing pro-bono assistance to displaced communities.',
  'Financial analyst helping NGOs optimize resource allocation.',
  'Youth leader mobilizing volunteer networks across urban and rural zones.',
  'Environmental scientist working on post-disaster ecological recovery.',
];

const ALL_BADGES = [
  'First Responder',
  'Committed',
  'Veteran',
  'Elite',
  'Crisis Hero',
];

const EXPERIENCES = ['Beginner', 'Intermediate', 'Expert'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, arr.length));
}



function computeReputation(totalTasks, experience, badges) {
  const expBonus = { Beginner: 0, Intermediate: 10, Expert: 20 }[experience] || 0;
  const taskScore = Math.min(totalTasks * 2, 50);
  const badgeBonus = badges.length * 5;
  return Math.min(100, 30 + taskScore + expBonus + badgeBonus);
}

function deriveBadges(totalTasks, urgencyCompleted) {
  const badges = [];
  if (totalTasks >= 1)  badges.push('First Responder');
  if (totalTasks >= 5)  badges.push('Committed');
  if (totalTasks >= 10) badges.push('Veteran');
  if (totalTasks >= 25) badges.push('Elite');
  if (urgencyCompleted) badges.push('Crisis Hero');
  return badges;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function seedDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/volunteersync';

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // ── Clear existing volunteers (keep coordinators) ──
    const deletedCount = await Volunteer.deleteMany({ role: 'volunteer' });
    console.log(`🗑️  Removed ${deletedCount.deletedCount} existing volunteer records\n`);

    // ── Hash password once (all use same for demo) ──
    const hashedPassword = await bcrypt.hash('password123', 10);

    // ── Build 100 volunteer objects ──
    const volunteers = [];
    const usedEmails = new Set();

    for (let i = 0; i < 100; i++) {
      // Unique name + email
      let firstName, lastName, email;
      do {
        firstName = pick(FIRST_NAMES);
        lastName  = pick(LAST_NAMES);
        email     = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@volunteersync.demo`;
      } while (usedEmails.has(email));
      usedEmails.add(email);

      const city = pick(INDIAN_CITIES);
      const experience = pick(EXPERIENCES);

      // Realistic task count distribution: most have 0-15, some heroes have more
      const totalTasks = i < 10
        ? 20 + Math.floor(Math.random() * 30)  // top 10 → 20-50 tasks
        : i < 30
          ? 5 + Math.floor(Math.random() * 15)  // next 20 → 5-20 tasks
          : Math.floor(Math.random() * 5);       // rest → 0-4 tasks

      const urgencyHero = totalTasks >= 10 && Math.random() > 0.5;
      const badges      = deriveBadges(totalTasks, urgencyHero);
      const totalPoints = totalTasks * (urgencyHero ? 15 : 10);
      const reputationScore = computeReputation(totalTasks, experience, badges);

      volunteers.push({
        name:        `${firstName} ${lastName}`,
        email,
        password:    hashedPassword,
        role:        'volunteer',
        organization: Math.random() > 0.15 ? pick(ORGANIZATIONS) : '',
        bio:         pick(BIO_TEMPLATES),
        skills:      pickN(SKILLS_POOL, 2, 5),
        location: { city },
        availability:    Math.random() > 0.25,  // 75% available
        experience,
        totalTasks,
        totalPoints,
        reputationScore,
        badges,
      });
    }

    // ── Insert in bulk ──
    const result = await Volunteer.insertMany(volunteers, { ordered: false });
    console.log(`🎉 Inserted ${result.length} volunteers\n`);

    // ── Stats summary ──
    const byCity   = {};
    const byExp    = { Beginner: 0, Intermediate: 0, Expert: 0 };
    let available  = 0;
    let totalBadges = 0;

    result.forEach((v) => {
      byCity[v.location.city] = (byCity[v.location.city] || 0) + 1;
      byExp[v.experience]++;
      if (v.availability) available++;
      totalBadges += (v.badges || []).length;
    });

    console.log('📊 Summary:');
    console.log(`   Available now : ${available} / 100`);
    console.log(`   Experience    : ${byExp.Expert} Expert · ${byExp.Intermediate} Intermediate · ${byExp.Beginner} Beginner`);
    console.log(`   Badges earned : ${totalBadges} total`);
    console.log('\n📍 City distribution:');
    Object.entries(byCity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([city, count]) => console.log(`   ${city.padEnd(18)} ${count} volunteers`));

    console.log('\n🏆 Top 5 by reputation:');
    const top5 = [...result]
      .sort((a, b) => b.reputationScore - a.reputationScore)
      .slice(0, 5);
    top5.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.name.padEnd(22)} Rep:${v.reputationScore} | Tasks:${v.totalTasks} | Badges:[${(v.badges || []).join(', ')}]`);
    });

    console.log('\n🔑 Login with any volunteer:');
    console.log('   Email    : <firstname>.<lastname><1-100>@volunteersync.demo');
    console.log('   Password : password123');
    console.log('\n✨ Seeding complete!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    if (error.writeErrors) {
      error.writeErrors.slice(0, 3).forEach((e) => console.error('   Write error:', e.errmsg));
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedDatabase();
