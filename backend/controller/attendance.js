require('dotenv').config()
const Attendance = require('../model/attendance');
const User = require('../model/user');
const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require('../error')

const checkIn = async (req, res, next) => {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;
    try {
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);


        // Check if already checked in today
        const existingAttendance = await Attendance.findOne({
            user_id: userId,
            company_id: companyId,
            date: { $gte: today, $lt: tomorrow },
        });

        const attendance = existingAttendance || new Attendance({
            user_id: userId,
            company_id: companyId,
            date: today,
            createdBy: userId,
        });

        attendance.checkIn = new Date();
        attendance.checkOut = null;
        attendance.status = "present";
        attendance.updatedBy = userId;
        await User.findByIdAndUpdate(userId, {
            attendance_status: "present"
        });
        await attendance.save();
        // Update user's attendance_status to present when they check in
        try {
            await User.findByIdAndUpdate(userId, { attendance_status: "present" });
        } catch (err) {
            console.error('Failed to update user attendance_status:', err.message || err);
        }
        res.status(StatusCodes.CREATED).json(
            {
                User_Attendance: attendance,
                message: "Checked in successfully"
            }
        );
    } catch (error) {
        next(error)
    }
}
const checkOut = async (req, res, next) => {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;
    try {
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Find today's attendance record
        const attendance = await Attendance.findOne({
            user_id: userId,
            company_id: companyId,
            date: { $gte: today, $lt: tomorrow },
        });
        if (!attendance || !attendance.checkIn) {
            throw new BadRequestError("You haven't checked in today!");
        }
        attendance.checkOut = new Date();
        attendance.updatedBy = userId;
        await attendance.save();
        res.status(StatusCodes.OK).json(
            {
                User_Attendance: attendance,
                message: "Checked out successfully"
            }
        );
    }
    catch (error) {
        next(error)
    }
}
// Get Today's Attendance for All Employees (Admin/HR only)
const getTodayAttendance = async (req, res, next) => {
    const companyId = req.user?.companyId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendanceRecords = await Attendance.find({
        company_id: companyId,
        date: { $gte: today, $lt: tomorrow },
    }).populate("user_id", "firstName lastName email loginId avatar");

    res
        .status(StatusCodes.OK)
        .json(
            {
                AttendanceRecords: attendanceRecords,
                message: "Today's attendance fetched successfully"
            }
        );
}
const getMyTodayAttendance = async (req, res, next) => {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const attendance = await Attendance.findOne({
        user_id: userId,
        company_id: companyId,
        date: { $gte: today, $lt: tomorrow },
    });
    if (!attendance) {
        return res.status(StatusCodes.OK).json(
            {
                Attendance: null,
                message: "No attendance record for today"
            }
        );
    }
    res.status(StatusCodes.OK).json(
        {
            Attendance: attendance,
            message: "Today's attendance fetched successfully"
        }
    );
}
//fetched all the attendance of the particular user
const getAttendanceRecords = async (req, res, next) => {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;
    let attendanceRecords;
    if (req.user?.role === "employee") {
        attendanceRecords = await Attendance.find({ user_id: userId, company_id: companyId }).sort({ date: -1 });
    }
    else {
        attendanceRecords = await Attendance.find({ company_id: companyId }).sort({ date: -1 }).populate("user_id", "firstName lastName email loginId avatar");
    }
    res.status(StatusCodes.OK).json(
        {
            AttendanceRecords: attendanceRecords,
            message: "Attendance records fetched successfully"
        }
    );
}
const getCurrentStatus = async (req, res, next) => {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const attendance = await Attendance.findOne({
        user_id: userId,
        company_id: companyId,
        date: { $gte: today, $lt: tomorrow },
    });
    if (!attendance) {
        return res.status(StatusCodes.OK).json(
            {
                status: "absent",
                message: "You are marked as absent for today"
            }
        );
    }
    res.status(StatusCodes.OK).json(
        {
            status: attendance.status,
            message: `Your current attendance status for today is: ${attendance.status}`
        }
    );
}
//getting the status count of that particular employee
const getMyStats = async (req, res, next) => {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;

    const totalDays = await Attendance.countDocuments({ user_id: userId, company_id: companyId });
    const presentDays = await Attendance.countDocuments({ user_id: userId, company_id: companyId, status: "present" });
    const absentDays = await Attendance.countDocuments({ user_id: userId, company_id: companyId, status: "absent" });
    const leaveDays = await Attendance.countDocuments({ user_id: userId, company_id: companyId, status: "leave" });
    const halfDayCount = await Attendance.countDocuments({ user_id: userId, company_id: companyId, status: "halfday" });
    res.status(StatusCodes.OK).json(
        {
            stats: {
                totalDays,
                presentDays,
                absentDays,
                leaveDays,
                halfDayCount,
            },
            message: "Your attendance stats fetched successfully"
        }
    );
}

