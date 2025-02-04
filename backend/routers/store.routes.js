import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  addStoreItem,
  deleteStoreItem,
  editStoreItem,
  getStoreItems,
  getCategories,
  addCategory,
  deleteCategory,
  editCategory,
  addReceiver,
  getReceivers,
  editReceiver,
  deleteReceiver,
  addVendor,
  getVendors,
  editVendor,
  deleteVendor,
  addSupply,
  getSupplies,
  updateSupply,
  deleteSupply,
  getSuppliesByDate,
  searchStoreItems,
  addPurchaseOrder,
  getPurchaseOrders,
  editPurchaseOrder,
  deletePurchaseOrder,
  addStoreVendorBill,
  deleteStoreVendorBill,
  getStoreVendorBills,
  updateStoreVendorBill,
  searchVendors,
} from "../controllers/store.controller.js";

const router = express.Router();

router.post("/add-store-item", verifyToken, addStoreItem);
router.get("/get-store-items", verifyToken, getStoreItems);
router.put("/edit-store-item/:sId", verifyToken, editStoreItem);
router.delete("/delete-store-item/:sId", verifyToken, deleteStoreItem);

router.get("/get-categories", verifyToken, getCategories);
router.post("/add-category", verifyToken, addCategory);
router.put("/edit-category/:cId", verifyToken, editCategory);
router.delete("/delete-category/:cId", verifyToken, deleteCategory);

router.post("/add-receiver", verifyToken, addReceiver);
router.get("/get-receivers", verifyToken, getReceivers);
router.put("/edit-receiver/:rId", verifyToken, editReceiver);
router.delete("/delete-receiver/:rId", verifyToken, deleteReceiver);

router.post("/add-vendor", verifyToken, addVendor);
router.get("/get-vendors", verifyToken, getVendors);
router.put("/edit-vendor/:vId", verifyToken, editVendor);
router.delete("/delete-vendor/:vId", verifyToken, deleteVendor);

router.post("/add-supply", verifyToken, addSupply);
router.get("/get-supplies", verifyToken, getSupplies);
router.put("/update-supply/:sId", verifyToken, updateSupply);
router.delete("/delete-supply/:sId", verifyToken, deleteSupply);
router.get("/get-supplies-by-date", verifyToken, getSuppliesByDate);

router.get("/search-store-items", verifyToken, searchStoreItems);

router.post("/add-purchase-order", verifyToken, addPurchaseOrder);
router.get("/get-purchase-orders", verifyToken, getPurchaseOrders);
router.put("/edit-purchase-order/:pId", verifyToken, editPurchaseOrder);
router.delete("/delete-purchase-order/:pId", verifyToken, deletePurchaseOrder);

router.post("/add-store-vendor-bill", verifyToken, addStoreVendorBill);
router.get("/get-store-vendor-bills", verifyToken, getStoreVendorBills);
router.put("/update-store-vendor-bill/:sId", verifyToken, updateStoreVendorBill);
router.delete("/delete-store-vendor-bill/:sId", verifyToken, deleteStoreVendorBill);

router.get("/search-vendors", verifyToken, searchVendors);

export default router;
