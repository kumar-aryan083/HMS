import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addTestOption, getAllTests } from '../controllers/tests.controller.js';

const router = express.Router();

router.get('/get-tests', verifyToken, getAllTests)
router.post('/add-tests', verifyToken, addTestOption)

export default router;