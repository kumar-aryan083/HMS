import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addRoom, createWing, deleteRoom, deleteWing, editRoom, editWing, getRooms, getWings } from '../controllers/ipd.controller.js';

const router = express.Router();

router.post('/create-wing', verifyToken, createWing)
router.get('/get-wings', verifyToken, getWings)
router.delete('/delete-wing/:wId', verifyToken, deleteWing)
router.put('/edit-wing/:wId', verifyToken, editWing)
router.post('/add-room', verifyToken, addRoom)
router.get('/get-rooms', verifyToken, getRooms)
router.delete('/delete-room/:rId', verifyToken, deleteRoom)
router.put('/edit-room/:rId', verifyToken, editRoom)


export default router;