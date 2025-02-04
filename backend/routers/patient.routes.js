import express from "express";
import {
  allPatients,
  bookAppointment,
  deletePatient,
  getPatient,
  patientList,
  patientRegister,
  searchPatientsByName,
  updatePatient,
  getPatientFromAdmissionId,
  remainingDues,
  appointmentsList,
  updateAppointment,
  deleteAppointment,
  addPatientPayment,
  getPatientById,
  editPayment,
  deletePayment,
} from "../controllers/patient.controller.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

router.post("/patient-register", verifyToken, patientRegister);
router.get("/patients-list", verifyToken, patientList);
router.get("/get-all", verifyToken, allPatients);
router.delete("/delete-patient/:pId", verifyToken, deletePatient);
router.get("/get-patient/:uhid", verifyToken, getPatient);
router.put("/update-patient/:uhid", verifyToken, updatePatient);
router.post("/book-appointment", verifyToken, bookAppointment);
router.get("/appointments-list", verifyToken, appointmentsList);
router.get("/search", verifyToken, searchPatientsByName);
router.get("/get-patient-from-admission-id", getPatientFromAdmissionId);
router.get("/remaining-dues", remainingDues);
router.get("/get-patient-by-id/:id", getPatientById);

router.put("/update-appointment/:aId", verifyToken, updateAppointment);
router.delete("/delete-appointment/:aId", verifyToken, deleteAppointment);
router.post("/add-patient-payment", verifyToken, addPatientPayment);
router.put("/edit-payment/:admissionId/:paymentNumber", verifyToken, editPayment);
router.delete("/delete-payment/:admissionId/:paymentNumber", verifyToken, deletePayment);

export default router;