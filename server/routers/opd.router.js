import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addAllergies, addAssessment, addMedications, assignTests, createOpd, deleteOpd, getAllOpdRecords, getOpd, getPaymentsHistory, updateOpd } from '../controllers/opd.controller.js';

const router = express.Router();

router.post('/create-opd', verifyToken, createOpd)
router.get('/opds-list',verifyToken, getAllOpdRecords);
router.delete('/delete-opd/:oId',verifyToken, deleteOpd);
router.put('/update-opd/:id',verifyToken, updateOpd);
router.get('/:id',verifyToken, getOpd);
router.post('/assign-medicine/:oId', verifyToken, addMedications);
router.post('/add-allergy/:oId', verifyToken, addAllergies);
router.post('/:id/assign-tests', verifyToken, assignTests);
router.post('/add-assessment/:opdId',verifyToken, addAssessment);
router.get('/:oId/payments',verifyToken, getPaymentsHistory);

export default router;