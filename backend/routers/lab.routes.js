import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  addChargesScript,
  addLabCategory,
  addLabTest,
  deleteLabCategory,
  deleteLabTest,
  editLabCategory,
  editLabTest,
  getCharges,
  getLabCategories,
  getLabTests,
  addComponent,
  getAllComponents,
  editComponent,
  deleteComponent,
  addLabTemp,
  deleteLabTemp,
  editLabTemp,
  getLabTemps,
  addVendor,
  editVendor,
  getVendors,
  deleteVendor,
  addLookUp,
  getLookUps,
  editLookUp,
  deleteLookUp,
  addGovLabTest,
  getGovLabTests,
  editGovLabTest,
  deleteGovLabTest,
  addNewLabTest,
  getNewLabTests,
  deletNewLabTest,
  editNewLabTest,
  searchLabTests,
  getLabBills,
  getLabReports,
  updateLabReport,
  updateCollectedDate,
  prevLabReport,
  submitLaboratoryBill,
  getNewLaboratoryBills,
  deleteLaboratoryBill,
  updateLaboratoryBill,
} from "../controllers/lab.controller.js";

const router = express.Router();

router.get("/script", addChargesScript);
router.get("/get-cahrges", getCharges);

router.post("/add-lab-category", verifyToken, addLabCategory);

router.get("/get-lab-categories", verifyToken, getLabCategories);

router.put("/edit-lab-category/:cId", verifyToken, editLabCategory);

router.post("/add-lab-test", verifyToken, addLabTest);
router.get("/get-lab-tests", verifyToken, getLabTests);
router.put("/edit-lab-test/:tId", verifyToken, editLabTest);
router.delete("/delete-lab-test/:tId", verifyToken, deleteLabTest);

router.delete("/delete-lab-category/:cId", verifyToken, deleteLabCategory);

router.post("/add-component", verifyToken, addComponent);
router.get("/get-components", verifyToken, getAllComponents);
router.put("/edit-component/:id", verifyToken, editComponent);
router.delete("/delete-component/:id", verifyToken, deleteComponent);

router.post("/add-lab-temp", verifyToken, addLabTemp);
router.get("/get-lab-temps", verifyToken, getLabTemps);
router.put("/edit-lab-temp/:id", verifyToken, editLabTemp);
router.delete("/delete-lab-temp/:id", verifyToken, deleteLabTemp);

router.post("/add-vendor", verifyToken, addVendor);
router.get("/get-vendors", verifyToken, getVendors);
router.put("/edit-vendor/:id", verifyToken, editVendor);
router.delete("/delete-vendor/:id", verifyToken, deleteVendor);

router.post("/add-lookup", verifyToken, addLookUp);
router.get("/get-lookups", verifyToken, getLookUps);
router.put("/edit-lookup/:id", verifyToken, editLookUp);
router.delete("/delete-lookup/:id", verifyToken, deleteLookUp);

router.post("/add-gov-lab-test", verifyToken, addGovLabTest);
router.get("/get-gov-lab-tests", verifyToken, getGovLabTests);
router.put("/edit-gov-lab-test/:id", verifyToken, editGovLabTest);
router.delete("/delete-gov-lab-test/:id", verifyToken, deleteGovLabTest);

router.post("/add-new-lab-test", verifyToken, addNewLabTest);
router.get("/get-new-lab-tests", verifyToken, getNewLabTests);
router.put("/edit-new-lab-test/:tId", verifyToken, editNewLabTest);
router.delete("/delete-new-lab-test/:tId", verifyToken, deletNewLabTest);

router.get("/search-lab-tests", searchLabTests);
router.get("/get-lab-bills", getLabBills);

router.get("/get-lab-reports", getLabReports);
router.put("/update-lab-report/:reportId", verifyToken, updateLabReport);

router.put("/update-collected-date/:reportId", verifyToken, updateCollectedDate);
router.get("/prev-lab-report/:reportId", verifyToken, prevLabReport);

router.post("/submit-laboratory-bill", submitLaboratoryBill);
router.get("/get-new-laboratory-bills", getNewLaboratoryBills);
router.delete("/delete-laboratory-bill/:billId", verifyToken, deleteLaboratoryBill);
router.put("/update-laboratory-bill/:billId", verifyToken, updateLaboratoryBill);

export default router;
