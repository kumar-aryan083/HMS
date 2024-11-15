import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addNursing, addRoom, addVisitingDoctor, createWing, deleteNursing, deleteRoom, deleteVisitingDoctor, deleteWing, editNursing, editRoom, editVisitingDoctor, editWing, getNursing, getRooms, getVisitingDoctor, getWings, patientAdmission } from '../controllers/ipd.controller.js';

const router = express.Router();

router.post('/create-wing', verifyToken, createWing)
router.get('/get-wings', verifyToken, getWings)
router.delete('/delete-wing/:wId', verifyToken, deleteWing)
router.put('/edit-wing/:wId', verifyToken, editWing)
router.post('/add-room', verifyToken, addRoom)
router.get('/get-rooms', verifyToken, getRooms) 
router.delete('/delete-room/:rId', verifyToken, deleteRoom)
router.put('/edit-room/:rId', verifyToken, editRoom)
router.post('/add-visitingDoctor', verifyToken, addVisitingDoctor)
router.get('/get-visitingDoctors', verifyToken, getVisitingDoctor)
router.delete('/delete-visitingDoctor/:dId', verifyToken, deleteVisitingDoctor)
router.put('/edit-visitingDoctor/:dId', verifyToken, editVisitingDoctor)
router.post('/add-nursing', verifyToken, addNursing)
router.get('/get-nursing', verifyToken, getNursing)
router.delete('/delete-nursing/:nId', verifyToken, deleteNursing)
router.put('/edit-nursing/:nId', verifyToken, editNursing)
router.post('/admit-patient', verifyToken, patientAdmission)


export default router;