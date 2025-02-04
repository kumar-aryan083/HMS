import express from "express";
import {
  addDepartment,
  addDoctor,
  adminLogin,
  adminRegistration,
  getDepartments,
  loginDoctor,
  addNurse,
  loginNurse,
  addHr,
  loginHr,
  addPharmacy,
  loginPharmacy,
  addDoctorRole,
  addStoreRole,
  loginStoreRole,
  addLaboratory,
  loginLaboratory,
  addCounter,
  loginCounter,
  addInventoryRole,
  loginInventoryRole,
  getDoctorList,
  deleteDoctor,
  deleteDepartment,
  editDepartment,
  editDoctor,
  addAgent,
  deleteAgent,
  updateAgent,
  getAgents,
  getAgentAndStaff,
  addOtherRole,
  loginOtherRole,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

router.post("/add-admin", adminRegistration);
router.post("/login-admin", adminLogin);
router.post("/add-department", verifyToken, addDepartment);
router.get("/get-departments", getDepartments);
router.delete("/delete-department/:dId", deleteDepartment);
router.put("/edit-department/:dId", editDepartment);
// router.post("/add-doctor-details", verifyToken, addDoctor);
router.post("/add-doctor", verifyToken, addDoctor);
router.get("/get-doctor-list", verifyToken, getDoctorList);
router.delete("/delete-doctor/:dId", verifyToken, deleteDoctor);
router.put("/edit-doctor/:dId", verifyToken, editDoctor);
router.post("/login-doctor", loginDoctor);
router.post("/add-nurse", verifyToken, addNurse);
router.post("/login-nurse", loginNurse);
router.post("/add-hr", verifyToken, addHr);
router.post("/login-hr", loginHr);
router.post("/add-pharmacy", verifyToken, addPharmacy);
router.post("/login-pharmacy", loginPharmacy);
router.post("/add-store", verifyToken, addStoreRole);
router.post("/login-store", loginStoreRole);
router.post("/add-laboratory", verifyToken, addLaboratory);
router.post("/login-laboratory", loginLaboratory);
router.post("/add-counter", verifyToken, addCounter);
router.post("/login-counter", loginCounter);
router.post("/add-inventory", verifyToken, addInventoryRole);
router.post("/login-inventory", loginInventoryRole);

router.post("/add-other-role", verifyToken, addOtherRole);
router.post("/login-other-role", loginOtherRole);

router.post("/add-agent", verifyToken, addAgent);
router.get("/get-agents", verifyToken, getAgents);
router.delete("/delete-agent/:aId", verifyToken, deleteAgent);
router.put("/update-agent/:aId", verifyToken, updateAgent);

router.get("/get-agent-staff", verifyToken, getAgentAndStaff);

export default router;
