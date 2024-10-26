import express from 'express';
import { addDepartment, addDoctor, adminLogin, adminRegistration, getDepartments } from '../controllers/admin.controller.js';
import { verifyToken } from '../verifyToken.js';

const router = express.Router();

router.post('/admin-register', adminRegistration);
router.post('/admin-login', adminLogin);
router.post('/add-department',verifyToken, addDepartment);
router.post('/add-doctor',verifyToken, addDoctor);
router.get('/get-departments',verifyToken, getDepartments);

export default router;