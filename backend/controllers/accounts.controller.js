import { slackLogger } from "../middleware/webHook.js";
import expenseModal from "../models/accounts/expense.modal.js";
import incentiveModal from "../models/accounts/incentive.modal.js";
import miscIncomeModal from "../models/accounts/miscIncome.modal.js";
import labBillModal from "../models/billings&payments/labBill.modal.js";
import patientPaymentsModal from "../models/billings&payments/patientPayments.modal.js";
import pharmacyBillModal from "../models/billings&payments/pharmacyBill.modal.js";
import doctorModel from "../models/doctor.model.js";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import opdBillModal from "../models/inventory/opdBill.modal.js";
import supplierBillModal from "../models/inventory/supplierBill.modal.js";
import ipdRateModel from "../models/ipdRate.model.js";
import labReportModal from "../models/lab/labReport.modal.js";
import labTestModel from "../models/lab/labTest.model.js";
import newLabTestModal from "../models/lab/newLabTest.modal.js";
import nursingModel from "../models/nursing.model.js";
import opdModel from "../models/opd.model.js";
import opdRateModel from "../models/opdRate.model.js";
import otherServicesModel from "../models/otherServices.model.js";
import packagesModel from "../models/packages.model.js";
import patientModel from "../models/patient.model.js";
import PatientAdmissionModel from "../models/PatientAdmission.model.js";
import medicineModal from "../models/pharmacy/medicine.modal.js";
import servicesModel from "../models/services.model.js";
import visitingDoctorModel from "../models/visitingDoctor.model.js";
import { capitalize, formatDate } from "../utils/utilFunctions.js";
import { addDischargeSummary, patientAdmission } from "./ipd.controller.js";
import storeVendorBillModal from "../models/store/storeVendorBill.modal.js";
import returnMoneyModel from "../models/accounts/returnMoney.model.js";
import additionalServiceBillModal from "../models/additionalServiceBill.modal.js";
import nurseModel from "../models/roles/nurse.model.js";
import pharmacy from "../models/roles/pharmacy.model.js";
import store from "../models/roles/storeRole.model.js";
import laboratory from "../models/roles/laboratory.model.js";
import doctor from "../models/doctor.model.js";
import counter from "../models/roles/counter.model.js";
import hr from "../models/roles/hr.model.js";
import inventory from "../models/roles/inventory.model.js";
import admin from "../models/roles/admin.model.js";

