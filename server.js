const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Employee Attendance API is running',
    version: '1.0.0',
    geofence: {
      targetLat: process.env.TARGET_LAT || '37.7749',
      targetLng: process.env.TARGET_LNG || '-122.4194',
      allowedRadius: process.env.ALLOWED_RADIUS || '50',
    },
  });
});

// Seed Initial Admin User if none exists
const seedAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const defaultAdmin = new User({
        name: 'System Admin',
        email: 'admin@company.com',
        employeeId: 'ADMIN001',
        password: 'adminpassword123',
        role: 'Admin',
      });
      await defaultAdmin.save();
      console.log('\n======================================================');
      console.log(' [INITIAL SEED] Default Admin Account Created:');
      console.log('   Email / Employee ID: admin@company.com / ADMIN001');
      console.log('   Password:            adminpassword123');
      console.log('======================================================\n');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  seedAdminUser();
});
