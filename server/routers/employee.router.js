import express from 'express';
import { employeeLogin, employeeRegistration } from '../controllers/employee.controller.js';

const router = express.Router();

router.post('/empRegister', employeeRegistration);
router.post('/empLogin', employeeLogin);

export default router;