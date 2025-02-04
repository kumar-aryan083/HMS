import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  addIpdRate,
  addMedication,
  addOpdRate,
  addOtherService,
  addPackage,
  addPatientType,
  addService,
  deleteIpdRate,
  deleteOpdRate,
  deleteOtherService,
  deletePackage,
  deletePatientType,
  deleteService,
  editIpdRate,
  editOpdRate,
  editOtherService,
  editPackage,
  editPatientType,
  editService,
  getAllMedications,
  getIpdRate,
  getOpdRate,
  getOtherService,
  getPackage,
  getPatientType,
  getService,
  getStaffList,
  getFinalDiscountReport,

  staffAttendence,
  getStaffAttendance,
  staffExpenses,
  deleteStaffExpense,
  editStaffExpense,
  getStaffExpenses,
  editStaff,
} from "../controllers/common.controller.js";

const router = express.Router();

router.get("/get-medications", verifyToken, getAllMedications);
router.post("/add-medications", verifyToken, addMedication);
router.post("/add-patient-type", verifyToken, addPatientType);
router.get("/get-patient-type", verifyToken, getPatientType);
router.delete("/delete-patient-type/:tId", verifyToken, deletePatientType);
router.put("/edit-patient-type/:tId", verifyToken, editPatientType);
router.post("/add-opd-rate", verifyToken, addOpdRate);
router.get("/get-opd-rate", verifyToken, getOpdRate);
router.put("/edit-opd-rate/:rId", verifyToken, editOpdRate);
router.delete("/delete-opd-rate/:rId", verifyToken, deleteOpdRate);
router.post("/add-ipd-rate", verifyToken, addIpdRate);
router.get("/get-ipd-rate", verifyToken, getIpdRate);
router.put("/edit-ipd-rate/:rId", verifyToken, editIpdRate);
router.delete("/delete-ipd-rate/:rId", verifyToken, deleteIpdRate);
router.post("/add-package", verifyToken, addPackage);
router.get("/get-packages", verifyToken, getPackage);
router.put("/edit-package/:pId", verifyToken, editPackage);
router.delete("/delete-package/:pId", verifyToken, deletePackage);
router.post("/add-service", verifyToken, addService);
router.get("/get-services", verifyToken, getService);
router.put("/edit-service/:sId", verifyToken, editService);
router.delete("/delete-service/:sId", verifyToken, deleteService);
router.post("/add-other-service", verifyToken, addOtherService);
router.get("/get-other-services", verifyToken, getOtherService);
router.put("/edit-other-service/:sId", verifyToken, editOtherService);
router.delete("/delete-other-service/:sId", verifyToken, deleteOtherService);
router.get("/get-staff-list", getStaffList);
router.get("/get-final-discount-report", getFinalDiscountReport);
router.post("/staff-attendence", verifyToken, staffAttendence);
router.get("/get-staff-attendence", getStaffAttendance);
router.post("/staff-expenses", verifyToken, staffExpenses);
router.delete("/delete-staff-expense", verifyToken, deleteStaffExpense);
router.put("/edit-staff-expense", verifyToken, editStaffExpense);
router.get("/get-staff-expenses", getStaffExpenses);
router.put("/edit-staff/:staffRole/:staffId", verifyToken, editStaff);

export default router;
