const User = require('./models/User');
const Attendance = require('./models/Attendance');

const EMPLOYEE_COUNT = 10;
const departments = ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
const firstNames = [
  'Arjun', 'Nisha', 'Ravi', 'Priya', 'Aman', 'Divya', 'Rohit', 'Sneha',
  'Karan', 'Meera', 'Aditya', 'Pooja', 'Varun', 'Neha', 'Sanjay', 'Asha'
];
const lastNames = [
  'Reddy', 'Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Iyer',
  'Nair', 'Jain', 'Das', 'Rao', 'Mishra', 'Pillai', 'Bose', 'Kapoor'
];

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const createRandomEmployees = () => {
  const employees = [];
  const usedEmails = new Set();

  while (employees.length < EMPLOYEE_COUNT) {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@company.com`;

    if (usedEmails.has(email)) continue;
    usedEmails.add(email);

    employees.push({
      name,
      email,
      password: 'password123',
      role: 'employee',
      employeeId: `EMP${String(employees.length + 2).padStart(3, '0')}`,
      department: pick(departments)
    });
  }

  return employees;
};

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    const usersData = [
      {
        name: 'Kishorereddy',
        email: 'kishorereddy@company.com',
        password: '062004',
        role: 'manager',
        employeeId: 'EMP001',
        department: 'Management'
      }
    ];
    usersData.push(...createRandomEmployees());

    // Create users one by one so pre-save hook hashes password correctly
    const users = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Generate attendance records for the last 30 days
    const employees = users.filter(u => u.role === 'employee');
    const attendanceRecords = [];

    for (const emp of employees) {
      for (let i = 30; i >= 1; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const dateStr = date.toISOString().split('T')[0];

        // Randomly decide if present (85% chance), late (10%), absent (5%)
        const rand = Math.random();
        if (rand < 0.05) continue; // Absent - skip record

        let checkInHour, checkInMin, status;
        if (rand < 0.15) {
          // Late arrival (9:31 - 10:30)
          checkInHour = 9 + Math.floor(Math.random() * 2);
          checkInMin = checkInHour === 9 ? 31 + Math.floor(Math.random() * 29) : Math.floor(Math.random() * 30);
          status = 'late';
        } else {
          // On time (8:00 - 9:30)
          checkInHour = 8 + Math.floor(Math.random() * 2);
          checkInMin = checkInHour === 9 ? Math.floor(Math.random() * 31) : Math.floor(Math.random() * 60);
          status = 'present';
        }

        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMin, 0, 0);

        // Check out between 5 PM and 7 PM
        const checkOutHour = 17 + Math.floor(Math.random() * 3);
        const checkOutMin = Math.floor(Math.random() * 60);
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMin, 0, 0);

        const totalHours = parseFloat(((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2));

        // Half-day if worked less than 4 hours (5% chance)
        if (Math.random() < 0.05) {
          checkOut.setHours(12, Math.floor(Math.random() * 60), 0, 0);
          const halfDayHours = parseFloat(((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2));
          attendanceRecords.push({
            userId: emp._id,
            date: dateStr,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status: 'half-day',
            totalHours: halfDayHours
          });
        } else {
          attendanceRecords.push({
            userId: emp._id,
            date: dateStr,
            checkInTime: checkIn,
            checkOutTime: checkOut,
            status,
            totalHours
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records`);

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nLogin Credentials:');
    console.log('Manager: kishorereddy@company.com / 062004');
    console.log('Employees: 10 random users created with password: password123');
    const sampleEmployees = usersData.filter(user => user.role === 'employee').slice(0, 3);
    sampleEmployees.forEach((employee) => {
      console.log(`Employee: ${employee.email} / password123`);
    });

  } catch (error) {
    console.error('Seed Error:', error);
    throw error;
  }
};

module.exports = { seedDatabase };

// Run standalone if called directly
if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config();
  const mongoose = require('mongoose');

  const run = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-system');
      console.log('MongoDB connected');
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      console.error('Failed to seed:', err.message);
      process.exit(1);
    }
  };
  run();
}
