const { StatusCodes } = require('http-status-codes');
const Leave = require('../model/leave');
const User=require('../model/user')
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../error');

const toDayBoundary = (dateValue) => {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
};

const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, reason, startDate, endDate } = req.body;
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;
    const user=await User.findById(userId).select('firstName lastName');
    if (!leaveType || !reason || !startDate || !endDate) {
      throw new BadRequestError('leaveType, reason, startDate and endDate are required');
    }

    const start = toDayBoundary(startDate);
    const end = toDayBoundary(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    if (end < start) {
      throw new BadRequestError('endDate cannot be before startDate');
    }

    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const leave = await Leave.create({
      user_id: userId,
      user_name: `${user.firstName} ${user.lastName}`,
      company_id: companyId,
      leaveType,
      reason: reason.trim(),
      startDate: start,
      endDate: end,
      days,
      createdBy: userId,
      // updatedBy: userId,
    });

    res.status(StatusCodes.CREATED).json({
      Leave: leave,
      message: 'Leave request submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};
const getAllLeaves = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const leaves = await Leave.find({ company_id: companyId }).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      Leaves: leaves,
      message: 'All leaves fetched successfully',
    });
  }
    catch (error) {
    next(error);
  }
}
const getMyLeaves = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const companyId = req.user?.companyId;
    const leaves = await Leave.find({ user_id: userId, company_id: companyId }).sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      Leaves: leaves,
      message: 'My leaves fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveRequests = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const { status, userId } = req.query;
    const query = { company_id: companyId };

    if (status) {
      query.status = status;
    }
    if (userId) {
      query.user_id = userId;
    }

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('user_id', 'firstName lastName email loginId');

    res.status(StatusCodes.OK).json({
      Leaves: leaves,
      message: 'Leave requests fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const reviewerId = req.user?.userId;
    const { id } = req.params;
    const { status, reviewComment } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('status must be approved or rejected');
    }

    const leave = await Leave.findOne({ _id: id, company_id: companyId });
    if (!leave) {
      throw new NotFoundError('Leave request not found');
    }
    if (leave.status !== 'pending') {
      throw new BadRequestError('Only pending leave requests can be updated');
    }
    if (leave.user_id === reviewerId) {
      throw new UnauthenticatedError('You cannot review your own leave request');
    }

    leave.status = status;
    leave.reviewComment = reviewComment || '';
    leave.reviewedBy = reviewerId;
    leave.reviewedAt = new Date();
    leave.updatedBy = reviewerId;
    await leave.save();

    res.status(StatusCodes.OK).json({
      Leave: leave,
      message: `Leave request ${status} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaveStats = async (req, res, next) => {
  try {
    const companyId = req.user?.companyId;
    const userId = req.user?.userId;
    const scope = req.user?.role === 'admin' ? { company_id: companyId } : { company_id: companyId, user_id: userId };

    const total = await Leave.countDocuments(scope);
    const pending = await Leave.countDocuments({ ...scope, status: 'pending' });
    const approved = await Leave.countDocuments({ ...scope, status: 'approved' });
    const rejected = await Leave.countDocuments({ ...scope, status: 'rejected' });

    res.status(StatusCodes.OK).json({
      stats: { total, pending, approved, rejected },
      message: 'Leave stats fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveRequests,
  updateLeaveStatus,
  getLeaveStats,
  getAllLeaves
};
