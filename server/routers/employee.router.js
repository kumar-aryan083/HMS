import express from 'express';
import { employeeLogin, employeeRegistration, getDoctors } from '../controllers/employee.controller.js';
import { verifyToken } from '../verifyToken.js';

const router = express.Router();

router.post('/empRegister', employeeRegistration);
router.post('/empLogin', employeeLogin);
router.get('/get-doctors',verifyToken, getDoctors);

export default router;