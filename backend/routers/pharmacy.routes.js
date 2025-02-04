import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  addSupplier,
  addCompany,
  addCategory,
  addUOM,
  addItemType,
  searchCategory,
  addGenericName,
  addItem,
  addTax,
  addDispensary,
  addRack,
  addInvoiceHeader,
  addTandC,
  searchDispensary,
  getSuppliers,
  getCompanies,
  getCategories,
  getUOMs,
  getItemTypes,
  getGenericNames,
  getItems,
  getTaxes,
  getDispensaries,
  getRacks,
  getInvoiceHeaders,
  getTandCs,
  deleteSupplier,
  deleteCompany,
  deleteCategory,
  deleteUOM,
  deleteItemType,
  deleteGenericName,
  deleteItem,
  deleteTax,
  deleteDispensary,
  deleteRack,
  deleteInvoiceHeader,
  deleteTandC,
  editSupplier,
  editCompany,
  editCategory,
  editUOM,
  editItemType,
  editGenericName,
  editItem,
  editTax,
  editDispensary,
  editRack,
  editInvoiceHeader,
  editTandC,

  // other then the pharmacy settings
  addMedicine,
  getMedicines,
  deleteMedicine,
  editMedicine,

  getAllBills,
  searchMedicine,
  getMedStats,
  submitPharmacyBill,
  getNewPharmacyBills,
  updatePharmacyBill,
  deletePharmacyBill,
  getMedStatsById,
  returnMedicine,
  deleteReturnMedicine,
  updateReturnMedicine,
  getReturnMedicine,
} from "../controllers/pharmacy.controller.js";
const router = express.Router();

router.post("/add-supplier", verifyToken, addSupplier);
router.post("/add-company", verifyToken, addCompany);
router.post("/add-category", verifyToken, addCategory);
router.get("/search-category", verifyToken, searchCategory);
router.post("/add-uom", verifyToken, addUOM);
router.post("/add-item-type", verifyToken, addItemType);
router.post("/add-generic-name", verifyToken, addGenericName);
router.post("/add-item", verifyToken, addItem);
router.post("/add-tax", verifyToken, addTax);
router.post("/add-dispensary", verifyToken, addDispensary);
router.post("/add-rack", verifyToken, addRack);
router.post("/add-invoice-header", verifyToken, addInvoiceHeader);
router.post("/add-tandc", verifyToken, addTandC);

router.get("/get-suppliers", getSuppliers);
router.get("/get-companies", getCompanies);
router.get("/get-categories", getCategories);
router.get("/get-uoms", getUOMs);
router.get("/get-item-types", getItemTypes);
router.get("/get-generic-names", getGenericNames);
router.get("/get-items", getItems);
router.get("/get-taxes", getTaxes);
router.get("/get-dispensaries", getDispensaries);
router.get("/get-racks", getRacks);
router.get("/get-invoice-headers", getInvoiceHeaders);
router.get("/get-tandcs", getTandCs);

router.delete("/delete-supplier/:id", verifyToken, deleteSupplier);
router.delete("/delete-company/:id", verifyToken, deleteCompany);
router.delete("/delete-category/:id", verifyToken, deleteCategory);
router.delete("/delete-uom/:id", verifyToken, deleteUOM);
router.delete("/delete-item-type/:id", verifyToken, deleteItemType);
router.delete("/delete-generic-name/:id", verifyToken, deleteGenericName);
router.delete("/delete-item/:id", verifyToken, deleteItem);
router.delete("/delete-tax/:id", verifyToken, deleteTax);
router.delete("/delete-dispensary/:id", verifyToken, deleteDispensary);
router.delete("/delete-rack/:id", verifyToken, deleteRack);
router.delete("/delete-invoice-header/:id", verifyToken, deleteInvoiceHeader);
router.delete("/delete-tandc/:id", verifyToken, deleteTandC);

router.put("/edit-supplier/:id", verifyToken, editSupplier);
router.put("/edit-company/:id", verifyToken, editCompany);
router.put("/edit-category/:id", verifyToken, editCategory);
router.put("/edit-uom/:id", verifyToken, editUOM);
router.put("/edit-item-type/:id", verifyToken, editItemType);
router.put("/edit-generic-name/:id", verifyToken, editGenericName);
router.put("/edit-item/:id", verifyToken, editItem);
router.put("/edit-tax/:id", verifyToken, editTax);
router.put("/edit-dispensary/:id", verifyToken, editDispensary);
router.put("/edit-rack/:id", verifyToken, editRack);
router.put("/edit-invoice-header/:id", verifyToken, editInvoiceHeader);
router.put("/edit-tandc/:id", verifyToken, editTandC);

router.post("/add-medicine", verifyToken, addMedicine);
router.get("/get-medicines", getMedicines);
router.delete("/delete-medicine/:id", verifyToken, deleteMedicine);
router.put("/edit-medicine/:id", verifyToken, editMedicine);
router.get("/get-all-bills", getAllBills);

router.get("/search-medicine", searchMedicine);
router.get("/get-med-stats", getMedStats);

router.post("/submit-pharmacy-bill", verifyToken, submitPharmacyBill);
router.get("/get-new-pharmacy-bills", getNewPharmacyBills);
router.delete("/delete-pharmacy-bill/:billId", verifyToken, deletePharmacyBill);
router.put("/edit-pharmacy-bill/:billId", verifyToken, updatePharmacyBill);

router.get("/get-med-stats-by-id/:medId", getMedStatsById);

router.post("/return-medicine", verifyToken, returnMedicine);
router.get("/get-return-medicine", getReturnMedicine);
router.delete("/delete-return-medicine/:id", verifyToken, deleteReturnMedicine);
router.put("/update-return-medicine/:id", verifyToken, updateReturnMedicine);

export default router;
