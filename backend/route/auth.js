const express=require('express');

const {signup,login,createEmployee}=require('../controller/auth');

const {authenticationMiddleware,authorizeRole}= require('../middleware/authMiddleware');

const router=express.Router();
    
router.post('/signup',signup);
router.post('/login',login);

router.post('/create-employee',authenticationMiddleware,authorizeRole,createEmployee);

module.exports=router
