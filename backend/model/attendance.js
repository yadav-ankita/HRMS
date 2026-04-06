const mongoose = require('mongoose');
const attendanceSchema = new mongoose.Schema({ 
    user_id: {
      type: String,
      ref: "User",
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
      default: null,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["present", "absent", "leave", "halfday"],
      default: "absent",
    },
    createdBy: {
      type: String,
      ref: "User",
    },
    updatedBy: {
      type: String,
      ref: "User",
    },
},
  { timestamps: true }
);
module.exports = mongoose.model('Attendance', attendanceSchema);
