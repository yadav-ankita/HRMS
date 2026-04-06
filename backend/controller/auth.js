require('dotenv').config()
const User = require('../model/user');
const Company = require('../model/company');
const jwt = require('jsonwebtoken');
const { StatusCodes} = require('http-status-codes')
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../error')
const signup = async (req, res,next) => {
    const { companyName, name, email, phone, password, confirmPassword } = req.body;
    try {
        if (!companyName || !name || !email || !phone || !confirmPassword ||
            !password
        ) {
            throw new BadRequestError("All fields are required!");
        }
        // Email format validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestError("Please provide a valid email address");
        }
        // Password strength validation
        const passwordRegex =
            /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,20}$$/;

        if (!passwordRegex.test(password)) {
            throw new BadRequestError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
            );
        }
        if (password !== confirmPassword) {
            throw new BadRequestError("Password and Confirm Password do not match");
        }
        // Split name into first and last
        const nameParts = name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];

        // Check if company exists
        const existingCompany = await Company.findOne({ CompanyName: companyName });

        if (existingCompany) {
            throw new BadRequestError("Company already registered");
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new BadRequestError("Email already registered");
        }
        // Create company (companyCode will be auto-generated)
        const company = await Company.create({
            CompanyName: companyName,
            //logo: logoUrl,
        });
        // Wait for company to be saved and ensure companyCode is generated
        await company.save();

        // Verify company code was generated
        if (!company.companyCode) {
            throw new Error("Failed to generate company code");
        }
        // Create admin user (name will be auto-set by pre-save hook)
        const adminUser = await User.create({
            firstName,
            lastName,
            email,
            phone_number: phone,
            password,
            role: "admin",
            company_id: company._id,
        });
        //console.log("Admin user company id is", adminUser.company_id);
        // Update company with admin ID
        company.adminId = adminUser._id;
        await company.save();

        const token = jwt.sign(
            { userId: adminUser._id, 
              role: adminUser.role, 
              userName:adminUser.name,
              companyId:adminUser.company_id},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_LIFETIME }
        )
        res.status(StatusCodes.CREATED).json(
            { 
               userInfo: 
               { username: adminUser.name, role:adminUser.role },
               token ,
               message:"Company Registered Successfully"
            }
        );
    } catch (error) {
        next(error)
    }
}
const login = async (req, res, next) => {
    const { loginId, password } = req.body;
     try {
        if (!loginId || !password) {
            throw new BadRequestError("Please Provide loginId and Password")
        }
        const user = await User.findOne({ loginId });
        const c_id=user.company_id;
       // console.log("Company id in login is:",c_id);
        if (!user) {
            throw new NotFoundError("User not found!")
        }
        if (user.password !== password) {
            throw new UnauthenticatedError('Invalid  Credentials of password')
        }
        const token = jwt.sign(
            { 
              userId: user._id, 
              username: user.name, 
              role: user.role,
              companyId: c_id
            },
              process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_LIFETIME }
        )
        res.status(StatusCodes.OK).json(
            {
                message: "Authentication successful",
                token: token,
                userInfo: {
                    username: user.name,
                    role: user.role
                }   
            }
        )
    } catch (error) {
        next(error);
    }
}
//Create Employee Admin/HR only
const createEmployee = async (req, res, next) => {
    // Implementation for creating an employee
    const { firstName, lastName, email, phone,Department,Role,joinDate} = req.body;
    console.log("request.user is", req.user);
    if (!firstName || !lastName || !email || !phone) {
         throw new BadRequestError("All fields are required");
    }
     // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    
     // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
     
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      phone_number: phone,
      password: tempPassword,
      company_id: req.user.companyId,
      Role,
      Department,
      joinDate,
      role: "employee",
    });
    return res.status(StatusCodes.CREATED).json(
        {
          message:"Employee created successfully",
          Emp_loginId:user.loginId,
          Emp_password:tempPassword
    }) 
}
const getAbsetEmployees = async (req, res, next) => {
    try {
        const companyId = req.user?.companyId;
        const absentEmployees = await User.find({ company_id: companyId, attendance_status: "absent" }).select('firstName lastName email phone_number');
        res.status(StatusCodes.OK).json({
            absentEmployees,
            message: 'Absent employees fetched successfully',
        });
    } catch (error) {
        next(error);
    }
}
module.exports = { signup, login, createEmployee, getAbsetEmployees };