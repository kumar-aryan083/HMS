import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  addAllergy,
  addChemoNotes,
  addConsumables,
  addDischargeSummary,
  addNursing,
  addRoom,
  addVisitingDoctor,
  addVisitNote,
  addWardHistory,
  allIpds,
  createWing,
  deleteAllergies,
  deleteChemo,
  deleteComplaint,
  deleteConsumable,
  deleteInvestigationLabTest,
  deleteNursing,
  deleteRoom,
  deleteVisitingDoctor,
  deleteVisitNotes,
  deleteWing,
  editInvestigationLabTest,
  editNursing,
  editRoom,
  editVisitingDoctor,
  editWing,
  getAdmissionDetails,
  getAllergies,
  getChemoNotes,
  getChiefComplaints,
  getConsumables,
  getDischargeSummary,
  getIPDDetails,
  getIpdLabTests,
  getNursing,
  getRooms,
  getVisitingDoctor,
  getVisitNotes,
  getWardHistory,
  getWings,
  patientAdmission,
  updateAllergy,
  updateChemo,
  updateChiefComplaints,
  updateComplaint,
  updateConsumable,
  updateInvestigations,
  updateObsGynae,
  updatePhysicalExamination,
  updateVisitNote,
  getIpdItems,
  submitIpdBill,
  deleteIpdBill,
  updateIpdBill,
  getNewIpdBills,
  addCustomPayment,
  getAllIpdsItems,
  getAllTypeItems,
  editPatientAdmission,
  newUpdatePatientAdmission,
  deletePatientAdmission,
  getIpdStats,
  getDateWisePayment,
  roomOccupancy,
} from "../controllers/ipd.controller.js";

const router = express.Router();

router.post("/create-wing", verifyToken, createWing);
router.get("/get-wings", verifyToken, getWings);
router.delete("/delete-wing/:wId", verifyToken, deleteWing);
router.put("/edit-wing/:wId", verifyToken, editWing);
router.post("/add-room", verifyToken, addRoom);
router.get("/get-rooms", verifyToken, getRooms);
router.delete("/delete-room/:rId", verifyToken, deleteRoom);
router.put("/edit-room/:rId", verifyToken, editRoom);
router.post("/add-visitingDoctor", verifyToken, addVisitingDoctor);
router.get("/get-visitingDoctors", verifyToken, getVisitingDoctor);
router.delete("/delete-visitingDoctor/:dId", verifyToken, deleteVisitingDoctor);
router.put("/edit-visitingDoctor/:dId", verifyToken, editVisitingDoctor);
router.post("/add-nursing", verifyToken, addNursing);
router.get("/get-nursing", verifyToken, getNursing);
router.delete("/delete-nursing/:nId", verifyToken, deleteNursing);
router.put("/edit-nursing/:nId", verifyToken, editNursing);
router.post("/admit-patient", verifyToken, patientAdmission);
router.get("/all-ipds", verifyToken, allIpds);
router.put(
  "/admissions/:admissionId/discharge-summary",
  verifyToken,
  addDischargeSummary
);
router.patch("/admissions/:admissionId/allergies", verifyToken, addAllergy);
router.patch(
  "/:admissionId/physical-examination",
  verifyToken,
  updatePhysicalExamination
);
router.patch(
  "/:patientAdmissionId/investigations",
  verifyToken,
  updateInvestigations
);
router.patch(
  "/:patientAdmissionId/chief-complaints",
  verifyToken,
  updateChiefComplaints
);
router.put("/:admissionId/chemo-notes", verifyToken, addChemoNotes);
router.patch("/:admissionId/visit-notes", verifyToken, addVisitNote);
router.patch("/:patientAdmissionId/obs-gynae", verifyToken, updateObsGynae);
router.get(
  "/:admissionId/get-discharge-summary",
  verifyToken,
  getDischargeSummary
);
router.get(
  "/:admissionId/get-chief-complaints",
  verifyToken,
  getChiefComplaints
);
router.get("/:admissionId/get-chemo-notes", verifyToken, getChemoNotes);
router.get(
  "/:admissionId/get-admission-details",
  verifyToken,
  getAdmissionDetails
);
router.post("/:admissionId/add-consumables", verifyToken, addConsumables);
router.get("/:admissionId/get-consumables", verifyToken, getConsumables);
router.get("/:admissionId/get-allergies", verifyToken, getAllergies);
router.get("/:admissionId/get-visit-notes", verifyToken, getVisitNotes);
router.delete(
  "/:admissionId/delete-consumable/:consumableId",
  deleteConsumable
);
router.delete("/:admissionId/delete-complaint/:complaintId", deleteComplaint);
router.delete("/:admissionId/delete-chemo/:chemoId", deleteChemo);
router.delete("/:admissionId/delete-allergy/:allergyId", deleteAllergies);
router.delete("/:admissionId/delete-visit-note/:noteId", deleteVisitNotes);
router.put("/:admissionId/edit-consumable/:consumableId", updateConsumable);
router.put("/:admissionId/edit-complaint/:complaintId", updateComplaint);
router.put("/:admissionId/edit-chemo/:chemoNoteId", updateChemo);
router.put("/:admissionId/edit-allergy/:allergyId", updateAllergy);
router.put("/:admissionId/edit-visit-note/:noteId", updateVisitNote);
router.get("/get-ipd/:admissionId", verifyToken, getIPDDetails);
router.get("/get-ipd-lab-tests", verifyToken, getIpdLabTests);
router.delete(
  "/:admissionId/delete-ipd-lab-tests/:labTestId",
  verifyToken,
  deleteInvestigationLabTest
);
router.put(
  "/:admissionId/edit-ipd-lab-tests/:labTestId",
  verifyToken,
  editInvestigationLabTest
);
router.put("/:admissionId/add-ward-history", verifyToken, addWardHistory);
router.get("/:admissionId/get-ward-history", verifyToken, getWardHistory);


router.get("/get-ipd-items", getIpdItems);
router.post("/submit-ipd-bill", verifyToken, submitIpdBill);
router.get("/get-ipd-bills", verifyToken, getNewIpdBills);
router.get("/get-new-ipd-bills", getNewIpdBills);
router.delete("/delete-ipd-bill/:billId", verifyToken, deleteIpdBill);
router.put("/edit-ipd-bill/:billId", verifyToken, updateIpdBill);

// router.post("/add-ipd-payment", verifyToken, addIpdPayment);

router.post("/add-ipd-payment", verifyToken, addCustomPayment);
router.get("/get-all-ipds-items", getAllIpdsItems);
router.get("/get-all-type-items", getAllTypeItems);

// router.put("/edit-patient-admission", verifyToken, editPatientAdmission);
router.put("/new-update-patient-admission", verifyToken, newUpdatePatientAdmission);
router.delete("/delete-patient-admission/:admissionId", verifyToken, deletePatientAdmission);
router.get("/get-ipd-stats", getIpdStats);
router.get("/get-date-wise-payment", getDateWisePayment);

router.post("/room-occupancy", roomOccupancy);

export default router;
