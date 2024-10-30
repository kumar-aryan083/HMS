import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addAllergies, addMedications, createOpd, deleteOpd, getAllOpdRecords, getOpd, updateOpd } from '../controllers/opd.controller.js';

const router = express.Router();

router.post('/create-opd', verifyToken, createOpd)
router.get('/opds-list',verifyToken, getAllOpdRecords);
router.delete('/delete-opd/:oId',verifyToken, deleteOpd);
router.put('/update-opd/:id',verifyToken, updateOpd);
router.get('/:id',verifyToken, getOpd);
router.post('/assign-medicine/:oId', verifyToken, addMedications);
router.post('/add-allergy/:oId', verifyToken, addAllergies);

export default router;