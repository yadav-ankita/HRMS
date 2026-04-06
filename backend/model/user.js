const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        name: {
            type: String,
            trim: true,
            index: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: [true, "Email must be unique"],
            trim: true,
            lowercase: true,
        },
        loginId: {
            type: String,
            unique: true,
            index: true,
        },
        phone_number: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
            minlength: [10, "Phone number must be at least 10 characters long"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters long"],
            trim: true,
        },
        role: {
            type: String,
            enum: ["employee", "admin"],
            default: "employee",
        },
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
        },
        attendance_status: {
        type: String,
        enum: ["present", "leave", "absent"],
        default: "absent",
       },
       Department:{
            type:String
       },
       Role:{
          type:String
       },
       joinDate:{
          type:Date
       }
    },
    { timestamps: true }
);
userSchema.pre("save", async function () {
    // Generate Login ID if new user
    if (this.isNew) {
        const Company = mongoose.model("Company");
        const company = await Company.findById(this.company_id);
        if (!company) {
            throw new Error("Company not found");
        }   
        const currentYear = new Date().getFullYear().toString();
        const companyCode = company.companyCode || "XX";
        // Get first 2 letters of first and last name
        const firstInitials = this.firstName.substring(0, 2).toUpperCase().padEnd(2, "X");
        const lastInitials = this.lastName.substring(0, 2).toUpperCase().padEnd(2, "X");
        const nameCode = firstInitials + lastInitials;
        // Find the last user in this company created this year
        const lastUser = await (this.constructor)
            .findOne({ 
                loginId: { $regex: `^${companyCode}.*${currentYear}\\d{4}$` },
                company_id: this.company_id,
            })
            .sort({ createdAt: -1 });
        let serial = 1;
        if (lastUser && lastUser.loginId) {
            const lastSerialStr = lastUser.loginId.slice(-4);
            const lastSerial = parseInt(lastSerialStr, 10);
            if (!isNaN(lastSerial)) {
                serial = lastSerial + 1;
            }
        }
        const loginId = `${companyCode}${nameCode}${currentYear}${serial.toString().padStart(4, "0")}`;
        console.log("loginId is", loginId);
        this.loginId = loginId;
        this._id = loginId;
        // Set full name
        this.name = `${this.firstName} ${this.lastName}`;
        console.log("name is",this.name);
    }
});
module.exports = mongoose.model('User', userSchema);