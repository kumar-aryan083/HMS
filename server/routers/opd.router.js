import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { createOpd, deleteOpd, getAllOpdRecords } from '../controllers/opd.controller.js';

const router = express.Router();

router.post('/create-opd', verifyToken, createOpd)
router.get('/opds-list', getAllOpdRecords);
router.delete('/delete-opd/:oId', deleteOpd);

export default router;