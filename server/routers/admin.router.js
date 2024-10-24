import express from 'express';
import { addDepartment, addDoctor, adminLogin, adminRegistration } from '../controllers/admin.controller.js';
import { verifyToken } from '../verifyToken.js';

const router = express.Router();

router.post('/admin-register', adminRegistration);
router.post('/admin-login', adminLogin);
router.post('/add-department',verifyToken, addDepartment);
router.post('/add-doctor',verifyToken, addDoctor);

export default router;