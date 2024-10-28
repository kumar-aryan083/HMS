import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { createOpd, getAllOpdRecords } from '../controllers/opd.controller.js';

const router = express.Router();

router.post('/create-opd', verifyToken, createOpd)
router.get('/get-all-opd', getAllOpdRecords);

export default router;