export const getPaidBillsAccount = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
      status: "paid",
    };

    const [ipdBills, opdBills] = await Promise.all([
      ipdBillModal.find(query).lean(),
      opdBillModal.find(query).lean(),
    ]);

    ipdBills.forEach((bill) => {
      bill.type = "IPD";
    });
    opdBills.forEach((bill) => {
      bill.type = "OPD";
    });
    // Combine bills
    const bills = [...ipdBills, ...opdBills];

    // Initialize stats with default values
    const initialStats = {
      totalCharge: 0,
      totalDiscount: 0,
      totalDiscounted: 0,
      finalDiscount: 0,
      finalPrice: 0,
    };

    // Calculate statistics
    const stats = bills.reduce((acc, curr) => {
      acc.totalCharge += Number(curr.grandTotals.totalCharge) || 0;
      acc.totalDiscount += Number(curr.grandTotals.totalDiscount) || 0;
      acc.totalDiscounted += Number(curr.grandTotals.totalDiscounted) || 0;
      acc.finalDiscount += Number(curr.grandTotals.finalDiscount) || 0;
      acc.finalPrice += Number(curr.grandTotals.finalPrice) || 0;
      return acc;
    }, initialStats);

    // Respond with the data and stats
    res.status(200).json({
      success: true,
      data: bills,
      stats,
    });
  } catch (error) {
    console.error("Error in getPaidBillsAccount:", error);
    await slackLogger(
      "Error in getPaidBillsAccount:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPatientWisePaidBills = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
      status: "paid",
    };

    // Fetch IPD and OPD bills
    const [ipdBills, opdBills] = await Promise.all([
      ipdBillModal.find(query).populate("admissionId").lean(),
      opdBillModal.find(query).lean(),
    ]);

    // Add bill type and patient information
    const allBills = [];

    for (const bill of ipdBills) {
      const patient = await patientModel.findById(bill.admissionId?.patientId);

      allBills.push({
        ...bill,
        type: "IPD",
        patient: patient,
      });
    }

    for (const bill of opdBills) {
      const opd = await opdModel
        .findOne({ opdId: bill.opdId })
        .populate("patientId");

      allBills.push({
        ...bill,
        type: "OPD",
        patient: opd?.patientId,
      });
    }

    // Group bills by patient
    const patientStats = allBills.reduce((acc, curr) => {
      const patientName = curr.patient?.patientName || "Unknown Patient";
      if (!acc[patientName]) {
        acc[patientName] = {
          patientName: curr.patient?.patientName || "Unknown Patient",
          uhid: curr.patient?.uhid || "N/A",
          patientPaymentType: curr.patient?.paymentType || "N/A",
          totalPaid: 0,
          bills: [],
        };
      }

      acc[patientName].totalPaid += Number(curr.grandTotals.finalPrice) || 0;
      acc[patientName].bills.push({
        billNumber: curr.billNumber,
        date: curr.date,
        totalItems: curr.item.length,
        billFinalPrice: curr.grandTotals.finalPrice,
        billType: curr.type,
      });

      return acc;
    }, {});

    // Calculate overall totals
    const overallStats = {
      totalPatients: Object.keys(patientStats).length,
      totalBills: allBills.length,
      totalPaid: Object.values(patientStats).reduce(
        (sum, patient) => sum + patient.totalPaid,
        0
      ),
    };

    // Respond with data
    res.status(200).json({
      success: true,
      data: Object.values(patientStats),
      overallStats,
    });
  } catch (error) {
    console.error("Error in getPatientWisePaidBills:", error);
    await slackLogger(
      "Error in getPatientWisePaidBills:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getPatientDues = async (req, res) => {
  try {
    const admissionId = req.params.admissionId;
    console.log("admissionId", admissionId);

    if (!admissionId) {
      return res.status(400).json({
        success: false,
        message: "Please provide admissionId in params.",
      });
    }

    // Fetch the admission details and related patient
    const patientAdmission = await PatientAdmissionModel.findById(
      admissionId
    ).populate("patientId");
    if (!patientAdmission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found.",
      });
    }

    let payment = 0;

    const patientPayments = await patientPaymentsModal
      .findOne({ admissionId })
      .lean();

    if (patientPayments) {
      payment = patientPayments.transactions.reduce(
        (acc, curr) => acc + (curr.paymentAmount || 0),
        0
      );
    }

    // Fetch OPD details
    const opd = await opdModel
      .findOne({ patientId: patientAdmission.patientId._id })
      .lean();

    // Fetch IPD and OPD bills
    const ipdBills = await ipdBillModal.find({ admissionId }).lean();
    const opdBills = opd
      ? await opdBillModal.find({ opdId: opd.opdId }).lean()
      : [];

    // Combine the bills
    const bills = [...ipdBills, ...opdBills];

    // Reduce to calculate due stats
    const dueStats = bills.reduce((acc, curr) => {
      const date = curr.date.toDateString();

      // Initialize the date entry if it doesn't exist
      if (!acc[date]) {
        acc[date] = {
          date: curr.date,
          patientName: patientAdmission.patientId.patientName,
          uhid: patientAdmission.patientId.uhid,
          totalDue: 0,
        };
      }

      // Calculate payments made
      const payments = (curr.transactionHistory || []).reduce(
        (paymentAcc, payment) =>
          paymentAcc + (Number(payment.paymentAmount) || 0),
        0
      );

      // Update the total due for the date
      acc[date].totalDue += (curr.grandTotals.finalPrice || 0) - payments;

      return acc; // Important to return the accumulator
    }, {});

    // Send the response
    return res.status(200).json({
      success: true,
      message: "Due stats fetched successfully!",
      dueStats: Object.values(dueStats),
      previousPayments: patientPayments?.transactions || [],
      dueFromBills: Object.values(dueStats).reduce(
        (acc, curr) => acc + curr.totalDue,
        0
      ),
      previousPaymentTotal: payment || 0,
      totalDue:
        Object.values(dueStats).reduce((acc, curr) => acc + curr.totalDue, 0) -
        (payment || 0),
    });
  } catch (error) {
    console.error("Error in getPatientDues:", error);
    await slackLogger("Error in getPatientDues:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIpdOpdCollection = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    // Fetch IPD and OPD bills
    const [ipdBills, opdBills] = await Promise.all([
      ipdBillModal.find(query),
      opdBillModal.find(query),
    ]);

    // date wise profits of ipd and opd
    const ipdProfits = ipdBills.reduce((acc, curr) => {
      const date = curr.date.toDateString();
      acc[date] = acc[date] || 0;
      acc[date] += Number(curr.grandTotals.finalPrice) || 0;
      return acc;
    }, {});

    const opdProfits = opdBills.reduce((acc, curr) => {
      const date = curr.date.toDateString();
      acc[date] = acc[date] || 0;
      acc[date] += Number(curr.grandTotals.finalPrice) || 0;
      return acc;
    }, {});

    // Respond with the data and stats
    res.status(200).json({
      success: true,
      ipdProfits,
      opdProfits,
    });
  } catch (error) {
    console.error("Error in getIpdOpdCollection:", error);
    await slackLogger(
      "Error in getIpdOpdCollection:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIpdOpdDues = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
      status: "due",
    };

    // Fetch IPD and OPD bills
    const [ipdBills, opdBills] = await Promise.all([
      ipdBillModal.find(query).populate("admissionId").lean(),
      opdBillModal.find(query).lean(),
    ]);

    const dueStats = {};

    // Process IPD Bills
    for (const bill of ipdBills) {
      const patient = await patientModel
        .findById(bill.admissionId?.patientId)
        .select("patientName paymentType uhid");

      if (patient) {
        const username = patient.patientName || "Unknown Patient";

        if (!dueStats[username]) {
          dueStats[username] = {
            name: username,
            totalDue: 0,
            paymentType: patient.paymentType || "N/A",
            uhid: patient.uhid || "N/A",
          };
        }

        const payments = bill.transactionHistory.reduce(
          (acc, payment) => acc + (Number(payment.paymentAmount) || 0),
          0
        );

        dueStats[username].totalDue +=
          (bill.grandTotals?.finalPrice || 0) - payments;
      }
    }

    // Process OPD Bills
    for (const bill of opdBills) {
      const opd = await opdModel
        .findOne({ opdId: bill.opdId })
        .populate("patientId");

      if (opd?.patientId) {
        const username = opd.patientId.patientName || "Unknown Patient";

        if (!dueStats[username]) {
          dueStats[username] = {
            name: username,
            totalDue: 0,
            paymentType: opd.patientId.paymentType || "N/A",
            uhid: opd.patientId.uhid || "N/A",
          };
        }

        const payments = bill.transactionHistory.reduce(
          (acc, payment) => acc + (Number(payment.paymentAmount) || 0),
          0
        );

        dueStats[username].totalDue +=
          (bill.grandTotals?.finalPrice || 0) - payments;
      }
    }

    // Convert dueStats object to an array and sort by totalDue
    const sortedStats = Object.values(dueStats).sort(
      (a, b) => b.totalDue - a.totalDue
    );

    return res.status(200).json({
      message: "Due stats fetched successfully!",
      success: true,
      dueStats: sortedStats,
      totalDue: sortedStats.reduce((acc, curr) => acc + curr.totalDue, 0),
    });
  } catch (error) {
    console.error("Error in getIpdOpdDues:", error);
    await slackLogger("Error in getIpdOpdDues:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const billWiseDue = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
      status: "due",
    };

    // Fetch IPD and OPD bills
    const [ipdBills, opdBills] = await Promise.all([
      ipdBillModal.find(query).populate("admissionId").lean(),
      opdBillModal.find(query).lean(),
    ]);

    const bills = [...ipdBills, ...opdBills];

    const billWiseDues = bills.map(async (bill) => {
      const billType = bill.admissionId ? "IPD" : "OPD";
      let patient;
      if (billType === "IPD") {
        patient = await patientModel.findById(bill.admissionId.patientId);
      } else {
        const opd = await opdModel
          .findOne({ opdId: bill.opdId })
          .populate("patientId");
        patient = opd.patientId;
      }
      const patientName = patient ? patient.patientName : "Unknown Patient";
      const uhid = patient ? patient.uhid : "N/A";
      const payment = bill.transactionHistory.reduce(
        (acc, payment) => acc + (Number(payment.paymentAmount) || 0),
        0
      );

      return {
        billType,
        billNumber: bill.billNumber,
        date: bill.date,
        patientName,
        uhid,
        due: bill.grandTotals.finalPrice - payment,
        patientPaymentType: patient ? patient.paymentType : "N/A",
      };
    });

    const billWiseDuesResolved = await Promise.all(billWiseDues);

    return res.status(200).json({
      success: true,
      message: "Bill-wise dues fetched successfully!",
      items: billWiseDuesResolved,
      totalItems: billWiseDuesResolved.length,
      totalDue: billWiseDuesResolved.reduce(
        (acc, curr) => acc + (curr.due || 0),
        0
      ),
    });
  } catch (error) {
    console.error("Error in billWiseDue:", error);
    await slackLogger("Error in billWiseDue:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getModeWiseCollection = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    // Fetch IPD and OPD bills
    const [ipdBills, opdBills] = await Promise.all([
      ipdBillModal.find(query),
      opdBillModal.find(query),
    ]);

    // Combine all bills and calculate mode-wise collection
    const modeWiseCollection = ipdBills.concat(opdBills).reduce((acc, bill) => {
      bill.transactionHistory.forEach((transaction) => {
        const mode = transaction.paymentType || "Unknown";
        const paymentAmount = Number(transaction.paymentAmount) || 0;

        if (!acc[mode]) {
          acc[mode] = {
            name: mode,
            payment: 0,
          };
        }

        acc[mode].payment += paymentAmount;
      });
      return acc;
    }, {});

    // filter modes that have payment of zero
    Object.keys(modeWiseCollection).forEach((mode) => {
      if (modeWiseCollection[mode].payment === 0) {
        delete modeWiseCollection[mode];
      }
    });

    // Respond with the data and stats
    return res.status(200).json({
      success: true,
      items: Object.values(modeWiseCollection), // Convert to array if required
    });
  } catch (error) {
    console.error("Error in getModeWiseCollection:", error);
    await slackLogger(
      "Error in getModeWiseCollection:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const itemWiseCollection = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Query parameters
    const query = {
      date: { $gte: start, $lte: end },
    };

    const [ipdBills, opdBills, pharmacyBills, labBills, additionalServiceBill] =
      await Promise.all([
        ipdBillModal.find(query).sort({ date: -1 }).populate("admissionId").lean(),
        opdBillModal.find(query).sort({ date: -1 }).lean(),
        pharmacyBillModal.find(query).sort({ date: -1 }).populate("patientId").lean(),
        labBillModal.find(query).sort({ date: -1 }).populate("patientId").lean(),
        additionalServiceBillModal.find(query).sort({ date: -1 }).populate("patientId").lean(),
      ]);

    const pharmacyItems = await Promise.all(
      pharmacyBills.map(async (bill) => {
        return bill.item.map((item) => ({
          ...item,
          billNumber: bill.billNumber || "N/A",
          date: bill.date,
          billType: "Pharmacy",
          patientName: bill.patientId?.patientName || "Unknown Patient",
          uhid: bill.patientId?.uhid || "-",
          mobile: bill.patientId?.mobile || "-",
        }));
      })
    );

    const labItems = await Promise.all(
      labBills.map(async (bill) => {
        return bill.item.map((item) => ({
          ...item,
          billNumber: bill.billNumber || "N/A",
          date: bill.date,
          billType: "Lab",
          patientName: bill.patientId?.patientName || "Unknown Patient",
          uhid: bill.patientId?.uhid || "-",
          mobile: bill.patientId?.mobile || "-",
        }));
      })
    );

    // Resolve IPD items
    const ipdItems = await Promise.all(
      ipdBills.map(async (bill) => {
        const patient = await patientModel.findById(
          bill.admissionId?.patientId
        );
        return bill.item.map((item) => ({
          ...item,
          billNumber: bill.billNumber || "N/A",
          date: bill.date,
          billType: "IPD",
          patientName: patient?.patientName || "Unknown Patient",
          uhid: patient?.uhid || "-",
          mobile: patient?.mobile || "-",
        }));
      })
    );

    // Resolve OPD items
    const opdItems = await Promise.all(
      opdBills.map(async (bill) => {
        const opd = await opdModel
          .findOne({ opdId: bill.opdId })
          .populate("patientId");
        return bill.item.map((item) => ({
          ...item,
          billNumber: bill.billNumber || "N/A",
          date: bill.date,
          billType: "OPD",
          patientName: opd?.patientId?.patientName || "Unknown Patient",
          uhid: opd?.patientId?.uhid || "-",
          mobile: opd?.patientId?.mobile || "-",
        }));
      })
    );

    const additionalServiceItems = await Promise.all(
      additionalServiceBill.map(async (bill) => {
        return bill.item.map((item) => ({
          ...item,
          billNumber: bill.billNumber || "N/A",
          date: bill.date,
          itemCategory: "Additional Services",
          billType: "Additional Service",
          patientName: bill.patientId?.patientName || "Unknown Patient",
          uhid: bill.patientId?.uhid || "-",
          mobile: bill.patientId?.mobile || "-",
        }));
      })
    );

    // Flatten arrays
    const allItems = [
      ...ipdItems.flat(),
      ...opdItems.flat(),
      ...pharmacyItems.flat(),
      ...labItems.flat(),
      ...additionalServiceItems.flat(),
    ];

    // Reduce items into categories
    const reducedItems = allItems.reduce((acc, curr) => {
      if (!curr.itemCategory) {
        console.warn("Missing itemCategory for item:", curr);
        return acc; // Skip this item
      }

      const category =
        curr.itemCategory === "labTest"
          ? "lab test"
          : curr.itemCategory === "ipdRate"
          ? "ipd rate"
          : curr.itemCategory === "opdConsultation"
          ? "opd consultation"
          : curr.itemCategory === "opdRate"
          ? "opd rate"
          : curr.itemCategory === "visitingDoctor"
          ? "visiting doctor"
          : curr.itemCategory;

      if (!acc[category]) {
        acc[category] = {
          category,
          total: 0,
          count: 0,
          items: [],
        };
      }

      acc[category].items.push(curr);
      acc[category].total += Number(curr.totalCharge || 0);
      acc[category].count += 1;

      return acc;
    }, {});

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "Item-wise collection fetched successfully!",
      items: reducedItems,
      totalItems: allItems.length,
    });
  } catch (error) {
    console.error("Error in itemWiseCollection:", error);
    await slackLogger(
      "Error in itemWiseCollection:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIncomeReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    // Fetch IPD and OPD bills
    const [
      ipdBills,
      opdBills,
      miscIncome,
      labBills,
      pharmacyBills,
      supplierBills,
      additionalServiceBills,
    ] = await Promise.all([
      ipdBillModal.find(query).sort({ date: -1 }).populate("admissionId"),
      opdBillModal.find(query).sort({ date: -1 }),
      miscIncomeModal.find(query).sort({ date: -1 }),
      labBillModal.find(query).sort({ date: -1 }).populate("patientId"),
      pharmacyBillModal.find(query).sort({ date: -1 }).populate("patientId"),
      supplierBillModal
        .find({
          billDate: {
            $gte: start,
            $lte: end,
          },
        })
        .sort({ billDate: -1 }),
      additionalServiceBillModal
        .find(query)
        .sort({ date: -1 })
        .populate("patientId"),
    ]);

    // Process IPD bills
    const ipdReport = await Promise.all(
      ipdBills.map(async (bill) => {
        const patient = await patientModel.findById(
          bill.admissionId?.patientId
        );
        if (!patient) {
          return {
            date: bill.date,
            patientName: "Unknown",
            uhid: "Unknown",
            billNo: bill.billNo,
            mobile: "Unknown",
            referenceDoctor: "Unknown",
            mode: "Unknown",
            amount: bill.grandTotals?.finalPrice || 0,
            patientPaymentType: "Unknown",
            billType: "Unknown",
          };
        }
        const paymentModes = new Set(); // Initialize a Set to store unique payment types

        // Collect all unique payment modes from transactionHistory
        bill.transactionHistory.forEach((transaction) => {
          if (transaction.paymentType) {
            paymentModes.add(transaction.paymentType);
          }
        });

        const doctor = await doctorModel.findById(bill.admissionId.doctorId);

        return {
          date: bill.date,
          patientName: patient?.patientName || "Unknown",
          uhid: patient?.uhid || "Unknown",
          billNo: bill.billNo,
          mobile: patient?.mobile || "Unknown",
          referenceDoctor: doctor?.name || "Unknown",
          mode: Array.from(paymentModes).join(", ") || "Unknown", // Convert Set to array and join as a string
          amount: bill.grandTotals?.finalPrice || 0,
          patientPaymentType: patient?.paymentType || "Unknown",
          billType:
            bill.item[0].itemType === "labTest"
              ? "Lab Test"
              : capitalize(bill.item[0].itemType.toString()),
        };
      })
    );

    // Process OPD bills
    const opdReport = await Promise.all(
      opdBills.map(async (bill) => {
        const opd = await opdModel
          .findOne({ opdId: bill.opdId })
          .populate("patientId")
          .populate("appointment.doctor");
        const patient = opd.patientId;

        const paymentModes = new Set(); // Initialize a Set to store unique payment types

        // Collect all unique payment modes from transactionHistory
        bill.transactionHistory.forEach((transaction) => {
          if (transaction.paymentType) {
            paymentModes.add(transaction.paymentType);
          }
        });

        return {
          date: bill.date,
          patientName: patient.patientName,
          uhid: patient.uhid,
          billNo: bill.billNo,
          mobile: patient.mobile,
          referenceDoctor: opd.appointment.doctor.name || "Unknown",
          mode: Array.from(paymentModes).join(", ") || "Unknown", // Convert Set to array and join as a string
          amount: bill.grandTotals?.finalPrice || 0,
          patientPaymentType: patient?.paymentType || "Unknown",
          billType:
            bill.item[0].itemType === "labTest"
              ? "Lab Test"
              : capitalize(bill.item[0].itemType.toString()),
        };
      })
    );

    const processedLabBills = await Promise.all(
      labBills.map(async (bill) => {
        return {
          date: bill.date,
          patientName: bill.patientId.patientName,
          uhid: bill.patientId.uhid,
          billNumber: bill.billNumber,
          mobile: bill.patientId.mobile,
          prescribedByName: bill.prescribedByName,
          mode: bill.paymentInfo.paymentType,
          amount: bill.grandTotals.finalPrice,
          patientPaymentType: bill.patientId?.paymentType || "Unknown",
          billType: "Lab Test",
        };
      })
    );

    const processedPharmacyBills = await Promise.all(
      pharmacyBills.map(async (bill) => {
        return {
          date: bill.date,
          patientName: bill.patientId.patientName,
          uhid: bill.patientId.uhid,
          billNumber: bill.billNumber,
          mobile: bill.patientId.mobile,
          prescribedByName: bill.prescribedByName,
          mode: bill.paymentInfo.paymentType,
          amount: bill.grandTotals.finalPrice,
          patientPaymentType: bill.patientId?.paymentType || "Unknown",
          billType: "Pharmacy",
        };
      })
    );

    const processedSupplierBills = await Promise.all(
      supplierBills.map(async (bill) => {
        const paymentModes = new Set(); // Initialize a Set to store unique payment types

        // Collect all unique payment modes from transactionHistory
        bill.payments.forEach((transaction) => {
          if (transaction.transactionType) {
            paymentModes.add(transaction.transactionType);
          }
        });
        return {
          billDate: bill.billDate,
          supplierName: bill.supplierName,
          billNumber: bill.billNumber,
          supplierBillNumber: bill.supplierBillNumber,
          totalMed: bill.medicines.length,
          mode: Array.from(paymentModes).join(", ") || "Unknown", // Convert Set to array and join as a string
          amount: bill.totalAmount,
          billType: "Supplier",
        };
      })
    );

    const processedAdditionalServiceBills = await Promise.all(
      additionalServiceBills.map(async (bill) => {
        return {
          date: bill.date,
          patientName: bill.patientId.patientName,
          uhid: bill.patientId.uhid,
          billNumber: bill.billNumber,
          mobile: bill.patientId.mobile,
          prescribedByName: bill.prescribedByName,
          mode: bill.paymentInfo.paymentType,
          amount: bill.grandTotals.finalPrice,
          patientPaymentType: bill.patientId?.paymentType || "Unknown",
          billType: "Additional Service",
        };
      })
    );

    const report = {
      ipdReport: {
        items: ipdReport,
        total: ipdReport.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
      opdReport: {
        items: opdReport,
        total: opdReport.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
      miscReport: {
        items: miscIncome,
        total: miscIncome.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
      labReport: {
        items: processedLabBills,
        total: processedLabBills.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
      pharmacyReport: {
        items: processedPharmacyBills,
        total: processedPharmacyBills.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
      supplierReport: {
        items: processedSupplierBills,
        total: processedSupplierBills.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
      additionalServiceReport: {
        items: processedAdditionalServiceBills,
        total: processedAdditionalServiceBills.reduce(
          (acc, curr) => acc + (parseFloat(curr.amount) || 0),
          0
        ),
      },
    };

    return res.status(200).json({
      success: true,
      message: "Income report fetched successfully!",
      report,
    });
  } catch (error) {
    console.error("Error in getIncomeReport:", error);
    await slackLogger("Error in getIncomeReport:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

async function generateSixDigitExpense() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingReport = await expenseModal.findOne({
      expenseNo: randomNumber,
    });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const addExpense = async (req, res) => {
  try {
    req.body.expenseNo = await generateSixDigitExpense();
    const expense = new expenseModal(req.body);
    await expense.save();
    res.status(200).json({
      success: true,
      message: "Expense added successfully!",
      expense,
    });
  } catch (error) {
    console.error("Error in addExpense:", error);
    await slackLogger("Error in addExpense:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { expenseNo } = req.params;
    if (!expenseNo) {
      return res.status(400).json({
        success: false,
        message: "Please provide expenseNo in query parameters.",
      });
    }

    const deletedExpense = await expenseModal.findOneAndDelete({ expenseNo });
    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully!",
      deletedExpense,
    });
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    await slackLogger("Error in deleteExpense:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const editExpense = async (req, res) => {
  try {
    const expenseNo = req.params.expenseNo;
    if (!expenseNo) {
      return res.status(400).json({
        success: false,
        message: "Please provide expenseNo in query parameters.",
      });
    }

    const updatedExpense = await expenseModal.findOneAndUpdate(
      { expenseNo },
      req.body,
      {
        new: true,
      }
    );
    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found!",
        updatedExpense,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Expense updated successfully!",
      updatedExpense,
    });
  } catch (error) {
    console.error("Error in editExpense:", error);
    await slackLogger("Error in editExpense:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };
    const expenses = await expenseModal.find(query).sort({ date: -1 });

    const supplierBills = await supplierBillModal
      .find({
        billDate: {
          $gte: start,
          $lte: end,
        },
      })
      .sort({ billDate: -1 })
      .lean();

    const supplierBillExpense = supplierBills.reduce((acc, curr) => {
      acc += curr.payments.reduce(
        (interAcc, interCurr) => (interAcc += parseInt(interCurr.amount) || 0),
        0
      );
    }, 0);
    const storeVendorBills = await storeVendorBillModal
      .find(query)
      .sort({ date: -1 })
      .lean();

    const storeVendorBillExpense = storeVendorBills.reduce(
      (acc, curr) =>
        (acc += parseInt(curr.paymentInfo?.paymentAmount || 0) || 0),
      0
    );

    const models = {
      nurse: nurseModel,
      pharmacy: pharmacy,
      store: store,
      laboratory: laboratory,
      doctor: doctor,
      counter: counter,
      hr: hr,
      inventory: inventory,
      admin: admin,
    };

    // Fetch hrExpenses for each model
    const hrExpenses = await Promise.all(
      Object.keys(models).map(async (model) => {
        const data = await models[model]
          .find({
            "expenses.date": {
              $gte: start,
              $lte: end,
            },
          })
          .sort({ "expenses.date": -1 })
          .lean();
        console.log("data: ", data);

        return data.map((entry) =>
          entry.expenses
            .filter((exp) => exp.date <= end && exp.date >= start)
            .map((exp) => ({
              ...exp,
              name: entry.name, // Add staff name to each expense
              phone: entry.phone,
            }))
        );
      })
    );

    const hrExpensesTotal = hrExpenses
      .flat(2)
      .reduce(
        (acc, curr) =>
          (acc += parseFloat(curr.paymentInfo?.paymentAmount || 0) || 0),
        0
      );

    // console.log("hrExpenses: ", hrExpenses.flat(2));

    return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully!",
      items: expenses,
      totalExpense:
        expenses.reduce((acc, curr) => acc + (parseInt(curr.amount) || 0), 0) +
        (supplierBillExpense || 0) +
        (storeVendorBillExpense || 0) +
        (hrExpensesTotal || 0),
      supplierBills,
      storeVendorBills,
      hrExpenses: hrExpenses.flat(2).sort((a, b) => b.date - a.date),
    });
  } catch (error) {
    console.error("Error in getExpenses:", error);
    await slackLogger("Error in getExpenses:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addIncentive = async (req, res) => {
  try {
    const incentive = new incentiveModal(req.body);
    await incentive.save();
    res.status(200).json({
      success: true,
      message: "Incentive added successfully!",
      incentive,
    });
  } catch (error) {
    console.error("Error in addIncentive:", error);
    await slackLogger("Error in addIncentive:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const editIncentive = async (req, res) => {
  try {
    const { iId } = req.params;
    if (!iId) {
      return res.status(400).json({
        success: false,
        message: "Please provide iId in parameters.",
      });
    }
    const updatedIncentive = await incentiveModal.findOneAndUpdate(
      { _id: iId },
      req.body,
      {
        new: true,
      }
    );
    if (!updatedIncentive) {
      return res.status(404).json({
        success: false,
        message: "Incentive not found!",
        updatedIncentive,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Incentive updated successfully!",
      updatedIncentive,
    });
  } catch (error) {
    console.error("Error in editEncentive:", error);
    await slackLogger("Error in editEncentive:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteIncentive = async (req, res) => {
  try {
    const { iId } = req.params;
    if (!iId) {
      return res.status(400).json({
        success: false,
        message: "Please provide iId in parameters.",
      });
    }
    const deletedIncentive = await incentiveModal.findOneAndDelete({
      _id: iId,
    });
    if (!deletedIncentive) {
      return res.status(404).json({
        success: false,
        message: "Incentive not found!",
        deletedIncentive,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Incentive deleted successfully!",
      deletedIncentive,
    });
  } catch (error) {
    console.error("Error in deleteIncentive:", error);
    await slackLogger("Error in deleteIncentive:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIncentives = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await incentiveModal.countDocuments();
    let totalPages = 1;

    // Check if pagination is required
    if (page && limit) {
      pageSize = parseInt(limit) || 10;
      const currentPage = parseInt(page) || 1;
      skip = (currentPage - 1) * pageSize;
      totalPages = Math.ceil(countDocuments / pageSize);
    } else {
      pageSize = countDocuments; // Fetch all records if pagination is not provided
    }

    // Fetch incentives with optional pagination
    const incentives = await incentiveModal
      .find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    // Calculate total incentive amount
    const totalIncentive = incentives.reduce(
      (acc, curr) => acc + (parseInt(curr.amount) || 0),
      0
    );

    // Send response
    return res.status(200).json({
      success: true,
      message: "Incentives fetched successfully!",
      items: incentives,
      totalItems: countDocuments,
      totalPages,
      totalIncentive,
      currentPage: page ? parseInt(page) : 1,
    });
  } catch (error) {
    console.error("Error in getIncentives:", error);
    await slackLogger("Error in getIncentives:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const addMiscIncome = async (req, res) => {
  try {
    const miscIncome = new miscIncomeModal(req.body);
    await miscIncome.save();
    res.status(200).json({
      success: true,
      message: "Miscellaneous income added successfully!",
      miscIncome,
    });
  } catch (error) {
    console.error("Error in addMiscIncome:", error);
    await slackLogger("Error in addMiscIncome:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const editMiscIncome = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide _id in request body.",
      });
    }
    const updatedMiscIncome = await miscIncomeModal.findOneAndUpdate(
      { _id },
      req.body,
      {
        new: true,
      }
    );
    if (!updatedMiscIncome) {
      return res.status(404).json({
        success: false,
        message: "Miscellaneous income not found!",
        updatedMiscIncome,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Miscellaneous income updated successfully!",
      updatedMiscIncome,
    });
  } catch (error) {
    console.error("Error in editMiscIncome:", error);
    await slackLogger("Error in editMiscIncome:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteMiscIncome = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide _id in request body.",
      });
    }
    const deletedMiscIncome = await miscIncomeModal.findOneAndDelete({ _id });
    if (!deletedMiscIncome) {
      return res.status(404).json({
        success: false,
        message: "Miscellaneous income not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Miscellaneous income deleted successfully!",
      deletedMiscIncome,
    });
  } catch (error) {
    console.error("Error in deleteMiscIncome:", error);
    await slackLogger("Error in deleteMiscIncome:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getMiscIncome = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await miscIncomeModal.countDocuments();
    let totalPages = 1;

    // Check if pagination is required
    if (page && limit) {
      pageSize = parseInt(limit) || 10;
      const currentPage = parseInt(page) || 1;
      skip = (currentPage - 1) * pageSize;
      totalPages = Math.ceil(countDocuments / pageSize);
    } else {
      pageSize = countDocuments; // Fetch all records if pagination is not provided
    }

    const miscIncome = await miscIncomeModal
      .find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Miscellaneous income fetched successfully!",
      items: miscIncome,
      totalPages,
      totalItems: countDocuments,
      totalIncome: miscIncome.reduce(
        (acc, curr) => acc + (parseInt(curr.amount) || 0),
        0
      ),
    });
  } catch (error) {
    console.error("Error in getMiscIncome:", error);
    await slackLogger("Error in getMiscIncome:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//<<<<<<============== MIS ==============>>>>>>>>>>>>>>>

export const opdConsultantMIS = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      "appointment.date": {
        $gte: start,
        $lte: end,
      },
    };

    // Fetch OPD records
    const opds = await opdModel
      .find(query)
      .populate("patientId")
      .populate("appointment.doctor");

    if (!opds || opds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No OPD records found for the given date range.",
        items: [],
      });
    }

    const reducedOPD = {};

    for (const curr of opds) {
      const opdBill = await opdBillModal.findOne({ opdId: curr.opdId });
      if (!opdBill) continue; // Skip if no bill found

      const doctorName = curr.appointment?.doctor?.name || "Unknown Doctor";
      const paid = opdBill.transactionHistory.reduce((acc, curr) => {
        return acc + (Number(curr.paymentAmount) || 0);
      }, 0);

      if (!reducedOPD[doctorName]) {
        reducedOPD[doctorName] = {
          name: doctorName,
          total: 0,
          count: 0,
          items: [],
        };
      }

      reducedOPD[doctorName].items.push({
        appointmentDate: curr.appointment.date,
        opdId: curr.opdId,
        uhid: curr.patientId?.uhid || "N/A",
        patientName: curr.patientId?.patientName || "N/A",
        tpa: curr.patientId?.tpaCorporate || "N/A",
        total: Number(opdBill.grandTotals?.finalPrice || 0),
        discount: Number(opdBill.grandTotals?.totalDiscount || 0),
        paid: paid,
        due: Number(opdBill.grandTotals?.finalPrice || 0) - paid,
      });

      reducedOPD[doctorName].total += Number(
        opdBill.grandTotals?.finalPrice || 0
      );
      reducedOPD[doctorName].count += 1;
    }

    return res.status(200).json({
      success: true,
      message: "OPD Consultant MIS fetched successfully!",
      items: reducedOPD,
    });
  } catch (error) {
    console.error("Error in opdConsultantMIS:", error);
    await slackLogger("Error in opdConsultantMIS:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const opdCounter = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      "appointment.date": {
        $gte: start,
        $lte: end,
      },
    };
    const opds = await opdModel
      .find(query)
      .populate("patientId")
      .populate("appointment.department")
      .populate("appointment.doctor");

    // console.log("Fetched OPDs:", JSON.stringify(opds, null, 2));

    const reduceOPD = opds.reduce((acc, curr) => {
      // Safeguard for missing appointment or department
      const depName =
        curr?.appointment?.department?.name || "Unknown Department";
      if (!acc[depName]) {
        acc[depName] = {
          name: depName,
          count: 0,
          items: [],
        };
      }

      acc[depName].items.push({
        appointmentDate: curr?.appointment?.date || "N/A",
        opdId: curr?.opdId || "N/A",
        uhid: curr?.patientId?.uhid || "N/A",
        patientName: curr?.patientId?.patientName || "N/A",
        tpa: curr?.patientId?.tpaCorporate || "N/A",
        doctor: curr?.appointment?.doctor?.name || "Unknown Doctor",
      });

      acc[depName].count += 1;
      return acc;
    }, {}); // Provide an initial value for reduce

    return res.status(200).json({
      success: true,
      message: "OPD Counter MIS fetched successfully!",
      items: reduceOPD,
    });
  } catch (error) {
    console.error("Error in opdCounter:", error);
    await slackLogger("Error in opdCounter:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const labConsultant = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      registered: {
        $gte: start,
        $lte: end,
      },
    };
    const labReports = await labReportModal.find(query).populate("patientId");
    const reducedLabReports = labReports.reduce((acc, curr) => {
      const consultant = curr?.prescribedBy || "Unknown Consultant";
      if (!acc[consultant]) {
        acc[consultant] = {
          name: consultant,
          count: 0,
          items: [],
        };
      }

      acc[consultant].items.push({
        reportDate: curr.labTest.testDate || "N/A",
        reportId: curr._id || "N/A",
        uhid: curr.patientId?.uhid || "N/A",
        patientName: curr.patientId?.patientName || "N/A",
        tpa: curr.patientId?.tpaCorporate || "N/A",
        test: curr.testName || "N/A",
        status: curr.labTest.testStatus || "N/A",
      });

      acc[consultant].count += 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "Lab Consultant MIS fetched successfully!",
      items: reducedLabReports,
    });
  } catch (error) {
    console.error("Error in labConsultant:", error);
    await slackLogger("Error in labConsultant:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const investigationUsage = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    let query = {
      registered: {
        $gte: start,
        $lte: end,
      },
    };
    if (req.query.testName) {
      const regex = new RegExp(req.query.testName, "i");
      query = {
        "labTest.testName": { $regex: regex },
        registered: {
          $gte: start,
          $lte: end,
        },
      };
    }

    const labReports = await labReportModal.find(query).populate("patientId");

    const mapped = labReports.map((report) => {
      return {
        reportDate: report.labTest.testDate,
        reportId: report._id,
        reportNumber: report.reportNumber,
        testPrice: report.labTest.testPrice,
        uhid: report.patientId.uhid,
        patientName: report.patientId.patientName,
        tpa: report.patientId.tpaCorporate,
        test: report.labTest.testName,
        status: report.labTest.testStatus,
        doctorName: report.prescribedBy,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Investigation Usage fetched successfully!",
      items: mapped,
    });
  } catch (error) {
    console.error("Error in investigationUsage:", error);
    await slackLogger(
      "Error in investigationUsage:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const investigationCounter = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    let query = {
      registered: {
        $gte: start,
        $lte: end,
      },
    };
    if (req.query.testName) {
      const regex = new RegExp(req.query.testName, "i");
      query = {
        "labTest.testName": { $regex: regex },
        registered: {
          $gte: start,
          $lte: end,
        },
      };
    }
    const labReports = await labReportModal.find(query);

    const reduced = labReports.reduce((acc, curr) => {
      const testCategory = curr?.labTest?.testCategory || "Unknown";
      const testName = curr?.labTest?.testName || "Unknown Test";

      // Initialize the category if not already present
      if (!acc[testCategory]) {
        acc[testCategory] = {
          category: testCategory,
          count: 0,
          items: [],
        };
      }

      // Check if the test already exists in the category
      const existingTest = acc[testCategory].items.find(
        (test) => test.name === testName
      );

      if (existingTest) {
        // Increment the count for the existing test
        existingTest.count += 1;
      } else {
        // Add a new test entry
        acc[testCategory].items.push({
          name: testName,
          count: 1,
        });
      }

      // Increment the total count for the category
      acc[testCategory].count += 1;

      return acc;
    }, {}); // Initial value for reduce

    return res.status(200).json({
      success: true,
      message: "Investigation Counter fetched successfully!",
      items: reduced,
    });
  } catch (error) {
    console.error("Error in investigationCounter:", error);
    await slackLogger(
      "Error in investigationCounter:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const investigationOPD = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    let query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    const opdBills = await opdBillModal.find(query);
    const labItems = opdBills
      .map((bill) => {
        return bill.item.filter(
          (item) =>
            item.itemCategory === "labTest" || item.itemCategory === "lab test"
        );
      })
      .flat();

    return res.status(200).json({
      success: true,
      message: "Investigation OPD fetched successfully!",
      items: labItems,
    });
  } catch (error) {
    console.error("Error in investigationOPD:", error);
    await slackLogger("Error in investigationOPD:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

//<<<<<<============== NEW ==============>>>>>>>>>>>>>>>

export const pharmacyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    // Fetch IPD, OPD, and pharmacy bills
    const [ipdBills, opdBills, pharmacyBills] = await Promise.all([
      ipdBillModal
        .find(query)
        .populate({
          path: "admissionId",
          populate: {
            path: "patientId", // Populate patientId inside admissionId
            select: "patientName uhid paymentType", // Select the required fields from patientId
          },
        })
        .lean(),
      opdBillModal.find(query).lean(),
      pharmacyBillModal.find(query).populate("patientId").lean(),
    ]);

    // Process IPD Bills
    const processedIpdBills = ipdBills.flatMap((bill) =>
      bill.item
        .filter((item) => item.itemCategory === "pharmacy")
        .map((item) => ({
          ...item,
          billNumber: bill.billNumber,
          date: bill.date,
          patientId: bill.admissionId.patientId._id,
          patientName: bill.admissionId.patientId.patientName, // Access from populated patientId
          uhid: bill.admissionId.patientId.uhid, // Access from populated patientId
          paymentType: "credit", // Access from populated patientId
          category: "IPD",
        }))
    );

    // Pre-fetch OPD patients for better performance
    const opdPatientMap = await opdModel
      .find({ opdId: { $in: opdBills.map((bill) => bill.opdId) } })
      .populate("patientId")
      .lean()
      .then((patients) =>
        patients.reduce((acc, patient) => {
          acc[patient.opdId] = patient.patientId;
          return acc;
        }, {})
      );

    // Process OPD Bills
    const processedOpdBills = opdBills.flatMap((bill) =>
      bill.item
        .filter((item) => item.itemCategory === "pharmacy")
        .map((item) => ({
          ...item,
          billNumber: bill.billNumber,
          date: bill.date,
          patientId: opdPatientMap[bill.opdId]._id,
          patientName: opdPatientMap[bill.opdId]?.patientName,
          uhid: opdPatientMap[bill.opdId]?.uhid,
          paymentType: "credit",
          category: "OPD",
        }))
    );

    // Process Pharmacy Bills
    const processedPharmacyBills = pharmacyBills.flatMap((bill) =>
      bill.item.map((item) => ({
        ...item,
        billNumber: bill.billNumber,
        date: bill.date,
        patientId: bill.patientId._id,
        patientName: bill.patientId.patientName,
        uhid: bill.patientId.uhid,
        paymentType: bill.paymentInfo.paymentType,
        category: "Pharmacy",
      }))
    );

    const report = [
      ...processedIpdBills,
      ...processedOpdBills,
      ...processedPharmacyBills,
    ];

    const sortedReport = report.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    return res.status(200).json({
      success: true,
      message: "Pharmacy report fetched successfully!",
      report: sortedReport,
      totalItems: report.length,
      totalAmount: report.reduce(
        (acc, curr) => acc + (parseFloat(curr.totalCharge) || 0),
        0
      ),
    });
  } catch (error) {
    console.error("Error in pharmacyReport:", error);
    await slackLogger("Error in pharmacyReport:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const laboratoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    // Fetch IPD, OPD, and laboratory bills
    const [ipdBills, opdBills, labBills] = await Promise.all([
      ipdBillModal
        .find(query)
        .populate({
          path: "admissionId",
          populate: {
            path: "patientId", // Populate patientId inside admissionId
            select: "patientName uhid paymentType", // Select the required fields from patientId
          },
        })
        .lean(),
      opdBillModal.find(query).lean(),
      labBillModal.find(query).populate("patientId").lean(),
    ]);

    const processedIpdBills = ipdBills.flatMap((bill) =>
      bill.item
        .filter(
          (item) =>
            item.itemCategory === "labTest" || item.itemCategory === "lab test"
        )
        .map((item) => ({
          ...item,
          billNumber: bill.billNumber,
          date: bill.date,
          patientId: bill.admissionId.patientId._id,
          patientName: bill.admissionId.patientId.patientName, // Access from populated patientId
          uhid: bill.admissionId.patientId.uhid, // Access from populated patientId
          paymentType: "credit", // Access from populated patientId
          category: "IPD",
        }))
    );

    // Pre-fetch OPD patients for better performance
    const opdPatientMap = await opdModel
      .find({ opdId: { $in: opdBills.map((bill) => bill.opdId) } })
      .populate("patientId")
      .lean()
      .then((patients) =>
        patients.reduce((acc, patient) => {
          acc[patient.opdId] = patient.patientId;
          return acc;
        }, {})
      );

    // Process OPD Bills
    const processedOpdBills = opdBills.flatMap((bill) =>
      bill.item
        .filter(
          (item) =>
            item.itemCategory === "labTest" || item.itemCategory === "lab test"
        )
        .map((item) => ({
          ...item,
          billNumber: bill.billNumber,
          date: bill.date,
          patientId: opdPatientMap[bill.opdId]._id,
          patientName: opdPatientMap[bill.opdId]?.patientName,
          uhid: opdPatientMap[bill.opdId]?.uhid,
          paymentType: "credit",
          category: "OPD",
        }))
    );

    // Process Laboratory Bills
    const processedLabBills = labBills.flatMap((bill) =>
      bill.item.map((item) => ({
        ...item,
        billNumber: bill.billNumber,
        date: bill.date,
        patientId: bill.patientId._id,
        patientName: bill.patientId.patientName,
        uhid: bill.patientId.uhid,
        paymentType: bill.paymentInfo.paymentType,
        category: "Laboratory",
      }))
    );

    const report = [
      ...processedIpdBills,
      ...processedOpdBills,
      ...processedLabBills,
    ];

    const sortedReport = report.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    return res.status(200).json({
      success: true,
      message: "Laboratory report fetched successfully!",
      report: sortedReport,
      totalItems: processedLabBills.length,
      totalAmount: processedLabBills.reduce(
        (acc, curr) => acc + (parseFloat(curr.totalCharge) || 0),
        0
      ),
    });
  } catch (error) {
    console.error("Error in laboratoryReport:", error);
    await slackLogger("Error in laboratoryReport:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const returnMoney = async (req, res) => {
  try {
    const newReturnMoney = new returnMoneyModel(req.body);
    await newReturnMoney.save();
    return res.status(200).json({
      success: true,
      message: "Return Money added successfully!",
      returnMoney: newReturnMoney,
    });
  } catch (error) {
    console.error("Error in returnMoney:", error);
    await slackLogger("Error in returnMoney:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteReturnMoney = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide _id in request params.",
      });
    }
    const deletedReturnMoney = await returnMoneyModel.findOneAndDelete({ _id });
    if (!deletedReturnMoney) {
      return res.status(404).json({
        success: false,
        message: "Return Money not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Return Money deleted successfully!",
      deletedReturnMoney,
    });
  } catch (error) {
    console.error("Error in deleteReturnMoney:", error);
    await slackLogger("Error in deleteReturnMoney:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateReturnMoney = async (req, res) => {
  try {
    const { _id } = req.params;
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide _id in request params.",
      });
    }
    const updatedReturnMoney = await returnMoneyModel.findOneAndUpdate(
      { _id },
      req.body,
      {
        new: true,
      }
    );
    if (!updatedReturnMoney) {
      return res.status(404).json({
        success: false,
        message: "Return Money not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Return Money updated successfully!",
      updatedReturnMoney,
    });
  } catch (error) {
    console.error("Error in updateReturnMoney:", error);
    await slackLogger("Error in updateReturnMoney:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getReturnMoney = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Query parameters
    const query = {
      returnDate: { $gte: start, $lte: end },
    };
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await returnMoneyModel.countDocuments(query);
    let totalPages = 1;

    // Check if pagination is required
    if (page && limit) {
      pageSize = parseInt(limit) || 10;
      const currentPage = parseInt(page) || 1;
      skip = (currentPage - 1) * pageSize;
      totalPages = Math.ceil(countDocuments / pageSize);
    } else {
      pageSize = countDocuments; // Fetch all records if pagination is not provided
    }
    const returnMoney = await returnMoneyModel
      .find(query)
      .sort({ returnDate: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Return Money fetched successfully!",
      items: returnMoney,
      totalPages,
      totalItems: countDocuments,
      totalAmount: returnMoney.reduce(
        (acc, curr) => acc + (parseInt(curr.amount) || 0),
        0
      ),
    });
  } catch (error) {
    console.error("Error in getReturnMoney:", error);
    await slackLogger("Error in getReturnMoney:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getDayWiseHandoverReport = async (req, res) => {
  try {
    const { date, username, email, role } = req.query;

    // Validate presence of date
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Please provide date in query parameters.",
      });
    }

    // const now = new Date();
    // console.log(now.toLocaleTimeString()); // e.g., "4:30:45 PM"
    // Normalize date to remove time
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0); // Start of the day
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999); // End of the day

    // Validate date format
    if (isNaN(startOfDay.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
    }

    const additionalServiceColleciton = await additionalServiceBillModal
      .find({
        date: { $gte: startOfDay, $lte: endOfDay },
        ...(username && { user: username }),
        ...(email && { userEmail: email }),
        ...(role && { userRole: role }),
      })
      .populate("patientId")
      .lean();

    const processedAdditionalService = additionalServiceColleciton.map(
      (service) => {
        return {
          patientName: service.patientId?.patientName || "Unknown",
          uhid: service.patientId?.uhid || "Unknown",
          patientPaymentType: service.patientId?.paymentType || "Unknown",
          tpaCorporate: service.patientId?.tpaCorporate || "Unknown",
          items: service.item.map((item) => item.itemName).join(", "),
          paymentType: service.paymentInfo?.paymentType || "Unknown",
          amount: service.grandTotals?.finalPrice || 0,
        };
      }
    );

    const opdCollection = await opdBillModal
      .find({
        date: { $gte: startOfDay, $lte: endOfDay },
        ...(username && { user: username }),
        ...(email && { userEmail: email }),
        ...(role && { userRole: role }),
      })
      .lean();

    // console.log("OPD Collection:", opdCollection);

    const processedOpdCollection = await Promise.all(
      opdCollection.map(async (opd) => {
        const opdFound = await opdModel
          .findOne({ opdId: opd.opdId })
          .populate("patientId")
          .lean();
        if (!opdFound) return null;

        const patient = opdFound.patientId;
        return {
          patientName: patient?.patientName || "Unknown",
          uhid: patient?.uhid || "Unknown",
          patientPaymentType: patient?.paymentType || "Unknown",
          tpaCorporate: patient?.tpaCorporate || "Unknown",
          paymentType: opd.transactionHistory?.[0]?.paymentType || "Unknown",
          amount: opd.grandTotals?.finalPrice || 0,
        };
      })
    ).then((results) => results.filter(Boolean));

    // Query to find matching records
    const ipdCollection = await patientPaymentsModal
      .find({
        transactions: {
          $elemMatch: {
            date: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            user: username,
            userEmail: email,
            userRole: role,
          },
        },
      })
      .populate("patientId")
      .lean();

    // Process the result
    const ipdProcessedCollection = ipdCollection.flatMap((item) =>
      item.transactions
        .filter(
          (transaction) =>
            transaction.date >= startOfDay &&
            transaction.date <= endOfDay &&
            transaction.user === username &&
            transaction.userEmail === email &&
            transaction.userRole === role
        )
        .map((transaction) => ({
          date: transaction.date,
          patientName: item.patientId?.patientName || "Unknown",
          uhid: item.patientId?.uhid || "Unknown",
          patientPaymentType: item.patientId?.paymentType || "Unknown",
          tpaCorporate: item.patientId?.tpaCorporate || "Unknown",
          paymentType: transaction.paymentType,
          amount: transaction.paymentAmount,
        }))
    );

    const expenseCollection = await expenseModal.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      user: username,
      userEmail: email,
      userRole: role,
    });

    const processedExpense = expenseCollection.map((expense) => {
      return {
        particular: `${expense.details} (${expense.head})`,
        paymentMode: expense.paymentMode,
        amount: expense.amount,
        type: "Other Expense",
      };
    });

    const storeVendorBills = await storeVendorBillModal.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      ...(username && { user: username }),
      ...(email && { userEmail: email }),
      ...(role && { userRole: role }),
    });

    const processedStoreVendorBills = storeVendorBills.map((bill) => {
      return {
        particular: bill.vendorName,
        purchaseOrderNumber: bill.purchaseOrderNumber,
        date: bill.date,
        paymentMode: bill.paymentInfo.paymentType,
        amount: bill.paymentInfo.paymentAmount,
        type: "Store Vendor Bill",
      };
    });

    const supplierBills = await supplierBillModal.find({
      billDate: { $gte: startOfDay, $lte: endOfDay },
      ...(username && { user: username }),
      ...(email && { userEmail: email }),
      ...(role && { userRole: role }),
    });

    const processedSupplierBills = supplierBills.map((bill) => {
      return {
        particular: bill.supplierName,
        billNumber: bill.billNumber,
        date: bill.billDate,
        paymentMode: bill.payments[0]?.transactionType,
        amount: bill.payments[0]?.amount,
        type: "Pharmacy Supplier Bill",
      };
    });

    const models = {
      nurse: nurseModel,
      pharmacy: pharmacy,
      store: store,
      laboratory: laboratory,
      doctor: doctor,
      counter: counter,
      hr: hr,
      inventory: inventory,
      admin: admin,
    };

    // Fetch hrExpenses for each model
    const hrExpenses = await Promise.all(
      Object.keys(models).map(async (model) => {
        const data = await models[model]
          .find({
            "expenses.date": {
              $gte: startOfDay,
              $lte: endOfDay,
            },
          })
          .sort({ "expenses.date": -1 })
          .lean();
        // console.log("data: ", data);

        return data.map((entry) =>
          entry.expenses
            .filter((exp) => exp.date <= endOfDay && exp.date >= startOfDay)
            .map((exp) => ({
              ...exp,
              paymentMode: '-',
              particular: entry.name, // Add staff name to each expense
              phone: entry.phone,
              type: "HR Expense",
            }))
        );
      })
    );

    const hrExpensesTotal = hrExpenses
      .flat(2)
      .reduce(
        (acc, curr) =>
          (acc += parseFloat(curr.paymentInfo?.paymentAmount || 0) || 0),
        0
      );

    const pharmacySales = await pharmacyBillModal.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      ...(username && { user: username }),
      ...(email && { userEmail: email }),
      ...(role && { userRole: role }),
    });

    const laboratorySales = await labBillModal.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      ...(username && { user: username }),
      ...(email && { userEmail: email }),
      ...(role && { userRole: role }),
    });

    // console.log("laboratorySales: ", laboratorySales);

    const additionalServiceItems = additionalServiceColleciton
      .map((item) =>
        item.item.map((InterItem) => {
          return {
            ...InterItem,
            paymentType: InterItem.paymentInfo?.paymentType || "Unknown",
            amount: InterItem.grandTotals?.finalPrice || 0,
          };
        })
      )
      .flat(2);

    const dailyCashSummary = additionalServiceItems.reduce((acc, curr) => {
      if (!acc[curr.itemName]) {
        acc[curr.itemName] = {
          patientCount: 0,
          onlinePayments: 0,
          cashAmount: 0,
        };
      }

      acc[curr.itemName].quantity += 1;
      if (curr.paymentType === "cash") {
        acc[curr.itemName].cashAmount += curr.amount;
      } else {
        acc[curr.itemName].onlinePayments += curr.amount;
      }

      return acc;
    }, {});

    dailyCashSummary.opdCollection = {
      patientCount: processedOpdCollection.length,
      cashAmount: processedOpdCollection.reduce(
        (acc, curr) =>
          (acc += curr.paymentType === "cash" ? parseInt(curr.amount || 0) : 0),
        0
      ),
      onlinePayments: processedOpdCollection.reduce(
        (acc, curr) =>
          (acc += curr.paymentType !== "cash" ? parseInt(curr.amount || 0) : 0),
        0
      ),
    };

    dailyCashSummary.ipdCollection = {
      patientCount: ipdProcessedCollection.length,
      cashAmount: ipdProcessedCollection.reduce(
        (acc, curr) =>
          (acc += curr.paymentType === "cash" ? parseInt(curr.amount || 0) : 0),
        0
      ),
      onlinePayments: ipdProcessedCollection.reduce(
        (acc, curr) =>
          (acc += curr.paymentType !== "cash" ? parseInt(curr.amount || 0) : 0),
        0
      ),
    };

    dailyCashSummary.pharmacySales = {
      patientCount: pharmacySales.length,
      cashAmount: pharmacySales.reduce(
        (acc, curr) =>
          (acc += curr.paymentInfo.paymentType === "cash"
            ? parseInt(curr.grandTotals.finalPrice || 0)
            : 0),
        0
      ),
      onlinePayments: pharmacySales.reduce(
        (acc, curr) =>
          (acc += curr.paymentInfo.paymentType !== "cash"
            ? parseInt(curr.grandTotals.finalPrice || 0)
            : 0),
        0
      ),
    };

    dailyCashSummary.laboratorySales = {
      patientCount: laboratorySales.length,
      cashAmount: laboratorySales.reduce(
        (acc, curr) =>
          (acc += curr.paymentInfo.paymentType === "cash"
            ? parseInt(curr.grandTotals.finalPrice || 0)
            : 0),
        0
      ),
      onlinePayments: laboratorySales.reduce(
        (acc, curr) =>
          (acc += curr.paymentInfo.paymentType !== "cash"
            ? parseInt(curr.grandTotals.finalPrice || 0)
            : 0),
        0
      ),
    };

    const overallCollection =
      ipdProcessedCollection.reduce(
        (acc, curr) => (acc += parseInt(curr.amount || 0)),
        0
      ) +
      processedOpdCollection.reduce(
        (acc, curr) => (acc += parseInt(curr.amount || 0)),
        0
      ) +
      processedAdditionalService.reduce(
        (acc, curr) => (acc += parseInt(curr.amount || 0)),
        0
      );

    const overallExpense =
      processedExpense.reduce(
        (acc, curr) => (acc += parseInt(curr.amount || 0)),
        0
      ) +
      processedStoreVendorBills.reduce(
        (acc, curr) => (acc += parseInt(curr.amount || 0)),
        0
      ) +
      processedSupplierBills.reduce(
        (acc, curr) => (acc += parseInt(curr.amount || 0)),
        0
      ) +
      hrExpensesTotal;

    return res.status(200).json({
      success: true,
      message: "Day Wise Handover Report fetched successfully!",
      date: formatDate(startOfDay),
      ipdCollection: ipdProcessedCollection,
      expenses: [
        ...processedExpense,
        ...processedStoreVendorBills,
        ...processedSupplierBills,
        ...hrExpenses.flat(2),
      ],
      dailyCashSummary: Object.entries(dailyCashSummary).map(([key, value]) => ({
        category: key,
        ...value,
      })),
      opdCollection: processedOpdCollection,
      additionalServiceCollection: processedAdditionalService,
      overallCollection: overallCollection - overallExpense,
      expenseTotal: overallExpense,
    });
  } catch (error) {
    console.error("Error in getDayWiseHandoverReport:", error);
    await slackLogger(
      "Error in getDayWiseHandoverReport:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getCollection = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    const ipdCollection = await patientPaymentsModal
      .find({
        "transactions.date": {
          $gte: start,
          $lte: end,
        },
      })
      .sort({ "transactions.date": -1 })
      .populate("patientId")
      .lean();

    const opdCollection = await opdBillModal
      .find(query)
      .sort({ date: -1 })
      .lean();

    const pharmacyCollection = await pharmacyBillModal
      .find(query)
      .sort({ date: -1 })
      .populate("patientId")
      .lean();

    const laboratoryCollection = await labBillModal
      .find(query)
      .sort({ date: -1 })
      .populate("patientId")
      .lean();

    const additionalServiceCollection = await additionalServiceBillModal
      .find(query)
      .sort({ date: -1 })
      .populate("patientId")
      .lean();

    const processedIpdCollection = ipdCollection.flatMap((item) =>
      item.transactions
        .filter(
          (transaction) => transaction.date >= start && transaction.date <= end
        )
        .map((transaction) => ({
          category: "IPD",
          date: formatDate(transaction.date),
          patientName: item.patientId?.patientName || "Unknown",
          uhid: item.patientId?.uhid || "Unknown",
          mobile: item.patientId?.mobile || "Unknown",
          paymentType: transaction.paymentType,
          amount: transaction.paymentAmount,
        }))
    );

    const processedOpdCollection = await Promise.all(
      opdCollection.map(async (opd) => {
        const patient = await opdModel
          .findOne({ opdId: opd.opdId })
          .populate("patientId")
          .lean();
        // console.log("Patient:", patient);
        return {
          category: "OPD",
          date: formatDate(opd.date),
          patientName: patient?.patientId?.patientName || "Unknown",
          uhid: patient?.patientId?.uhid || "Unknown",
          mobile: patient?.patientId?.mobile || "Unknown",
          paymentType: opd.transactionHistory?.[0]?.paymentType || "Unknown",
          amount: opd.grandTotals?.finalPrice || 0,
        };
      })
    );

    const processedPharmacyBills = pharmacyCollection.flatMap((bill) => {
      return bill.item.map((item) => ({
        category: "Pharmacy",
        date: formatDate(bill.date),
        patientName: bill.patientId?.patientName || "Unknown",
        uhid: bill?.patientId?.uhid || "Unknown",
        mobile: bill?.patientId?.mobile || "Unknown",
        paymentType: bill.paymentInfo?.paymentType || "Unknown",
        amount: item.totalCharge || 0,
      }));
    });

    const processedLabBills = laboratoryCollection.flatMap((bill) => {
      return bill.item.map((item) => ({
        category: "Laboratory",
        date: formatDate(bill.date),
        patientName: bill.patientId?.patientName || "Unknown",
        uhid: bill?.patientId?.uhid || "Unknown",
        mobile: bill?.patientId?.mobile || "Unknown",
        paymentType: bill.paymentInfo?.paymentType || "Unknown",
        amount: item.totalCharge || 0,
      }));
    });

    const processedAdditionalService = additionalServiceCollection.flatMap(
      (bill) => {
        return bill.item.map((item) => ({
          category: "Additional Service",
          date: formatDate(bill.date),
          patientName: bill.patientId?.patientName || "Unknown",
          uhid: bill?.patientId?.uhid || "Unknown",
          mobile: bill?.patientId?.mobile || "Unknown",
          paymentType: bill.paymentInfo?.paymentType || "Unknown",
          amount: item.totalCharge || 0,
        }));
      }
    );

    return res.status(200).json({
      success: true,
      message: "Collection fetched successfully!",
      ipdCollection: processedIpdCollection,
      opdCollection: processedOpdCollection,
      pharmacyCollection: processedPharmacyBills,
      laboratoryCollection: processedLabBills,
      additionalServiceCollection: processedAdditionalService,
    });
  } catch (error) {
    console.error("Error in getCollection:", error);
    await slackLogger("Error in getCollection:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIpdReferralReport = async (req, res) => {
  try {
    const referrals = await PatientAdmissionModel.find({ isNewReferral: true })
      .sort({ admissionDate: -1 })
      .populate("patientId")
      .lean();
    const mappedReferrals = referrals.map((referral) => {
      return {
        patientName: referral.patientId?.patientName || "Unknown",
        uhid: referral.patientId?.uhid || "Unknown",
        referralBy: referral.referredBy || "Unknown",
        referredById: referral.referredById || "Unknown",
        admissionDate: formatDate(referral.admissionDate),
      };
    });

    return res.status(200).json({
      message: "Referral Report fetched successfully!",
      items: mappedReferrals,
      totalItems: mappedReferrals.length,
    });
  } catch (error) {
    console.error("Error in getReferralReport:", error);
    await slackLogger("Error in getReferralReport:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
