import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addRoom, createWing, getRooms, getWings } from '../controllers/ipd.controller.js';

const router = express.Router();

router.post('/create-wing', verifyToken, createWing)
router.get('/get-wings', verifyToken, getWings)
router.post('/add-room', verifyToken, addRoom)
router.get('/get-rooms', verifyToken, getRooms)

export default router;