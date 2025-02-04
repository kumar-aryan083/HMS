import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";
import departmentModel from "../models/department.model.js";
import { getNextUHID } from "../utils/uhidGenerator.js";
import appointmentModel from "../models/appointment.model.js";
import PatientAdmissionModel from "../models/PatientAdmission.model.js";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import { slackLogger } from "../middleware/webHook.js";
import wingModel from "../models/wing.model.js";
import patientPaymentsModal from "../models/billings&payments/patientPayments.modal.js";
import roomModel from "../models/room.model.js";
import labReportModal from "../models/lab/labReport.modal.js";
import medicineModal from "../models/pharmacy/medicine.modal.js";
import pharmacyBillModal from "../models/billings&payments/pharmacyBill.modal.js";
import labBillModal from "../models/billings&payments/labBill.modal.js";
import additionalServiceBillModal from "../models/additionalServiceBill.modal.js";
import opdBillModal from "../models/inventory/opdBill.modal.js";
import opdModel from "../models/opd.model.js";

export const patientRegister = async (req, res) => {
  try {
    // console.log(req.body)
    const existingPatient = await patientModel.findOne({
      mobile: req.body.mobile,
    });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: "Patient with this mobile already exists.",
      });
    }

    req.body.patientType = req.body.patientType?.trim() || null;

    const uhid = await getNextUHID();
    const newPatient = new patientModel({ ...req.body, uhid });
    await newPatient.save();
    if (newPatient) {
      return res.status(200).json({
        success: true,
        message: "Patient registered successfully.",
        newPatient,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to register patient.",
      });
    }
  } catch (error) {
    console.error("Error registering patient:", error);
    await slackLogger("Error registering patient", error.message, error, req);
    return res.status(500).json({ message: "Server error!" });
  }
};

export const patientList = async (req, res) => {
  try {
    const { name, fromDate, toDate } = req.query; // Get query parameters from the request
    const filter = {};

    // Filter by patient name if provided
    if (name) {
      filter.patientName = { $regex: name, $options: "i" }; // Case insensitive search
    }

    // Filter by date range if provided
    if (fromDate && toDate) {
      const parsedFromDate = new Date(fromDate);
      const parsedToDate = new Date(toDate);

      // Validate the parsed dates
      if (isNaN(parsedFromDate) || isNaN(parsedToDate)) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format.",
        });
      }

      const start = new Date(parsedFromDate); // Start of the fromDate
      const end = new Date(parsedToDate); // End of the toDate
      end.setDate(end.getDate() + 1); // Set to the next day

      filter.createdAt = { $gte: start, $lt: end }; // Filter patients within the date range
    }

    const patientDetails = await patientModel
      .find(filter)
      .sort({ createdAt: -1 })
      .populate("patientType"); // Find patients based on the filter

    if (patientDetails.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Patient list fetched.",
        patientDetails,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No patients found.",
      });
    }
  } catch (error) {
    console.error("Error fetching patient list:", error);
    await slackLogger("Error fetching patient list", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Error fetching patient list.",
    });
  }
};

