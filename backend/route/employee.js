const express=require('express')
const router=express.Router();
const {
        getMyProfile,
        updateMyProfile,
        getAllEmployees,
        getEmployeeById,
        updateEmployee,
        deleteEmployee,
        createEmployee
}=require('../controller/employee');
const { authorizeRole } = require('../middleware/authMiddleware');

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);
// Create employee (Admin/HR only)
router.post("/", authorizeRole, createEmployee); 
// Get all employees (Admin/HR only)
router.get("/", authorizeRole, getAllEmployees);

// Get employee by ID (Admin/HR only)
router.get("/:id", authorizeRole, getEmployeeById);

// Update employee details (Admin/HR only)
router.patch("/:id", authorizeRole, updateEmployee);

// Delete employee (Admin/HR only)
router.delete("/:id", authorizeRole, deleteEmployee);

module.exports=router;
