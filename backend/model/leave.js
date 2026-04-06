const mongoose = require('mongoose');
     
const leaveSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      ref: 'User',
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    user_name:{
       type:String,
       ref:'User'
    },
    leaveType: {
      type: String,
       enum: ['paid', 'sick', 'unpaid', 'casual', 'maternity', 'paternity'],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
      //required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: {
      type: Number,
      //required: true,
    },
    status: {
      type: String,
       enum: ['pending', 'approved', 'rejected'],
       default: 'pending',
    },
    reviewedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewComment: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      ref: 'User',
    },
    updatedBy: {
      type: String,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Leave', leaveSchema);