export const allPatients = async (req, res) => {
  try {
    const patients = await patientModel.find().sort({ _id: -1 });

    // Check if no patients are found
    if (!patients.length) {
      return res.status(404).json({
        success: false,
        message: "No patients found.",
      });
    }

    // Send the patients as a response
    res.status(200).json({
      success: true,
      message: "Patients fetched successfully.",
      patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    await slackLogger("Error fetching patients", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients.",
    });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const deleted = await patientModel.findByIdAndDelete(req.params.pId);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Unable to delete the patient",
      });
    }

    const deletedPatientAdmissions = await PatientAdmissionModel.find({
      patientId: req.params.pId,
    }).populate("wardHistory.roomId");

    // Delete admissions and handle room statuses
    if (deletedPatientAdmissions.length > 0) {
      for (const admission of deletedPatientAdmissions) {
        const lastWardHistory = admission.wardHistory.pop();
        if (lastWardHistory) {
          const previousRoom = await roomModel.findById(
            lastWardHistory.roomId._id
          );
          if (previousRoom) {
            const previousBed = previousRoom.beds.find(
              (b) => b.bedName === lastWardHistory.bedName
            );
            if (previousBed) {
              previousBed.isOccupied = false;
              await previousRoom.save();
            }
          }
        }
      }
      await PatientAdmissionModel.deleteMany({
        patientId: req.params.pId,
      });
    }

    // Delete appointments and update doctors
    const deletedAppointments = await appointmentModel.find({
      patient: req.params.pId,
    });

    for (const appointment of deletedAppointments) {
      const doctor = await doctorModel.findByIdAndUpdate(
        appointment.doctor,
        { $pull: { appointments: appointment._id } },
        { new: true }
      );
      if (!doctor) {
        console.error(`Doctor not found for appointment: ${appointment._id}`);
      }
    }
    await appointmentModel.deleteMany({ patient: req.params.pId });

    // Delete IPD bills and regain stock
    const deletedIpdBills = await ipdBillModal.find({
      admissionId: { $in: deletedPatientAdmissions.map((a) => a._id) },
    });

    for (const bill of deletedIpdBills) {
      for (const item of bill.item) {
        if (item.itemType.toLowerCase() === "pharmacy" && item.itemId) {
          const medicine = await medicineModal.findById(item.itemId);
          if (medicine) {
            medicine.stockQuantity += parseInt(item.quantity, 10);
            await medicine.save();
          }
        }
      }
      await labReportModal.deleteMany({ billNumber: bill.billNumber });
    }
    await ipdBillModal.deleteMany({
      admissionId: { $in: deletedPatientAdmissions.map((a) => a._id) },
    });

    // Handle pharmacy bills
    const deletedPharmacyBills = await pharmacyBillModal.find({
      patientId: req.params.pId,
    });

    for (const bill of deletedPharmacyBills) {
      for (const item of bill.item) {
        if (item.itemId) {
          const medicine = await medicineModal.findById(item.itemId);
          if (medicine) {
            medicine.stockQuantity += parseInt(item.quantity, 10);
            await medicine.save();
          }
        }
      }
    }
    await pharmacyBillModal.deleteMany({ patientId: req.params.pId });

    // Handle lab bills and reports
    const deletedLabBills = await labBillModal.find({
      patientId: req.params.pId,
    });

    for (const bill of deletedLabBills) {
      await labReportModal.deleteMany({ billNumber: bill.billNumber });
    }
    await labBillModal.deleteMany({ patientId: req.params.pId });

    // Delete patient payments
    await patientPaymentsModal.deleteMany({
      $or: [
        { patientId: req.params.pId },
        { admissionId: { $in: deletedPatientAdmissions.map((a) => a._id) } },
      ],
    });

    // Delete additional service bills
    await additionalServiceBillModal.deleteMany({ patientId: req.params.pId });

    // Handle OPD and associated bills
    const deletedOpd = await opdModel.find({ patientId: req.params.pId });

    await opdBillModal.deleteMany({
      opdId: { $in: deletedOpd.map((opd) => opd.opdId) },
    });
    await opdModel.deleteMany({ patientId: req.params.pId });

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully.",
      deleted,
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    await slackLogger("Error deleting patient", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Failed to delete patient.",
    });
  }
};

export const getPatient = async (req, res) => {
  try {
    const { uhid } = req.params;
    const getPatient = await patientModel.findOne({ uhid });
    if (getPatient) {
      return res
        .status(200)
        .json({ success: true, patientDetails: getPatient });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }
  } catch (error) {
    console.error("Error fetching patient:", error);
    await slackLogger("Error fetching patient", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient.",
    });
  }
};

