const express = require('express');
const router = express.Router();

const {
  applyLeave,
  getMyLeaves,
  getLeaveRequests,
  updateLeaveStatus,
  getLeaveStats,
  getAllLeaves,
  getTotalLeaveCountToday,
  getTodayLeaveEmployees
} = require('../controller/leave');
const { authorizeRole } = require('../middleware/authMiddleware');

router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/stats', getLeaveStats);
router.get('/', authorizeRole, getAllLeaves);
router.get('/today-leave',getTotalLeaveCountToday);
router.get('/today-leave-employees',getTodayLeaveEmployees);
// router.get('/', authorizeRole, getLeaveRequests);
router.patch('/:id/status', authorizeRole, updateLeaveStatus);

module.exports = router;
