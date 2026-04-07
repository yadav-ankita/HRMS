require('dotenv').config()
const cors = require('cors');

const rateLimiter = require('express-rate-limit');

const express=require('express');
const app=express();
// Configure CORS for production and development
const corsOptions = {
  origin: [
    'https://hrms-system-seven.vercel.app',  // Production frontend
    'http://localhost:5173',                  // Local development (Vite default)
    'http://localhost:3000',
    'https://hrms-system-management.vercel.app',
    'https://hrms-taupe-omega.vercel.app'                 // Alternative local port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
const connectDb = require('./db/connect');

//routers
const authRoute=require('./route/auth')
const attendanceRoute=require('./route/attendance')
const employeeRoute=require('./route/employee')
 const leaveRoute=require('./route/leave')

//error Handler
const notFound = require('./middleware/notFound')
const errorHandlerMiddleware = require('./middleware/errorHandler');
const { authenticationMiddleware } = require('./middleware/authMiddleware');
//app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions)); 

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json())


app.options('*', cors(corsOptions));
app.use(cors(corsOptions))


app.get('/',(req,res)=>{
    res.send('Your HR management backend is running');
})


app.use('/api/v1/auth',authRoute);
 app.use('/api/v1/employee',authenticationMiddleware,employeeRoute);
app.use('/api/v1/attendance',authenticationMiddleware,attendanceRoute);
app.use('/api/v1/leave',authenticationMiddleware,leaveRoute);


app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const url =  process.env.MONGO_URI
//'mongodb://localhost:27017/HRMS' ||
// process.env.MONGO_URI
const start = async () => {
  try {
    await connectDb(url)
    app.listen(port, () => {
      console.log(`app is listeing on port ${port}`)
    })

  } catch (error) {
    console.log("error in app.js", error)
  }
}
start()
