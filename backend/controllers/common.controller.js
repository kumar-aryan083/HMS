import { slackLogger } from "../middleware/webHook.js";
import bcrypt from "bcrypt";
import ipdRateModel from "../models/ipdRate.model.js";
import medicationModel from "../models/medication.model.js";
import opdRateModel from "../models/opdRate.model.js";
import packageModel from "../models/packages.model.js";
import patientTypeModel from "../models/patientType.model.js";
import servicesModel from "../models/services.model.js";
import otherServicesModel from "../models/otherServices.model.js";
import nurseModel from "../models/roles/nurse.model.js";
import pharmacy from "../models/roles/pharmacy.model.js";
import store from "../models/roles/storeRole.model.js";
import laboratory from "../models/roles/laboratory.model.js";
import doctor from "../models/doctor.model.js";
import counter from "../models/roles/counter.model.js";
import hr from "../models/roles/hr.model.js";
import inventory from "../models/roles/inventory.model.js";
import admin from "../models/roles/admin.model.js";
import mongoose from "mongoose";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import opdBillModal from "../models/inventory/opdBill.modal.js";
import labBillModal from "../models/billings&payments/labBill.modal.js";
import pharmacyBillModal from "../models/billings&payments/pharmacyBill.modal.js";
import additionalServiceBillModal from "../models/additionalServiceBill.modal.js";
import agentModal from "../models/agent.modal.js";
import otherRoleModal from "../models/roles/otherRole.modal.js";

export const getAllMedications = async (req, res) => {
  try {
    const medications = await medicationModel.find();
    res.status(200).json({ medications });
  } catch (err) {
    console.log("Error fetching medications:", err);
    await slackLogger("Error fetching medications", err.message, err, req);
    res
      .status(500)
      .json({ error: "Failed to fetch medications", message: err.message });
  }
};

export const addMedication = async (req, res) => {
  const { name } = req.body;
  try {
    const existingMedication = await medicationModel.findOne({ name });
    if (existingMedication) {
      return res.status(400).json({ error: "Medication already exists" });
    }

    const newMedication = new medicationModel({
      name,
    });

    await newMedication.save();
    res.status(201).json({ medication: newMedication });
  } catch (err) {
    console.log("Error adding medication:", err);
    await slackLogger("Error adding medication", err.message, err, req);
    res
      .status(500)
      .json({ error: "Failed to add medication", message: err.message });
  }
};