export const getPatientFromAdmissionId = async (req, res) => {
  try {
    const { admissionId } = req.query;
    const patient = await PatientAdmissionModel.findById(admissionId)
      .populate("patientId")
      .populate("doctorId");
    // console.log("Patient", patient);

    const wing = await wingModel.findById(patient.wardHistory[0].wingId);

    const ptientObject = {
      patientId: patient.patientId?._id,
      name: patient.patientId?.patientName,
      uhid: patient.patientId?.uhid,
      email: patient.patientId?.email,
      phone: patient.patientId?.mobile,
      railwayType: patient.patientId?.railwayType,
      age: patient.patientId?.age,
      height: patient.patientId?.height,
      weight: patient.patientId?.weight,
      bloodGroup: patient.patientId?.bloodGroup,
      admissionDate: patient.admissionDate,
      firstAddress: patient.patientId?.firstAddress,
      secondAddress: patient.patientId?.secondAddress,
      state: patient.patientId?.state,
      district: patient.patientId?.district,
      country: patient.patientId?.country,
      pincode: patient.patientId?.pincode,
      aadhar: patient.patientId?.aadhar,
      crnNumber: patient.patientId?.crnNumber,
      ummidCard: patient.patientId?.ummidCard,
      gender: patient.patientId?.gender,
      emgContact: patient.patientId?.emgContact,
      referenceLetter: patient.referenceLetter,
      doctorName: patient.doctorId?.name,
      tpaCorporate: patient.patientId?.tpaCorporate,
      dischargeDate: patient.dischargeSummary?.dischargeDate,
      wingName: wing.name,
      diagnosis: patient.diagnosis,
    };

    return res.status(200).json({
      message: "Patient fetched successfully!",
      patient: ptientObject,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    await slackLogger("Error fetching patient", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { uhid } = req.params;
    const updated = await patientModel.findOneAndUpdate({ uhid }, req.body, {
      new: true,
    });
    if (updated) {
      return res.status(200).json({
        success: true,
        message: "Patient updated.",
        updated,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to update patient.",
      });
    }
  } catch (error) {
    console.error("Error updating patient:", error);
    await slackLogger("Error updating patient", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to update patient.",
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
      user,
      userEmail,
      userRole,
    } = req.body;
    if (!patientId) {
      return res.status(404).json({
        message:
          "Patient not found. First create a patient then only you can book appointment.",
      });
    }
    console.log(req.body);
    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        message:
          "Patient not found. First create a patient then only you can book appointment.",
      });
    }

    const doc = await doctorModel.findById(doctor);
    if (!doc) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    // Verify department exists
    const dept = await departmentModel.findById(department);
    if (!dept) {
      return res.status(404).json({ message: "Department not found." });
    }

    // Check for existing appointment for the same patient, doctor, date, and time
    const existingAppointment = await appointmentModel.findOne({
      patient: patientId,
      doctor,
      appointmentDate,
      "appointmentTime.from": appointmentTime.from,
      "appointmentTime.to": appointmentTime.to,
    });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "An appointment already exists for this patient with the selected doctor, date, and time.",
      });
    }

    // Create new appointment
    const newAppointment = new appointmentModel({
      patient: patientId,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
      status: "Scheduled",
      user,
      userEmail,
      userRole,
    });

    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(doctor, {
      $push: { appointments: newAppointment._id },
    });
    res.status(201).json({
      message: "Appointment booked successfully!",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    await slackLogger("Error booking appointment", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const deleted = await appointmentModel.findByIdAndDelete(req.params.aId);
    if (deleted) {
      const doctor = await doctorModel.findByIdAndUpdate(
        deleted.doctor,
        {
          $pull: { appointments: deleted._id },
        },
        { new: true }
      );
      if (!doctor) {
        return res.status(404).json({
          message: "Doctor not found.",
        });
      }
      return res.status(200).json({
        success: true,
        message: "Appointment deleted successfully.",
        deleted,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Appointment not found!",
      });
    }
  } catch (error) {
    console.log("Error deleting appointment:", error);
    await slackLogger("Error deleting appointment", error.message, error, req);
    res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const {
      patientId,
      doctor,
      department,
      appointmentDate,
      appointmentTime,
      reason,
    } = req.body;

    if (patientId) {
      const patient = await patientModel.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          message:
            "Patient not found. First create a patient then only you can book appointment.",
        });
      }
    }

    if (doctor) {
      const doc = await doctorModel.findById(doctor);
      if (!doc) {
        return res.status(404).json({ message: "Doctor not found." });
      }
    }

    if (department) {
      // Verify department exists
      const dept = await departmentModel.findById(department);
      if (!dept) {
        return res.status(404).json({ message: "Department not found." });
      }
    }

    const oldAppointment = await appointmentModel.findById(req.params.aId);
    if (!oldAppointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }
    // Check for existing appointment for the same patient, doctor, date, and time
    const patient = patientId || oldAppointment.patient;
    const existingAppointment = await appointmentModel.findOne({
      patient: patient,
      doctor: doctor || oldAppointment.doctor,
      appointmentDate: appointmentDate || oldAppointment.appointmentDate,
      "appointmentTime.from": appointmentTime.from,
      "appointmentTime.to": appointmentTime.to,
    });

    if (existingAppointment) {
      return res.status(409).json({
        message:
          "An appointment already exists for this patient with the selected doctor, date, and time.",
      });
    }
    if (!oldAppointment.doctor.equals(doctor)) {
      await doctorModel.findByIdAndUpdate(oldAppointment.doctor, {
        $pull: { appointments: oldAppointment._id },
      });
      await doctorModel.findByIdAndUpdate(doctor, {
        $push: { appointments: oldAppointment._id },
      });
    }
    // const patient = patientId;
    const updated = await appointmentModel.findByIdAndUpdate(
      req.params.aId,
      req.body,
      { new: true }
    );
    return res.status(200).json({
      message: "Appointment updated successfully!",
      updated,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    await slackLogger("Error updating appointment", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const appointmentsList = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find()
      .sort({ appointmentDate: -1 })
      .populate("doctor")
      .populate("patient")
      .populate("department");
    return res.status(200).json({
      message: "appointment list fetched.",
      appointments,
    });
  } catch (error) {
    console.error("Error fetching appointments", error);
    await slackLogger("Error fetching appointments", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const searchPatientsByName = async (req, res) => {
  try {
    const nameQuery = req.query.name;

    if (!nameQuery) {
      return res
        .status(400)
        .json({ error: "Name query parameter is required." });
    }

    const patients = await patientModel
      .find({ patientName: new RegExp(nameQuery, "i") })
      .limit(10);
    if (patients) {
      return res.status(200).json({
        success: true,
        message: "patient fectched",
        patients,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "unable to fetch data",
      });
    }
  } catch (error) {
    console.error("Error searching patients:", error);
    await slackLogger("Error searching patients", error.message, error, req);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const remainingDues = async (req, res) => {
  try {
    const { admissionId } = req.query;
    const patient = await PatientAdmissionModel.findById(admissionId).populate(
      "patientId"
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const totalBills = await ipdBillModal.find({ admissionId });

    const totalBillsAmount = totalBills.reduce((acc, bill) => {
      const grandTotal = parseFloat(bill.grandTotals?.finalPrice || 0);
      return acc + grandTotal;
    }, 0);

    const totalPaymentsMade = totalBills.reduce((acc, bill) => {
      const totalPaymentForBill =
        bill.transactionHistory?.reduce((paymentAcc, payment) => {
          return paymentAcc + parseFloat(payment?.paymentAmount || 0);
        }, 0) || 0;

      return acc + totalPaymentForBill;
    }, 0);

    const totalRemaining = totalBillsAmount - totalPaymentsMade;

    return res
      .status(200)
      .json({ message: "Data fetched successfully.", patient, totalRemaining });
  } catch (error) {
    console.error("Error fetching remaining dues:", error);
    await slackLogger(
      "Error fetching remaining dues",
      error.message,
      error,
      req
    );
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

async function generateSixDigitPaymentNumber() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await patientPaymentsModal.findOne({
      "transactions.paymentNumber": randomNumber,
    });
    if (!existingBill) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const addPatientPayment = async (req, res) => {
  try {
    const admissionId = req.body.admissionId;
    const admission = await PatientAdmissionModel.findById(
      admissionId
    ).populate("patientId");
    if (!admission) {
      return res.status(404).json({ message: "Admission not found." });
    }
    const patientPayment = await patientPaymentsModal.findOne({ admissionId });
    req.body.transaction.paymentNumber = await generateSixDigitPaymentNumber();

    if (!patientPayment) {
      const newPatientPayment = new patientPaymentsModal({
        patientId: admission.patientId._id,
        admissionId,
        patientName: req.body.patientName,
        transactions: [req.body.transaction],
        user: req.body.user,
        userEmail: req.body.userEmail,
        userRole: req.body.userRole,
      });

      await newPatientPayment.save();
      return res.status(201).json({
        message: "Patient payment added successfully!",
        newPatientPayment,
      });
    } else {
      const updatedPatientPayment = await patientPaymentsModal.findOneAndUpdate(
        { admissionId },
        { $push: { transactions: req.body.transaction } },
        { new: true }
      );
      return res.status(200).json({
        message: "Patient payment added successfully!",
        updatedPatientPayment,
      });
    }
  } catch (error) {
    console.error("Error adding patient payment:", error);
    await slackLogger(
      "Error adding patient payment",
      error.message,
      error,
      req
    );
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const editPayment = async (req, res) => {
  try {
    const { admissionId, paymentNumber } = req.params;

    // Validate parameters
    if (!admissionId || !paymentNumber) {
      return res.status(400).json({
        message: "Both admissionId and paymentNumber are required.",
      });
    }
    req.body.transaction.paymentNumber = paymentNumber;

    // Validate transaction body
    const { transaction } = req.body;
    if (!transaction) {
      return res.status(400).json({
        message: "Transaction data is required in the request body.",
      });
    }

    // Check if the patient payment record exists
    const patientPayment = await patientPaymentsModal.findOne({ admissionId });
    if (!patientPayment) {
      return res
        .status(404)
        .json({ message: "Patient payment record not found." });
    }

    // Check if the specific payment exists
    const paymentExists = patientPayment.transactions.some(
      (payment) => payment.paymentNumber === paymentNumber
    );
    if (!paymentExists) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Perform the update
    const updatedPatientPayment = await patientPaymentsModal.findOneAndUpdate(
      { admissionId, "transactions.paymentNumber": paymentNumber },
      { $set: { "transactions.$": transaction } },
      { new: true } // Return the updated document
    );

    // Return success response
    return res.status(200).json({
      message: "Payment updated successfully!",
      updatedPatientPayment,
    });
  } catch (error) {
    console.error("Error editing payment:", error);
    await slackLogger("Error editing payment", error.message, error, req);
    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const { admissionId, paymentNumber } = req.params;

    // Validate parameters
    if (!admissionId || !paymentNumber) {
      return res.status(400).json({
        message: "Both admissionId and paymentNumber are required.",
      });
    }

    // Check if the patient payment record exists
    const patientPayment = await patientPaymentsModal.findOne({ admissionId });
    if (!patientPayment) {
      return res
        .status(404)
        .json({ message: "Patient payment record not found." });
    }

    // Check if the specific payment exists
    const paymentExists = patientPayment.transactions.some(
      (payment) => payment.paymentNumber === paymentNumber
    );
    if (!paymentExists) {
      return res.status(404).json({ message: "Payment not found." });
    }

    // Perform the deletion
    const updatedPatientPayment = await patientPaymentsModal.findOneAndUpdate(
      { admissionId },
      { $pull: { transactions: { paymentNumber } } },
      { new: true } // Return the updated document
    );

    // Return success response
    return res.status(200).json({
      message: "Payment deleted successfully!",
      updatedPatientPayment,
    });
  } catch (error) {
    console.error("Error deleting payment:", error);
    await slackLogger("Error deleting payment", error.message, error, req);
    return res.status(500).json({
      message: "Server error. Please try again later.",
    });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientModel.findById(id);
    if (patient) {
      return res.status(200).json({
        success: true,
        message: "Patient fetched successfully.",
        patient,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }
  } catch (error) {
    console.error("Error fetching patient:", error);
    await slackLogger("Error fetching patient", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to fetch patient.",
    });
  }
};

// export const dateWisePayments = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     // Validate presence of startDate and endDate
//     if (!startDate || !endDate) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Please provide both startDate and endDate in query parameters.",
//       });
//     }

//     // Normalize startDate and endDate to remove time
//     const start = new Date(startDate);
//     start.setHours(0, 0, 0, 0); // Start of the day
//     const end = new Date(endDate);
//     end.setHours(23, 59, 59, 999); // End of the day

//     // Validate date formats
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
//       });
//     }

//     // Ensure startDate is not after endDate
//     if (start > end) {
//       return res.status(400).json({
//         success: false,
//         message: "startDate must be earlier than or equal to endDate.",
//       });
//     }

//     // Define the query
//     const query = {
//       "transactions.date": {
//         $gte: start,
//         $lte: end,
//       },
//     };

//     const paymentsFound = await patientPaymentsModal.find(query).lean();
//     const mappedPayments = paymentsFound.map((payment) => {
//       return payment.transactions.filter((transaction) => {
//         const transactionDate = new Date(transaction.date);
//         return transactionDate >= start && transactionDate <= end;
//       });
//     });
//   } catch (error) {
//     console.error("Error fetching date wise payments:", error);
//     await slackLogger(
//       "Error fetching date wise payments",
//       error.message,
//       error,
//       req
//     );
//     return res.status(500).json({
//       message: "Server error. Please try again later.",
//     });
//   }
// };
