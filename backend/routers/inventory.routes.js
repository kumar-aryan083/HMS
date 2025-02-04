import express from "express";

import {
  addSupplierBill,
  deleteSupplierBill,
  updateSupplierBill,
  getSupplierBill,
  // addSupplierPayment,
  // deleteSupplierPayment,
  // updateSupplierPayment,
  // getSupplierPayment,
  addPaymentTpSupplierBill,
  addInventory,
  deleteInventory,
  updateInventory,
  getInventory,
} from "../controllers/Inventory.controller.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

router.post("/add-supplier-bill", verifyToken, addSupplierBill);
router.delete("/delete-supplier-bill/:id", verifyToken, deleteSupplierBill);
router.put("/update-supplier-bill/:id", verifyToken, updateSupplierBill);
router.get("/get-supplier-bill", verifyToken, getSupplierBill);

// router.post("/add-supplier-payment", verifyToken, addSupplierPayment);
// router.delete(
//   "/delete-supplier-payment/:id",
//   verifyToken,
//   deleteSupplierPayment
// );
// router.put("/update-supplier-payment/:id", verifyToken, updateSupplierPayment);
// router.get("/get-supplier-payment", verifyToken, getSupplierPayment);

router.post(
  "/add-payment-to-supplier-bill",
  verifyToken,
  addPaymentTpSupplierBill
);

router.post("/add-inventory", verifyToken, addInventory);
router.delete("/delete-inventory/:id", verifyToken, deleteInventory);
router.put("/update-inventory/:id", verifyToken, updateInventory);
router.get("/get-inventory", verifyToken, getInventory);

export default router;
