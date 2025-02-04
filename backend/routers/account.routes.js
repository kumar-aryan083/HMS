import express from "express";
import { verifyToken } from "../verifyToken.js";
import {
  getPaidBillsAccount,
  getIpdOpdCollection,
  getIpdOpdDues,
  getModeWiseCollection,
  getIncomeReport,
  addExpense,
  deleteExpense,
  editExpense,
  getExpenses,
  addIncentive,
  editIncentive,
  deleteIncentive,
  getIncentives,
  addMiscIncome,
  editMiscIncome,
  deleteMiscIncome,
  getMiscIncome,
  opdConsultantMIS,
  itemWiseCollection,
  opdCounter,
  labConsultant,
  investigationUsage,
  investigationCounter,
  investigationOPD,
  billWiseDue,
  getPatientWisePaidBills,
  getPatientDues,
  pharmacyReport,
  laboratoryReport,
  returnMoney,
  deleteReturnMoney,
  updateReturnMoney,
  getReturnMoney,
  getDayWiseHandoverReport,
  getCollection,
  getIpdReferralReport,
} from "../controllers/accounts.controller.js";

const router = express.Router();

router.get("/get-paid-bills-account", getPaidBillsAccount);
router.get("/get-patient-wise-paid-bills", getPatientWisePaidBills);
router.get("/get-account-collection", getIpdOpdCollection);
router.get("/get-account-dues", getIpdOpdDues);
router.get("/get-mode-wise-collection", getModeWiseCollection);
router.get("/get-income-report", getIncomeReport);
router.get("/get-item-wise-collection", itemWiseCollection);
router.get("/get-bill-wise-due", billWiseDue);

router.post("/add-expense", addExpense);
router.delete("/delete-expense/:expenseNo", deleteExpense);
router.put("/edit-expense/:expenseNo", editExpense);
router.get("/get-expenses", getExpenses);

router.post("/add-incentive", addIncentive);
router.put("/edit-incentive/:iId", editIncentive);
router.delete("/delete-incentive/:iId", deleteIncentive);
router.get("/get-incentives", getIncentives);

router.post("/add-misc-income", addMiscIncome);
router.put("/edit-misc-income/:_id", editMiscIncome);
router.delete("/delete-misc-income/:_id", deleteMiscIncome);
router.get("/get-misc-income", getMiscIncome);
router.get("/get-patient-dues/:admissionId", getPatientDues);

//=========== MIS

router.get("/opd-consultant-mis", opdConsultantMIS);
router.get("/opd-counter-mis", opdCounter);
router.get("/lab-consultant-mis", labConsultant);
router.get("/investigation-usage-mis", investigationUsage);
router.get("/investigation-counter-mis", investigationCounter);
router.get("/investigation-opd-mis", investigationOPD);

router.get("/pharmacy-report", pharmacyReport);
router.get("/laboratory-report", laboratoryReport);

//=========== Return Money
router.post("/return-money", verifyToken, returnMoney);
router.get("/get-return-money", getReturnMoney);
router.put("/update-return-money/:_id", verifyToken, updateReturnMoney);
router.delete("/delete-return-money/:_id", verifyToken, deleteReturnMoney);

router.get("/get-day-wise-handover-report", getDayWiseHandoverReport);
router.get("/get-collection", getCollection);
router.get("/get-ipd-referral-report", getIpdReferralReport);

export default router;
