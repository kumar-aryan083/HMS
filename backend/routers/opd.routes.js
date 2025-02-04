import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  addAllergies,
  addAssessment,
  addFollowUpDate,
  addMedications,
  assignTests,
  createOpd,
  deleteAllergies,
  deleteAssignedTest,
  deleteFollowupHistory,
  deleteMedication,
  deleteOpd,
  getAllOpdRecords,
  getFollowUpHistory,
  getOpd,
  getOpdAllergies,
  getOpdByOpdId,
  getOpdMedications,
  getOpdTests,
  getPaymentsHistory,
  updateFollowup,
  updateMedication,
  updateOpd,
  updateOpdAllergy,
  updateOpdTest,
  getOpdItems,
  submitOpdBill,
  getOpdBills,
  addOpdPayment,
  getPatientByOpdId,
  deleteOpdBill,
  updateOpdBill,
  addCustomPayment,
  getOpdStats,
} from "../controllers/opd.controller.js";

const router = express.Router();

router.get("/get-opd-items", getOpdItems);
router.post("/create-opd", verifyToken, createOpd);
router.get("/opds-list", verifyToken, getAllOpdRecords);
router.delete("/delete-opd/:oId", verifyToken, deleteOpd);
router.put("/update-opd/:id", verifyToken, updateOpd);
// router.get("/:id", verifyToken, getOpd);
router.get("/get-opd/:oId", verifyToken, getOpdByOpdId);
router.post("/assign-medicine/:oId", verifyToken, addMedications);
router.post("/add-allergy/:oId", verifyToken, addAllergies);
router.post("/:id/assign-tests", verifyToken, assignTests);
router.post("/add-assessment/:opdId", verifyToken, addAssessment);
router.get("/:oId/payments", verifyToken, getPaymentsHistory);
router.post("/:opdId/followup", verifyToken, addFollowUpDate);
router.get("/:opdId/get-followup-history", verifyToken, getFollowUpHistory);
router.get("/:opdId/get-medications", verifyToken, getOpdMedications);
router.get("/:opdId/get-allergies", verifyToken, getOpdAllergies);
router.get("/:opdId/get-assigned-tests", verifyToken, getOpdTests);
router.delete(
  "/:opdId/delete-assigned-tests/:testId",
  verifyToken,
  deleteAssignedTest
);
router.delete(
  "/:opdId/delete-medications/:medicationId",
  verifyToken,
  deleteMedication
);
router.delete(
  "/:opdId/delete-allergies/:allergyId",
  verifyToken,
  deleteAllergies
);
router.delete(
  "/:opdId/delete-followup/:followupId",
  verifyToken,
  deleteFollowupHistory
);
router.put(
  "/:opdId/edit-medication/:medicineId",
  verifyToken,
  updateMedication
);
router.put("/:opdId/edit-allergy/:allergyId", verifyToken, updateOpdAllergy);
router.put("/:opdId/edit-followup/:followupId", verifyToken, updateFollowup);
router.put("/:opdId/edit-test/:testId", verifyToken, updateOpdTest);

router.get("/get-opd-items", getOpdItems);
router.post("/submit-opd-bill", verifyToken, submitOpdBill);
router.delete("/delete-opd-bill/:billId", verifyToken, deleteOpdBill);
router.put("/edit-opd-bill/:billId", verifyToken, updateOpdBill);
router.get("/getOpdBills", getOpdBills);
router.post("/add-opd-payment", verifyToken, addCustomPayment);

router.get("/:opdId/get-patient-opdId", getPatientByOpdId);
router.get("/get-opd-stats", getOpdStats);

export default router;