// Get Weekly Attendance for Employee
const getWeeklyAttendance = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const companyId = req.user?.companyId;
        const { startDate, endDate } = req.query;

        let query = { user_id: userId, company_id: companyId };

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        } else {
            // Default to current week (Monday to Sunday)
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(today.setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfWeek, $lte: endOfWeek };
        }

        const attendance = await Attendance.find(query).sort({ date: 1 });

        res.status(StatusCodes.OK).json({
            AttendanceRecords: attendance,
            message: "Weekly attendance records fetched successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Get Weekly Attendance for All Employees (Admin/HR)
const getWeeklyAttendanceAdmin = async (req, res, next) => {
    try {
        const companyId = req.user?.companyId;
        const { startDate, endDate, userId } = req.query;

        let query = { company_id: companyId };

        if (userId) {
            query.user_id = userId;
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        } else {
            // Default to current week
            const today = new Date();
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1);
            const startOfWeek = new Date(today.setDate(diff));
            startOfWeek.setHours(0, 0, 0, 0);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(endOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfWeek, $lte: endOfWeek };
        }

        const attendance = await Attendance.find(query)
            .sort({ date: -1 })
            .populate("user_id", "firstName lastName email loginId avatar");

        res.status(StatusCodes.OK).json({
            AttendanceRecords: attendance,
            message: "Weekly attendance records fetched successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Mark Attendance (Admin/HR only)
const markAttendance = async (req, res, next) => {
    try {
        const { userId, date, status } = req.body;
        const companyId = req.user?.companyId;

        if (!userId || !date || !status) {
            throw new BadRequestError("userId, date, and status are required");
        }

        const validStatus = ["present", "absent", "leave", "halfday", "late"];
        if (!validStatus.includes(status)) {
            throw new BadRequestError("Invalid status value");
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        const tomorrow = new Date(attendanceDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let attendance = await Attendance.findOne({
            user_id: userId,
            company_id: companyId,
            date: { $gte: attendanceDate, $lt: tomorrow }
        });

        if (!attendance) {
            attendance = new Attendance({
                user_id: userId,
                company_id: companyId,
                date: attendanceDate,
                status: status,
                createdBy: req.user?.userId
            });
        } else {
            attendance.status = status;
        }

        attendance.updatedBy = req.user?.userId;
        await attendance.save();

        res.status(StatusCodes.OK).json({
            Attendance: attendance,
            message: "Attendance marked successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Get count of employees who are absent today (no check-in record)
const getTodayAbsentCount = async (req, res, next) => {
    try {
        const companyId = req.user?.companyId;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Count of employees who belong to this company
        const totalEmployees = await User.countDocuments({
            company_id: companyId,
            role: 'employee'   // adjust if your role field is named differently
        });

        // Count of employees who have checked in today (have an attendance record)
        const presentToday = await Attendance.countDocuments({
            company_id: companyId,
            date: { $gte: today, $lt: tomorrow },
        });

        const absentCount = Math.max(0, totalEmployees - presentToday);

        res.status(StatusCodes.OK).json({
            absentCount,
            totalEmployees,
            presentToday,
            message: 'Today absent count fetched successfully',
        });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    checkIn,
    checkOut,
    getTodayAttendance,
    getMyTodayAttendance,
    getAttendanceRecords,
    getCurrentStatus,
    getMyStats,
    getWeeklyAttendance,
    getWeeklyAttendanceAdmin,
    markAttendance,
    getTodayAbsentCount
};
