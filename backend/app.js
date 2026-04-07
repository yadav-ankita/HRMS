require('dotenv').config()
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const express = require('express');
const app = express();

// Configure CORS for production and development
const corsOptions = {
  origin: [
    'https://hrms-system-seven.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://hrms-system-management.vercel.app',
    'https://hrms-taupe-omega.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const connectDb = require('./db/connect');

// Routers
const authRoute = require('./route/auth');
const attendanceRoute = require('./route/attendance');
const employeeRoute = require('./route/employee');
const leaveRoute = require('./route/leave');

// Error Handlers
const notFound = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/errorHandler');
const { authenticationMiddleware } = require('./middleware/authMiddleware');

// ✅ CORS — only once, with correct wildcard syntax for Express 5
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions));

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Your HR management backend is running');
});

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/employee', authenticationMiddleware, employeeRoute);
app.use('/api/v1/attendance', authenticationMiddleware, attendanceRoute);
app.use('/api/v1/leave', authenticationMiddleware, leaveRoute);

app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const url = process.env.MONGO_URI;

const start = async () => {
  try {
    await connectDb(url);
    app.listen(port, () => {
      console.log(`app is listening on port ${port}`);
    });
  } catch (error) {
    console.log('error in app.js', error);
  }
};

start();