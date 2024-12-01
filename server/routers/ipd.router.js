import express from 'express';
import { verifyToken } from '../verifyToken.js';
import { addDischargeSummary, addNursing, addRoom, addVisitingDoctor, allIpds, createWing, deleteNursing, deleteRoom, deleteVisitingDoctor, deleteWing, editNursing, editRoom, editVisitingDoctor, editWing, getDischargeSummary, getNursing, getRooms, getVisitingDoctor, getWings, patientAdmission, updateAllergies, updateChemoNotes, updateChiefComplaints, updateInvestigations, updateObsGynae, updatePhysicalExamination, updateVisitNotes } from '../controllers/ipd.controller.js';

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
router.get('/all-ipds', verifyToken, allIpds)
router.put('/admissions/:admissionId/discharge-summary',verifyToken, addDischargeSummary);
router.patch('/admissions/:admissionId/allergies',verifyToken, updateAllergies);
router.patch("/:patientAdmissionId/physical-examination",verifyToken, updatePhysicalExamination);
router.patch("/:patientAdmissionId/investigations",verifyToken, updateInvestigations);
router.patch("/:patientAdmissionId/chief-complaints",verifyToken, updateChiefComplaints);
router.patch("/:patientAdmissionId/chemo-notes",verifyToken, updateChemoNotes);
router.patch("/:patientAdmissionId/visit-notes",verifyToken, updateVisitNotes);
router.patch("/:patientAdmissionId/obs-gynae",verifyToken, updateObsGynae);
router.get("/:admissionId/get-discharge-summary",verifyToken, getDischargeSummary);



export default router;