import express from "express";
import {
  addAdditionalService,
  updateAdditionalService,
  deleteAdditionalService,
  getAdditionalServices,
  addAdditionalServiceBill,
  editAdditionalServiceBill,
  deleteAdditionalServiceBill,
  getAdditionalServiceBills,
  searchAdditionalServices,
} from "../controllers/additionalServices.controller.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

router.post("/add-additional-service", verifyToken, addAdditionalService);
router.put(
  "/update-additional-service/:id",
  verifyToken,
  updateAdditionalService
);
router.delete(
  "/delete-additional-service/:id",
  verifyToken,
  deleteAdditionalService
);
router.get("/get-additional-services", verifyToken, getAdditionalServices);
router.post(
  "/add-additional-service-bill",
  verifyToken,
  addAdditionalServiceBill
);
router.put(
  "/edit-additional-service-bill/:id",
  verifyToken,
  editAdditionalServiceBill
);
router.delete(
  "/delete-additional-service-bill/:id",
  verifyToken,
  deleteAdditionalServiceBill
);
router.get(
  "/get-additional-service-bills",
  verifyToken,
  getAdditionalServiceBills
);
router.get(
  "/search-additional-services",
  verifyToken,
  searchAdditionalServices
);

export default router;
