import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addAllergies, addAssessment, addFollowUpDate, addMedications, assignTests, createOpd, deleteOpd, getAllOpdRecords, getFollowUpHistory, getOpd, getOpdByOpdId, getPaymentsHistory, updateOpd } from '../controllers/opd.controller.js';

const router = express.Router();

router.post('/create-opd', verifyToken, createOpd)
router.get('/opds-list',verifyToken, getAllOpdRecords);
router.delete('/delete-opd/:oId',verifyToken, deleteOpd);
router.put('/update-opd/:id',verifyToken, updateOpd);
router.get('/:id',verifyToken, getOpd);
router.get('/get-opd/:oId',verifyToken, getOpdByOpdId);
router.post('/assign-medicine/:oId', verifyToken, addMedications);
router.post('/add-allergy/:oId', verifyToken, addAllergies);
router.post('/:id/assign-tests', verifyToken, assignTests);
router.post('/add-assessment/:opdId',verifyToken, addAssessment);
router.get('/:oId/payments',verifyToken, getPaymentsHistory);
router.post('/:opdId/followup',verifyToken, addFollowUpDate);
router.get('/:opdId/followup-history',verifyToken, getFollowUpHistory);

export default router;