export const addPatientType = async (req, res) => {
  const { name, user, userEmail, userRole } = req.body;
  try {
    const existingType = await patientTypeModel.findOne({ name });
    if (existingType) {
      return res.status(400).json({ error: "Patient Type already exists" });
    }

    const newPatientType = new patientTypeModel({
      name,
      user,
      userEmail,
      userRole,
    });

    await newPatientType.save();
    res.status(201).json({ message: "Patient Type added.", newPatientType });
  } catch (error) {
    console.log("Error adding Patient Type:", error);
    await slackLogger("Error adding Patient Type", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add patient type", message: error.message });
  }
};

export const getPatientType = async (req, res) => {
  try {
    const regex = new RegExp(req.body.search, "i");
    const patientTypes = await patientTypeModel.find({
      name: { $regex: regex },
    });
    if (patientTypes.length === 0) {
      return res.status(404).json({ message: "No Patient type found." });
    }
    res.status(200).json({ message: "Patient type fetched.", patientTypes });
  } catch (error) {
    console.log("Error fetching Patient Type:", error);
    await slackLogger("Error fetching Patient Type", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deletePatientType = async (req, res) => {
  try {
    const { tId } = req.params;
    // console.log('hit')
    const patientType = await patientTypeModel.findById(tId);
    if (!patientType) {
      return res.status(404).json({
        success: false,
        message: "Patient Type not found",
      });
    }

    await patientTypeModel.findByIdAndDelete(tId);

    return res.status(200).json({
      success: true,
      message: "Patient Type deleted.",
      deletedType: patientType,
    });
  } catch (error) {
    console.error("Error deleting Patient Type:", error);
    await slackLogger("Error deleting Patient Type", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Patient Type",
    });
  }
};

export const editPatientType = async (req, res) => {
  try {
    const { tId } = req.params;
    const updates = req.body;

    const updatedType = await patientTypeModel.findByIdAndUpdate(tId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Patient Type not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "Patient Type updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing Patient type:", error); // Better error logging
    await slackLogger("Error editing Patient type", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit patient type",
    });
  }
};

export const addOpdRate = async (req, res) => {
  try {
    if (
      req.body.department &&
      !mongoose.Types.ObjectId.isValid(req.body.department)
    ) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const suffix = " (Consultation OPD)";
    const updatedName = `${req.body.name}${suffix}`;

    const newOpdRate = new opdRateModel({
      ...req.body,
      name: updatedName,
      department: req.body.department || null,
    });

    await newOpdRate.save();
    res.status(201).json({ message: "Opd Rate added.", newOpdRate });
  } catch (error) {
    console.log("Error adding Opd Rate:", error);
    await slackLogger("Error adding Opd Rate", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add Opd Rate", message: error.message });
  }
};

export const getOpdRate = async (req, res) => {
  try {
    const opdRates = await opdRateModel.find();
    if (opdRates.length === 0) {
      return res.status(404).json({ message: "No opdRates found." });
    }
    res.status(200).json({ message: "opdRates fetched.", opdRates });
  } catch (error) {
    console.log("Error fetching Opd Rate:", error);
    await slackLogger("Error fetching Opd Rate", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editOpdRate = async (req, res) => {
  try {
    const { rId } = req.params;
    const updates = { ...req.body };

    // Validate and sanitize the department field
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
    } else {
      updates.department = null; // Set to null if department is not provided or empty
    }

    const updatedType = await opdRateModel.findByIdAndUpdate(rId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Opd Rate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "Opd Rate updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing Opd Rate:", error); // Better error logging
    await slackLogger("Error editing Opd Rate", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit Opd Rate",
    });
  }
};

export const deleteOpdRate = async (req, res) => {
  try {
    const { rId } = req.params;
    // console.log('hit')
    const opdRate = await opdRateModel.findById(rId);
    if (!opdRate) {
      return res.status(404).json({
        success: false,
        message: "Opd Rate not found",
      });
    }

    await opdRateModel.findByIdAndDelete(rId);

    return res.status(200).json({
      success: true,
      message: "Opd Rate deleted.",
      deletedType: opdRate,
    });
  } catch (error) {
    console.error("Error deleting Opd Rate:", error);
    await slackLogger("Error deleting Opd Rate", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Opd Rate",
    });
  }
};

export const addIpdRate = async (req, res) => {
  try {
    if (
      req.body.department &&
      !mongoose.Types.ObjectId.isValid(req.body.department)
    ) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const newIpdRate = new ipdRateModel({
      ...req.body,
      department: req.body.department || null,
    });

    await newIpdRate.save();
    res.status(201).json({ message: "Ipd Rate added.", newIpdRate });
  } catch (error) {
    console.log("Error adding Ipd Rate:", error);
    await slackLogger("Error adding Ipd Rate", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add Ipd Rate", message: error.message });
  }
};

export const getIpdRate = async (req, res) => {
  try {
    const ipdRates = await ipdRateModel.find();
    if (ipdRates.length === 0) {
      return res.status(404).json({ message: "No ipd rates found." });
    }
    res.status(200).json({ message: "ipd rates fetched.", ipdRates });
  } catch (error) {
    console.log("Error fetching Ipd Rate:", error);
    await slackLogger("Error fetching Ipd Rate", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editIpdRate = async (req, res) => {
  try {
    const { rId } = req.params;
    const updates = { ...req.body };

    // Validate and sanitize the department field
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
    } else {
      updates.department = null; // Set to null if department is not provided or empty
    }

    const updatedType = await ipdRateModel.findByIdAndUpdate(rId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Ipd Rate not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "Ipd Rate updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing Ipd Rate:", error); // Better error logging
    await slackLogger("Error editing Ipd Rate", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit Ipd Rate",
    });
  }
};

export const deleteIpdRate = async (req, res) => {
  try {
    const { rId } = req.params;
    // console.log('hit')
    const ipdRate = await ipdRateModel.findById(rId);
    if (!ipdRate) {
      return res.status(404).json({
        success: false,
        message: "Ipd Rate not found",
      });
    }

    await ipdRateModel.findByIdAndDelete(rId);

    return res.status(200).json({
      success: true,
      message: "Ipd Rate deleted.",
      deletedType: ipdRate,
    });
  } catch (error) {
    console.error("Error deleting Ipd Rate:", error);
    await slackLogger("Error deleting Ipd Rate", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Ipd Rate",
    });
  }
};

export const addPackage = async (req, res) => {
  try {
    if (
      req.body.department &&
      !mongoose.Types.ObjectId.isValid(req.body.department)
    ) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const newPackage = new packageModel({
      ...req.body,
      department: req.body.department || null,
    });

    await newPackage.save();
    res.status(201).json({ message: "Package added.", newPackage });
  } catch (error) {
    console.log("Error adding Package:", error);
    await slackLogger("Error adding Package", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add Package", message: error.message });
  }
};

export const getPackage = async (req, res) => {
  try {
    const packages = await packageModel.find();
    if (packages.length === 0) {
      return res.status(404).json({ message: "No Packages found." });
    }
    res.status(200).json({ message: "Packages fetched.", packages });
  } catch (error) {
    console.log("Error fetching Package:", error);
    await slackLogger("Error fetching Package", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editPackage = async (req, res) => {
  try {
    const { pId } = req.params;
    const updates = { ...req.body };

    // Validate and sanitize the department field
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
    } else {
      updates.department = null; // Set to null if department is not provided or empty
    }

    const updatedType = await packageModel.findByIdAndUpdate(pId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "Package updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing Package:", error); // Better error logging
    await slackLogger("Error editing Package", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit Package",
    });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { pId } = req.params;
    // console.log('hit')
    const packages = await packageModel.findById(pId);
    if (!packages) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    await packageModel.findByIdAndDelete(pId);

    return res.status(200).json({
      success: true,
      message: "Package deleted.",
      deletedType: packages,
    });
  } catch (error) {
    console.error("Error deleting Package:", error);
    await slackLogger("Error deleting Package", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Package",
    });
  }
};

export const addService = async (req, res) => {
  try {
    if (
      req.body.department &&
      !mongoose.Types.ObjectId.isValid(req.body.department)
    ) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const newService = new servicesModel({
      ...req.body,
      department: req.body.department || null,
    });

    await newService.save();
    res.status(201).json({ message: "Service added.", newService });
  } catch (error) {
    console.log("Error adding Service:", error);
    await slackLogger("Error adding Service", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add Service", message: error.message });
  }
};

export const getService = async (req, res) => {
  try {
    const services = await servicesModel.find();
    if (services.length === 0) {
      return res.status(404).json({ message: "No Services found." });
    }
    res.status(200).json({ message: "services fetched.", services });
  } catch (error) {
    console.log("Error fetching Service:", error);
    await slackLogger("Error fetching Service", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editService = async (req, res) => {
  try {
    const { sId } = req.params;
    const updates = { ...req.body };

    // Validate and sanitize the department field
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
    } else {
      updates.department = null; // Set to null if department is not provided or empty
    }
    const updatedType = await servicesModel.findByIdAndUpdate(sId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "Service updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing Service:", error); // Better error logging
    await slackLogger("Error editing Service", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit Service",
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { sId } = req.params;
    // console.log('hit')
    const services = await servicesModel.findById(sId);
    if (!services) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await servicesModel.findByIdAndDelete(sId);

    return res.status(200).json({
      success: true,
      message: "Service deleted.",
      deletedType: services,
    });
  } catch (error) {
    console.error("Error deleting Service:", error);
    await slackLogger("Error deleting Service", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Service",
    });
  }
};
export const addOtherService = async (req, res) => {
  try {
    const newService = new otherServicesModel({
      ...req.body,
    });

    await newService.save();
    res.status(201).json({ message: "Other Service added.", newService });
  } catch (error) {
    console.log("Error adding other service:", error);
    await slackLogger("Error adding Service", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add Service", message: error.message });
  }
};

export const getOtherService = async (req, res) => {
  try {
    const services = await otherServicesModel.find();
    if (services.length === 0) {
      return res.status(404).json({ message: "No Services found." });
    }
    res.status(200).json({ message: "services fetched.", services });
  } catch (error) {
    console.log("Error fetching Service:", error);
    await slackLogger("Error fetching Service", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editOtherService = async (req, res) => {
  try {
    const { sId } = req.params;
    const updates = req.body;

    const updatedType = await otherServicesModel.findByIdAndUpdate(
      sId,
      updates,
      {
        new: true,
      }
    );

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "Other Service not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "Other Service updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing Service:", error); // Better error logging
    await slackLogger("Error editing Service", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit Service",
    });
  }
};

export const deleteOtherService = async (req, res) => {
  try {
    const { sId } = req.params;
    // console.log('hit')
    const services = await otherServicesModel.findById(sId);
    if (!services) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    await otherServicesModel.findByIdAndDelete(sId);

    return res.status(200).json({
      success: true,
      message: "Service deleted.",
      deletedService: services,
    });
  } catch (error) {
    console.error("Error deleting Service:", error);
    await slackLogger("Error deleting Service", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Service",
    });
  }
};

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
  other: otherRoleModal,
};

export const getStaffList = async (req, res) => {
  try {
    const totalItems = (
      await Promise.all(
        Object.values(models).map(async (model) => {
          // Check if the model has a "department" field
          const hasDepartmentField = model.schema.path("department");
          if (hasDepartmentField) {
            // Populate "department" if it exists in the schema
            return model.find().populate("department").select("-password");
          } else {
            // Otherwise, just fetch the documents without population
            return model.find().select("-password");
          }
        })
      )
    ).flat();

    const sortedItems = totalItems.sort((a, b) => b._id - a._id);

    return res.status(200).json({ message: "Staff fetched.", totalItems: sortedItems });
  } catch (error) {
    console.error("Error fetching Staff:", error);
    await slackLogger("Error fetching Staff", error.message, error, req);
    return res.status(500).json({ message: error.message });
  }
};

export const getFinalDiscountReport = async (req, res) => {
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
      "grandTotals.finalDiscount": { $gt: 0 },
      date: {
        $gte: start,
        $lte: end,
      },
      finalDiscountBy: { $exists: true, $ne: null }, // Ensure `finalDiscountBy` exists and is not null
      // finalDiscountById: { $exists: true, $ne: null }, // Ensure `finalDiscountById` exists and is not null
    };

    const itemToModelMap = {
      ipdBillModal: ipdBillModal,
      opdBillModal: opdBillModal,
      labBillModal: labBillModal,
      pharmacyBillModal: pharmacyBillModal,
      additionalServiceBillModal: additionalServiceBillModal,
    };

    const totalItems = (
      await Promise.all(
        Object.entries(itemToModelMap).map(async ([modelName, model]) => {
          const items = await model
            .find(query)
            .select(
              "user userEmail userRole finalDiscountBy grandTotals date"
            );
          return items.map((item) => ({
            ...item.toObject(), // Ensure we return plain objects
            category:
              modelName === "labBillModal"
                ? "Lab"
                : modelName === "pharmacyBillModal"
                ? "Pharmacy"
                : modelName === "additionalServiceBillModal"
                ? "Additional Service"
                : modelName === "opdBillModal"
                ? "OPD"
                : "IPD",
          }));
        })
      )
    ).flat();

    // Return an appropriate response
    if (totalItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No records found for the given date range.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Final Discount Report fetched.",
      totalItems: totalItems.sort((a, b) => b.date - a.date),
    });
  } catch (error) {
    console.error("Error fetching Final Discount Report:", error);
    await slackLogger(
      "Error fetching Final Discount Report",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const staffAttendence = async (req, res) => {
  try {
    const { staffRole, staffId, date, status, note } = req.body;

    // Validate input
    if (!staffRole || !staffId || !date || !status) {
      return res.status(400).json({
        message: "Staff Role, staff ID, date, and status are required.",
      });
    }

    // Map the model from the provided staffRole
    const model = models[staffRole];
    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid Staff Role: ${staffRole}` });
    }

    // Find the staff by ID
    const staff = await model.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }

    // Check if attendance for the given date exists
    const existingAttendance = staff.attendance.find(
      (att) =>
        att.date.toISOString().split("T")[0] ===
        new Date(date).toISOString().split("T")[0]
    );

    if (existingAttendance) {
      // Update the existing attendance entry
      existingAttendance.status = status;
      if (status === "Leave") {
        existingAttendance.note = note || "No reason provided"; // Add the leave note
      }
    } else {
      // Add a new attendance entry
      staff.attendance.push({
        date: new Date(date),
        status,
        note: status === "Leave" ? note || "No reason provided" : undefined, // Add note only for leave
      });
    }

    // Save the updated staff document
    await staff.save();
    return res
      .status(200)
      .json({ message: "Attendance updated successfully." });
  } catch (error) {
    console.error("Error marking attendance:", error);
    await slackLogger("Error marking attendance", error.message, error, req);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getStaffAttendance = async (req, res) => {
  try {
    const { staffRole, staffId, month } = req.query;

    // Validate input
    if (!staffRole || !staffId || !month) {
      return res
        .status(400)
        .json({ message: "Staff role, staff ID, and month are required." });
    }

    // Extract year and month from the "YYYY-MM" format
    const [year, monthString] = month.split("-");
    const yearNumber = parseInt(year, 10);
    const monthNumber = parseInt(monthString, 10) - 1; // Convert to zero-based month

    if (
      isNaN(yearNumber) ||
      isNaN(monthNumber) ||
      monthNumber < 0 ||
      monthNumber > 11
    ) {
      return res
        .status(400)
        .json({ message: "Invalid month format. Use YYYY-MM." });
    }

    // Get the model for the staff role
    const model = models[staffRole];
    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid staff role: ${staffRole}` });
    }

    // Fetch the staff object
    const staffObject = await model.findById(staffId).lean();
    if (!staffObject) {
      return res.status(404).json({ message: "Staff not found." });
    }

    // Check if attendance exists
    if (!staffObject.attendance || !Array.isArray(staffObject.attendance)) {
      return res.status(200).json({ monthAttendance: [] });
    }

    // Filter attendance by the specified year and month
    const monthAttendance = staffObject.attendance.filter((att) => {
      const attDate = new Date(att.date);
      return (
        attDate.getFullYear() === yearNumber &&
        attDate.getMonth() === monthNumber
      );
    });

    return res
      .status(200)
      .json({ message: "Attendance fetched successfully!", monthAttendance });
  } catch (error) {
    console.error("Error fetching staff attendance:", error);
    await slackLogger(
      "Error fetching staff attendance",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error." });
  }
};

const staffAndAgentModels = {
  nurse: nurseModel,
  pharmacy: pharmacy,
  store: store,
  laboratory: laboratory,
  doctor: doctor,
  counter: counter,
  hr: hr,
  inventory: inventory,
  admin: admin,
  agent: agentModal,
};

async function generateSixDigitStaffExpense(model) {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingReport = await model.findOne({
      "expenses.expenseNumber": randomNumber,
    });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const staffExpenses = async (req, res) => {
  try {
    const { staffRole, staffId, type, date, amount, note } = req.body;

    // Validate input
    if (!staffRole || !staffId || !date || !amount || !type) {
      return res.status(400).json({
        message:
          "Staff Role, staff ID, date, amount, and category are required.",
      });
    }

    // Map the model from the provided staffRole
    const model = staffAndAgentModels[staffRole];
    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid model name: ${staffRole}` });
    }

    // Find the staff by ID
    const staff = await model.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }

    // Check if expenses field exists, if not, initialize it
    if (!staff.expenses) {
      staff.expenses = [];
    }

    const number = await generateSixDigitStaffExpense(model);

    // Add a new expense entry
    staff.expenses.push({
      expenseNumber: number,
      type: type || "Other",
      date: new Date(date),
      amount,
      note: note || "No additional details provided",
    });

    // Save the updated staff document
    await staff.save();
    return res.status(200).json({
      message: "Expense added successfully.",
      data: staff.expenses.find((exp) => exp.expenseNumber == number),
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    await slackLogger("Error adding expense", error.message, error, req);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteStaffExpense = async (req, res) => {
  try {
    const { staffRole, staffId, expenseNumber } = req.body;
    const model = staffAndAgentModels[staffRole];
    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid model name: ${staffRole}` });
    }
    const oldStaff = await model.findById(staffId).select("expenses");
    const staff = await model.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }
    const expenseIndex = staff.expenses.findIndex((exp) => {
      return exp.expenseNumber === expenseNumber;
    });
    if (expenseIndex === -1) {
      return res.status(404).json({ message: "Expense not found." });
    }
    staff.expenses.splice(expenseIndex, 1);
    await staff.save();
    return res.status(200).json({
      message: "Expense deleted successfully.",
      data: oldStaff.expenses[expenseIndex],
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    await slackLogger("Error deleting expense", error.message, error, req);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const editStaffExpense = async (req, res) => {
  try {
    const { staffRole, staffId, expenseNumber, type, date, amount, note } =
      req.body;
    const model = staffAndAgentModels[staffRole];
    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid model name: ${staffRole}` });
    }
    const staff = await model.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }
    const expenseIndex = staff.expenses.findIndex((exp) => {
      return exp.expenseNumber === expenseNumber;
    });
    if (expenseIndex === -1) {
      return res.status(404).json({ message: "Expense not found." });
    }
    staff.expenses[expenseIndex].type = type || "Other";
    staff.expenses[expenseIndex].date = new Date(date);
    staff.expenses[expenseIndex].amount = amount;
    staff.expenses[expenseIndex].note =
      note || "No additional details provided";
    await staff.save();
    return res.status(200).json({
      message: "Expense edited successfully.",
      data: staff.expenses[expenseIndex],
    });
  } catch (error) {
    console.error("Error editing expense:", error);
    await slackLogger("Error editing expense", error.message, error, req);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getStaffExpenses = async (req, res) => {
  try {
    const { staffRole, staffId } = req.query;
    const model = staffAndAgentModels[staffRole];
    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid model name: ${staffRole}` });
    }
    const staff = await model.findById(staffId);
    if (!staff) {
      return res.status(404).json({ message: "Staff not found." });
    }
    return res.status(200).json({
      message: "Expenses fetched successfully!",
      expenses: staff.expenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    await slackLogger("Error fetching expenses", error.message, error, req);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const editStaff = async (req, res) => {
  try {
    const { staffRole, staffId } = req.params;
    const updates = req.body;
    const model = models[staffRole];

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    if (!model) {
      return res
        .status(400)
        .json({ message: `Invalid Staff Role: ${staffRole}` });
    }
    const updatedStaff = await model.findByIdAndUpdate(
      staffId,
      { ...updates, password: hashedPassword },
      {
        new: true,
      }
    );

    if (!updatedStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found.",
      });
    }
    return res.status(200).json({ message: "Staff updated.", updatedStaff });
  } catch (error) {
    console.error("Error editing staff:", error);
    await slackLogger("Error editing staff", error.message, error, req);
    return res.status(500).json({ message: "Internal server error." });
  }
};
