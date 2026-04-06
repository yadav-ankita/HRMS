const express=require('express');
const router=express.Router();
const {
    checkIn,
    checkOut,
    getAttendanceRecords,
    getCurrentStatus,
    getTodayAttendance,
    getMyTodayAttendance,
    getMyStats,
    getWeeklyAttendance,
    getWeeklyAttendanceAdmin,
    markAttendance,
    getTodayAbsentCount
}=require('../controller/attendance');
const { authorizeRole } = require('../middleware/authMiddleware');
// Employee attendance actions
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

// Get current attendance status
router.get("/current-status", getCurrentStatus);

// Get my stats (for employee dashboard)
router.get("/my-stats", getMyStats);

// Get my today's attendance (for employee)
router.get("/my-today", getMyTodayAttendance);

// Get weekly attendance (for employee)
router.get("/my-weekly", getWeeklyAttendance);

// Get attendance records (role-based access)
//employee see all his/her attendance records, admin/HR see all records
router.get("/records", getAttendanceRecords);

// Get today's attendance for all employees (Admin/HR only)
router.get("/today", authorizeRole, getTodayAttendance);

// Get weekly attendance for all employees or specific employee (Admin/HR only)
router.get("/weekly", authorizeRole, getWeeklyAttendanceAdmin);
router.get('/today-absent', getTodayAbsentCount); // admin/HR only, add your auth middleware
// Mark attendance (Admin/HR only)
router.post("/mark", authorizeRole, markAttendance);

module.exports=router