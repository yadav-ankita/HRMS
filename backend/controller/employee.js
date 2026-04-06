const { StatusCodes } = require('http-status-codes');
const User = require('../model/user')
//Create Employee Admin/HR only
const createEmployee = async (req, res, next) => {
    // Implementation for creating an employee
    const { firstName, lastName, email, phone, Department, Role, joinDate } = req.body;
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
            message: "Employee created successfully",
            Emp_loginId: user.loginId,
            Emp_password: tempPassword
        })
}
const getMyProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                Employee: null,
                message: "Employee not found"
            });
        }
        res.status(StatusCodes.OK).json({
            Employee: user,
            message: "Profile fetched successfully"
        });
    } catch (error) {
        next(error);
    }
}

const updateMyProfile = async (req, res, next) => {
    try {
        const { firstName, lastName, phone_number } = req.body;
        const user = await User.findById(req.user?.userId);
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({
                Employee: null,
                message: "Employee not found"
            });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone_number) user.phone_number = phone_number;
        user.name = `${user.firstName} ${user.lastName}`.trim();
        await user.save();

        res.status(StatusCodes.OK).json({
            Employee: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number,
                role: user.role,
                loginId: user.loginId,
            },
            message: "Profile updated successfully"
        });
    } catch (error) {
        next(error);
    }
}

const getAllEmployees = async (req, res, next) => {
    try {
        const companyId = req.user?.companyId;
        const employees = await User.find(
            {
                role: "employee",
                company_id: companyId
            }
        );
        res.status(200).json(
            {
                Employees: employees,
                message: "Employees fetched successfully"
            }
        );
    }
    catch (error) {
        next(error)
    }
}
const getEmployeeById = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const companyId = req.user?.companyId;
        const employee = await User.findOne(
            {
                _id: employeeId,
                role: "employee",
                company_id: companyId
            }
        );
        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json(
                {
                    Employee: null,
                    message: "Employee not found"
                }
            );
        }
        res.status(StatusCodes.OK).json(
            {
                Employee: employee,
                message: "Employee fetched successfully"
            }
        );
    }
    catch (error) {
        next(error)
    }
}
// const updateEmployee = async (req, res, next) => {
//     try {
//         const employeeId = req.params.id;
//         const companyId = req.user?.companyId;
//         const { firstName, lastName, phone_number, Department, Role } = req.body;
//         const employee = await User.findOneAndUpdate(
//             {
//                 _id: employeeId,
//                 role: "employee",
//                 company_id: companyId
//             },
//             {
//                 firstName,
//                 lastName,
//                 email,
//                 avatar
//             },
//             { new: true }
//         );
//         if (!employee) {
//             return res.status(StatusCodes.NOT_FOUND).json(
//                 {
//                     Employee: null,
//                     message: "Employee not found"
//                 }
//             );
//         }
//         res.status(StatusCodes.OK).json(
//             {
//                 Employee: employee,
//                 message: "Employee updated successfully"
//             }
//         );
//     }
//     catch (error) {
//         next(error)
//     }
// }
// ── UPDATE EMPLOYEE (Admin/HR only) — supports name, phone, dept, role ──────
const updateEmployee = async (req, res, next) => {
    try {
        const { firstName, lastName, phone_number, Department, Role } = req.body;
        const employee = await User.findOne({
            _id: req.params.id, role: "employee", company_id: req.user?.companyId
        });
        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({ Employee: null, message: "Employee not found" });
        }

        if (firstName) employee.firstName = firstName;
        if (lastName) employee.lastName = lastName;
        if (phone_number) employee.phone_number = phone_number;
        if (Department !== undefined) employee.Department = Department;
        if (Role !== undefined) employee.Role = Role;

        // Keep name in sync if name parts changed
        if (firstName || lastName) {
            employee.name = `${employee.firstName} ${employee.lastName}`.trim();
        }

        await employee.save();

        res.status(StatusCodes.OK).json({
            Employee: employee,
            message: "Employee updated successfully"
        });
    } catch (error) { next(error); }
}
const deleteEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const companyId = req.user?.companyId;
        const employee
            = await User.findOneAndDelete(
                {
                    _id: employeeId,
                    role: "employee",
                    company_id: companyId
                }
            );
        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json(
                {
                    Employee: null,
                    message: "Employee not found"
                }
            );
        }
        res.status(StatusCodes.OK).json(
            {
                Employee: employee,
                message: "Employee deleted successfully"
            }
        );
    }
    catch (error) {
        next(error)
    }
}
module.exports = {
    getMyProfile,
    updateMyProfile,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    createEmployee
}
