import express from 'express';
import { bookAppointment, deletePatient, getPatient, patientList, patientRegister, searchPatientsByName, updatePatient } from '../controllers/patient.controller.js';
import { verifyToken } from '../verifyToken.js';

const router = express.Router();

router.post('/patient-register', verifyToken, patientRegister);
router.get('/patients-list', verifyToken, patientList);
router.delete('/delete-patient/:pId', verifyToken, deletePatient);
router.get('/get-patient/:uhid', verifyToken, getPatient);
router.put('/update-patient/:uhid', verifyToken, updatePatient);
router.post('/book-appointment', verifyToken, bookAppointment);
router.get('/search', verifyToken, searchPatientsByName);

export default router;