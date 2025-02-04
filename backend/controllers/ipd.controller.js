import nursingModel from "../models/nursing.model.js";
import roomModel from "../models/room.model.js";
import visitingDoctorModel from "../models/visitingDoctor.model.js";
import wingModel from "../models/wing.model.js";
import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";
import PatientAdmissionModel from "../models/PatientAdmission.model.js";
import mongoose from "mongoose";
import medicationModel from "../models/medication.model.js";
import medicineModal from "../models/pharmacy/medicine.modal.js";
import testModel from "../models/test.model.js";
import servicesModel from "../models/services.model.js";
import packagesModel from "../models/packages.model.js";
import labTestModel from "../models/lab/labTest.model.js";
import ipdRateModel from "../models/ipdRate.model.js";
import opdRateModel from "../models/opdRate.model.js";
import patientTypeModel from "../models/patientType.model.js";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import { slackLogger } from "../middleware/webHook.js";
import newLabTestModal from "../models/lab/newLabTest.modal.js";
import labReportModal from "../models/lab/labReport.modal.js";
import otherServicesModel from "../models/otherServices.model.js";
import patientPaymentModel from "../models/billings&payments/patientPayments.modal.js";
import patientPaymentsModal from "../models/billings&payments/patientPayments.modal.js";

export const createWing = async (req, res) => {
  try {
    // console.log(req.body);
    const existingWing = await wingModel.findOne({ name: req.body.name });
    if (existingWing) {
      return res.status(403).json({
        success: false,
        message: "Wing with this name already exists.",
      });
    }
    const newWing = new wingModel({ ...req.body });
    await newWing.save();
    if (newWing) {
      return res.status(200).json({
        success: true,
        message: "New Wing Created.",
        newWing,
      });
    }
  } catch (error) {
    console.log("Error in creating wing: ", error);
    await slackLogger("Wing Creation Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal server error, inside catch",
    });
  }
};
export const getWings = async (req, res) => {
  try {
    const wings = await wingModel.find();
    if (wings) {
      return res.status(200).json({
        success: true,
        message: "wings fetched.",
        wings,
      });
    } else {
      return res.status(403).json({
        success: false,
        message: "Unable to fetch wings",
      });
    }
  } catch (error) {
    console.log("Error in fetching wings: ", error);
    await slackLogger("Wing Fetching Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal server error, unable to fecth wing details.",
    });
  }
};
export const addRoom = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { wingId, roomNumber, capacity, user, userEmail, userRole } =
      req.body;

    // Validate required fields
    if (!wingId || !roomNumber || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: wingId, roomNumber, or capacity",
      });
    }

    // Check if the wing exists
    const wingExists = await wingModel.findById(wingId);
    if (!wingExists) {
      return res.status(404).json({
        success: false,
        message: "Wing not found",
      });
    }

    // Check if the room number is unique within the same wing
    const existingRoom = await roomModel.findOne({
      roomNumber,
      wingId, // Ensure uniqueness per wing
    });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: "Room number already exists in this wing",
      });
    }

    // Parse and validate capacity
    let capacityArray = [];
    try {
      if (typeof capacity === "string") {
        const cleanedCapacity = capacity.replace(/[^0-9,]/g, "");
        capacityArray = cleanedCapacity.split(",").map(Number);
      } else if (Array.isArray(capacity)) {
        capacityArray = capacity.map(Number);
      } else {
        throw new Error("Invalid capacity format");
      }
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message:
          "Error parsing capacity. Ensure it's an array or comma-separated string of numbers",
      });
    }

    if (!capacityArray.length || !capacityArray.every(Number.isFinite)) {
      return res.status(400).json({
        success: false,
        message: "Capacity must contain valid numbers",
      });
    }

    // Create bed objects from capacity
    const beds = capacityArray.map((value, index) => ({
      bedName: `Bed-${index + 1}`,
      capacity: value,
    }));

    // Create and save the room
    const newRoom = new roomModel({
      wingId,
      roomNumber,
      beds,
      description: req.body.description,
      user,
      userEmail,
      userRole,
    });

    const savedRoom = await newRoom.save();

    // Update the wing to reference the new room
    await wingModel.findByIdAndUpdate(wingId, {
      $push: { rooms: savedRoom._id },
    });

    return res.status(201).json({
      success: true,
      message: "Room added successfully",
      room: savedRoom,
    });
  } catch (error) {
    console.error("Error adding room:", error);
    await slackLogger("Room Creation Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding the room",
    });
  }
};
export const updateBedStatus = async (req, res) => {
  try {
    const { roomId, bedName, isOccupied } = req.body;

    // Validate input
    if (!roomId || !bedName || typeof isOccupied !== "boolean") {
      return res.status(400).json({
        message: "Invalid input. roomId, bedName, and isOccupied are required.",
      });
    }

    // Find the room and update the bed status
    const room = await roomModel.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    const bed = room.beds.find((b) => b.bedName === bedName);

    if (!bed) {
      return res
        .status(404)
        .json({ message: "Bed not found in the specified room." });
    }

    // Update the bed status
    bed.isOccupied = isOccupied;

    // Save the room with the updated bed status
    await room.save();

    res.status(200).json({ message: "Bed status updated successfully.", room });
  } catch (error) {
    console.error("Error updating bed status:", error);
    await slackLogger("Bed Status Update Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "An error occurred while updating the bed status." });
  }
};
export const getRooms = async (req, res) => {
  try {
    const rooms = await roomModel.find().populate("wingId");
    return res.status(200).json({
      success: true,
      message: "rooms fetched.",
      rooms,
    });
  } catch (error) {
    console.log("Error in get rooms: ", error);
    await slackLogger("Room Fetching Error", error.message, error, req);
    return res.json({
      success: false,
      message: "Server error",
    });
  }
};
export const deleteWing = async (req, res) => {
  try {
    const { wId } = req.params;

    const wing = await wingModel.findById(wId);
    if (!wing) {
      return res.status(404).json({
        success: false,
        message: "Wing not found",
      });
    }
    await wingModel.findByIdAndDelete(wId);

    return res.status(200).json({
      success: true,
      message: "Wing deleted successfully.",
      deletedWing: wing,
    });
  } catch (error) {
    console.error("Error deleting wing:", error);
    await slackLogger("Wing Deletion Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete wing",
    });
  }
};
export const editWing = async (req, res) => {
  try {
    const { wId } = req.params;
    const updates = req.body;

    const updatedWing = await wingModel.findByIdAndUpdate(wId, updates, {
      new: true,
    });

    if (!updatedWing) {
      return res.status(404).json({
        success: false,
        message: "Wing not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Wing updated successfully.",
      updatedWing,
    });
  } catch (error) {
    console.error("Error deleting wing:", error);
    await slackLogger("Wing Update Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to update wing",
    });
  }
};
export const deleteRoom = async (req, res) => {
  try {
    const { rId } = req.params;

    const room = await roomModel.findById(rId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Find the wing that contains this room
    const wing = await wingModel.findOne({ rooms: rId });
    if (wing) {
      // Remove the room ID from the wing's rooms array
      wing.rooms.pull(rId);
      await wing.save(); // Save the updated wing document
    }

    await roomModel.findByIdAndDelete(rId);

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
      deletedRoom: room,
    });
  } catch (error) {
    console.error("Error deleting room:", error); // Better error logging
    await slackLogger("Room Deletion Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete room",
    });
  }
};
export const editRoom = async (req, res) => {
  try {
    const { rId } = req.params;
    const updates = req.body;

    const updatedRoom = await roomModel.findByIdAndUpdate(rId, updates, {
      new: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room updated successfully.",
      updatedRoom,
    });
  } catch (error) {
    console.error("Error deleting room:", error); // Better error logging
    await slackLogger("Room Update Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to update room",
    });
  }
};

export const addVisitingDoctor = async (req, res) => {
  try {
    const existingDoctor = await visitingDoctorModel.findOne({
      email: req.body.email,
    });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "A doctor with this email already exists.",
      });
    }
    if (
      req.body.department &&
      !mongoose.Types.ObjectId.isValid(req.body.department)
    ) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const suffix = " (Visiting)";
    const updatedName = `${req.body.name}${suffix}`;
    // Create the new visiting doctor
    const newDoctor = new visitingDoctorModel({
      ...req.body,
      name: updatedName,
      department: req.body.department || null,
    });

    // Save the new doctor to the database
    await newDoctor.save();

    return res.status(201).json({
      success: true,
      message: "Visiting doctor added successfully.",
      doctor: newDoctor,
    });
  } catch (error) {
    console.error("Error adding visiting doctor:", error);
    await slackLogger(
      "Visiting Doctor Creation Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to add visiting doctor",
    });
  }
};
export const getVisitingDoctor = async (req, res) => {
  try {
    const doctors = await visitingDoctorModel.find();
    return res.status(200).json({
      success: true,
      message: "Visiting Doctors fetched.",
      doctors,
    });
  } catch (error) {
    console.log("Error in get visiting doctors: ", error);
    await slackLogger(
      "Visiting Doctor Fetching Error",
      error.message,
      error,
      req
    );
    return res.json({
      success: false,
      message: "Server error",
    });
  }
};
export const deleteVisitingDoctor = async (req, res) => {
  try {
    const { dId } = req.params;

    const doctor = await visitingDoctorModel.findById(dId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "doctor not found",
      });
    }

    await visitingDoctorModel.findByIdAndDelete(dId);

    return res.status(200).json({
      success: true,
      message: "visiting Doctor deleted.",
      deletedDoctor: doctor,
    });
  } catch (error) {
    console.error("Error deleting visiting doctor:", error);
    await slackLogger(
      "Visiting Doctor Deletion Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete visiting doctor",
    });
  }
};
export const editVisitingDoctor = async (req, res) => {
  try {
    const { dId } = req.params;
    const updates = { ...req.body };

    // Validate and sanitize the department field
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
    } else {
      updates.department = null; // Set to null if department is not provided or empty
    }

    const updatedDoctor = await visitingDoctorModel.findByIdAndUpdate(
      dId,
      updates,
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({
        success: false,
        message: "Visiting Doctor not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Visiting Doctor updated.",
      updatedDoctor,
    });
  } catch (error) {
    console.error("Error editing visiting doctor:", error);
    await slackLogger(
      "Visiting Doctor Update Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit visiting doctor",
    });
  }
};
export const addNursing = async (req, res) => {
  try {
    // Create a new Nursing staff member
    const newNurse = new nursingModel(req.body);
    await newNurse.save();

    return res.status(201).json({
      success: true,
      message: "Nurse added successfully.",
      nurse: newNurse,
    });
  } catch (error) {
    console.error("Error editing visiting doctor:", error);
    await slackLogger(
      "Nursing Staff Creation Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit visiting doctor",
    });
  }
};
export const getNursing = async (req, res) => {
  try {
    const nurses = await nursingModel
      .find() // Adjust query to match patientType in array
      .populate({
        path: "patientTypes.patientType", // Populate the patientType field
        select: "name", // Select only the name field if needed
      });

    return res.status(200).json({
      success: true,
      message: "All Nurses fetched.",
      nurses,
    });
  } catch (error) {
    console.error("Error in get nursing: ", error);
    await slackLogger(
      "Nursing Staff Fetching Error",
      error.message,
      error,
      req
    );
    return res.json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteNursing = async (req, res) => {
  try {
    const { nId } = req.params;

    const nurse = await nursingModel.findById(nId);
    if (!nurse) {
      return res.status(404).json({
        success: false,
        message: "Nurse not found",
      });
    }

    await nursingModel.findByIdAndDelete(nId);

    return res.status(200).json({
      success: true,
      message: "Nurse deleted.",
      deletedNurse: nurse,
    });
  } catch (error) {
    console.error("Error deleting Nurse:", error);
    await slackLogger(
      "Nursing Staff Deletion Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Nursing",
    });
  }
};
export const editNursing = async (req, res) => {
  try {
    const { nId } = req.params;
    const updates = { ...req.body };

    // Validate and sanitize the department field
    if (updates.department) {
      if (!mongoose.Types.ObjectId.isValid(updates.department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
    } else {
      updates.department = null; // Set to null if department is not provided or empty
    }

    const updatedNurse = await nursingModel.findByIdAndUpdate(nId, updates, {
      new: true,
    });

    if (!updatedNurse) {
      return res.status(404).json({
        success: false,
        message: "Nurse not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Nurse updated.",
      updatedNurse,
    });
  } catch (error) {
    console.error("Error editing nurse:", error); // Better error logging
    await slackLogger("Nursing Staff Update Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit nurse",
    });
  }
};
export const patientAdmission = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      roomId,
      wingId,
      bedId,
      diagnosis,
      reasonForAdmission,
      referenceLetter,
      referenceDoctor,
      admissionDate,
      timeOfAdmission,
      dischargeDate,
      dischargeTime,
      user,
      userEmail,
      userRole,
      referredBy,
      referredById,
    } = req.body;

    let isNewReferral = true;
    // const patientRecord = await PatientAdmissionModel.find({
    //   patientId,
    // });
    // if (patientRecord.length > 0) {
    //   isNewReferral = false;
    // } else {
    //   isNewReferral = true;
    // }

    // Validate required entities
    const room = await roomModel.findById(roomId); // Fetch the room document
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Find the bed in the room using bedId
    const bed = room.beds.find((b) => b._id.toString() === bedId);
    if (!bed) {
      return res
        .status(404)
        .json({ message: "Bed not found in the specified room." });
    }

    // Check if the bed is already occupied
    if (bed.isOccupied) {
      return res.status(400).json({ message: "Bed is already occupied." });
    }

    // Update bed status to occupied
    bed.isOccupied = true;
    await room.save(); // Save the updated room document

    const newModelBody = {
      patientId,
      doctorId,
      reasonForAdmission,
      referenceLetter,
      referenceDoctor,
      diagnosis,
      nursingRate: room.charges,
      admissionDate,
      referredBy,
      referredById,
      timeOfAdmission,
      dischargeSummary: {
        dischargeDate,
        dischargeTime,
      },
      wardHistory: [
        {
          roomId,
          wingId,
          bedName: bed.bedName,
        },
      ],
      user,
      userEmail,
      userRole,
    };

    if (req.body.referredBy || req.body.referredById) {
      newModelBody.isNewReferral = true;
    }

    // Create a new patient admission, including ward history
    const admission = new PatientAdmissionModel(newModelBody);

    await admission.save();

    // Respond with success
    res
      .status(201)
      .json({ message: "Patient admitted successfully.", admission });
  } catch (error) {
    console.error("Error admitting patient:", error);
    await slackLogger("Patient Admission Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "An error occurred while admitting the patient." });
  }
};

export const editPatientAdmission = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      roomId,
      wingId,
      bedId,
      diagnosis,
      reasonForAdmission,
      referenceLetter,
      referenceDoctor,
      dischargeDate,
      admissionDate,
    } = req.body;

    if (!patientId || !doctorId || !roomId || !wingId || !bedId) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const admissionId = req.query.admissionId;
    if (!admissionId) {
      return res.status(400).json({ message: "Admission ID is required." });
    }

    const oldPatientAdmission = await PatientAdmissionModel.findById(
      admissionId
    ).populate("wardHistory.roomId");
    if (!oldPatientAdmission) {
      return res
        .status(404)
        .json({ message: "Patient admission record not found." });
    }

    if (
      oldPatientAdmission.wardHistory &&
      oldPatientAdmission.wardHistory.length > 0
    ) {
      const oldWard =
        oldPatientAdmission.wardHistory[
          oldPatientAdmission.wardHistory.length - 1
        ];

      // Check if the room and bed are the same as the current ones
      const existingBed = oldWard.roomId.beds.find(
        (b) => b._id.toString() === bedId
      );
      if (
        oldWard.roomId._id.equals(roomId) &&
        existingBed &&
        oldWard.bedName === existingBed.bedName
      ) {
        console.log("No changes made to the bed.");
      } else {
        // Free the previous bed
        const previousRoom = await roomModel.findById(oldWard.roomId._id);
        if (!previousRoom) {
          return res.status(404).json({ message: "Previous room not found." });
        }

        const previousBed = previousRoom.beds.find(
          (b) => b._id.toString() === oldWard.bedName
        );
        if (!previousBed) {
          return res
            .status(404)
            .json({ message: "Bed not found in the previous room." });
        }

        previousBed.isOccupied = false;
        await previousRoom.save();

        // Update the new bed
        const newRoom = await roomModel.findById(roomId);
        if (!newRoom) {
          return res.status(404).json({ message: "New room not found." });
        }

        const newBed = newRoom.beds.find((b) => b._id.toString() === bedId);
        if (!newBed) {
          return res
            .status(404)
            .json({ message: "Bed not found in the new room." });
        }

        if (newBed.isOccupied) {
          return res
            .status(400)
            .json({ message: "The selected bed is already occupied." });
        }

        newBed.isOccupied = true;
        await newRoom.save();

        // Add new ward history
        const newWardHistory = {
          roomId,
          wingId,
          bedName: newBed.bedName,
          admissionDate: new Date(),
        };
        oldPatientAdmission.wardHistory.push(newWardHistory);
      }
    }

    let time = undefined;
    let dischargeTime = undefined;
    if (oldPatientAdmission.admissionDate) {
      const date = new Date();
      time = date.toLocaleTimeString();
    }
    if (oldPatientAdmission.dischargeSummary.dischargeDate) {
      const dischargeProcessedDate = new Date();
      dischargeTime = dischargeProcessedDate.toLocaleTimeString();
    }

    // Update other fields if provided
    oldPatientAdmission.patientId = patientId;
    oldPatientAdmission.doctorId = doctorId;
    oldPatientAdmission.reasonForAdmission =
      reasonForAdmission || oldPatientAdmission.reasonForAdmission;
    oldPatientAdmission.referenceLetter =
      referenceLetter || oldPatientAdmission.referenceLetter;
    oldPatientAdmission.diagnosis = diagnosis || oldPatientAdmission.diagnosis;
    oldPatientAdmission.referenceDoctor =
      referenceDoctor || oldPatientAdmission.referenceDoctor;
    oldPatientAdmission.dischargeSummary.dischargeDate =
      dischargeDate || oldPatientAdmission.dischargeSummary.dischargeDate;
    oldPatientAdmission.dischargeSummary.dischargeTime = dischargeTime
      ? dischargeTime
      : oldPatientAdmission.dischargeSummary.dischargeTime;
    oldPatientAdmission.admissionDate =
      admissionDate || oldPatientAdmission.admissionDate;
    oldPatientAdmission.timeOfAdmission = time
      ? time
      : oldPatientAdmission.timeOfAdmission;

    await oldPatientAdmission.save();

    res
      .status(200)
      .json({ message: "Patient admission updated successfully." });
  } catch (error) {
    console.error("Error editing patient admission:", error);
    await slackLogger(
      "Patient Admission Update Error",
      error.message,
      error,
      req
    );
    res.status(500).json({
      message: "An error occurred while updating the patient admission.",
    });
  }
};

export const newUpdatePatientAdmission = async (req, res) => {
  try {
    const { admissionId } = req.query;
    const {
      referenceLetter,
      referenceDoctor,
      dischargeDate,
      timeOfAdmission,
      dischargeTime,
      admissionDate,
      diagnosis,
      referredBy,
      referredById,
      doctorId,
      doctorName,
    } = req.body;

    // const patientAdmission = await PatientAdmissionModel.findById(admissionId);
    // const patientRecord = await PatientAdmissionModel.find({
    //   patientId: patientAdmission.patientId,
    // });
    // if (patientRecord.length > 0) {
    //   isNewReferral = false;
    // } else {
    //   isNewReferral = true;
    // }

    // const dischargeProcessed = new Date();
    // const dischargeTime = dischargeProcessed.toLocaleTimeString();

    const updateBody = {
      referenceLetter,
      referenceDoctor,
      "dischargeSummary.dischargeDate": dischargeDate,
      "dischargeSummary.dischargeTime": dischargeTime,
      admissionDate,
      timeOfAdmission,
      referredBy,
      diagnosis,
      referredById,
      doctorId,
      doctorName,
    };

    if (req.body.referredBy || req.body.referredById) {
      updateBody.isNewReferral = true;
    }

    const updatedAdmission = await PatientAdmissionModel.findByIdAndUpdate(
      admissionId,
      updateBody,
      { new: true }
    );

    if (!updatedAdmission) {
      return res.status(404).json({
        success: false,
        message: "Patient admission not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient admission updated successfully.",
      updatedAdmission,
    });
  } catch (error) {
    console.error("Error updating patient admission:", error);
    await slackLogger(
      "Patient Admission Update Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to update patient admission",
    });
  }
};

export const deletePatientAdmission = async (req, res) => {
  try {
    const { admissionId } = req.params;

    const admission = await PatientAdmissionModel.findByIdAndDelete(
      admissionId
    );
    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Patient admission not found",
      });
    }

    if (admission.wardHistory.length > 0) {
      const room = await roomModel.findById(
        admission.wardHistory[admission.wardHistory.length - 1].roomId
      );
      if (room) {
        const bed = room.beds.find(
          (b) =>
            b.bedName ===
            admission.wardHistory[admission.wardHistory.length - 1].bedName
        );
        if (bed && bed.isOccupied) {
          bed.isOccupied = false;
          await room.save();
        }
      }
    }

    // Fetch and delete IPD bills
    const ipdBills = await ipdBillModal.find({ admissionId });
    if (ipdBills.length > 0) {
      for (const bill of ipdBills) {
        for (const item of bill.item) {
          if (item.itemType.toLowerCase() === "pharmacy" && item.itemId) {
            const medicine = await medicineModal.findById(item.itemId);
            if (medicine) {
              medicine.stockQuantity =
                parseInt(medicine.stockQuantity) + parseInt(item.quantity);
              await medicine.save();
            }
          }
        }
        await labReportModal.deleteMany({
          billNumber: bill.billNumber,
        });
      }

      await ipdBillModal.deleteMany({ admissionId });
    }

    // Delete patient payments
    await patientPaymentsModal.deleteMany({ admissionId });

    return res.status(200).json({
      success: true,
      message: "Patient admission deleted successfully.",
      deletedAdmission: admission,
    });
  } catch (error) {
    console.error("Error deleting patient admission:", error);
    await slackLogger(
      "Patient Admission Deletion Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete patient admission",
    });
  }
};

export const allIpds = async (req, res) => {
  try {
    const ipds = await PatientAdmissionModel.find()
      .populate("patientId")
      .populate("doctorId")
      .populate("wardHistory.roomId")
      .populate("wardHistory.wingId")
      .lean();

    // Use Promise.all to handle asynchronous operations within the map
    const processedIpds = await Promise.all(
      ipds.map(async (ipd) => {
        const ipdPayment = await patientPaymentModel.findOne({
          admissionId: ipd._id,
        });

        if (!ipdPayment) {
          return {
            ...ipd,
            payment: null,
          };
        }

        return {
          ...ipd,
          payment: ipdPayment.transactions,
        };
      })
    );

    // Sort processed IPDs by admissionDate (new ones first)
    const sortedIpds = processedIpds.sort(
      (a, b) => new Date(b.admissionDate) - new Date(a.admissionDate)
    );

    return res.status(200).json({
      success: true,
      message: "All IPDs fetched successfully.",
      ipds: sortedIpds,
    });
  } catch (error) {
    console.error("Error fetching IPDs:", error);
    await slackLogger("IPD Fetching Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to fetch all IPDs.",
    });
  }
};

export const addDischargeSummary = async (req, res) => {
  const { admissionId } = req.params;

  const {
    dischargeDate,
    numberOfDays,
    statusAtDischarge,
    dischargeNotes,
    finalDiagnosis,
    dischargeMode,
    complications,
    patientCondition,
    keyInterventions,
    dietaryInstructions,
    activityRecommendations,
    woundCareInstructions,
    medications,
    followUpInstructions,
    dischargingDoctor,
    emergencyCareHow,
    emergencyCareWhen,
    dischargeTime,
  } = req.body.dischargeSummary;

  try {
    // Validate Admission ID
    if (!mongoose.Types.ObjectId.isValid(admissionId)) {
      return res.status(400).json({ error: "Invalid admission ID" });
    }

    // Ensure medications are structured correctly
    // let formattedMedications = [];
    // if (medications && Array.isArray(medications)) {
    //   formattedMedications = medications.map((med) => ({
    //     name: med.name,
    //     dosage: med.dosage,
    //     frequency: med.frequency,
    //   }));
    // } else {
    //   return res.status(400).json({ error: "Medications should be an array" });
    // }

    const existingAdmission = await PatientAdmissionModel.findById(admissionId);
    if (!existingAdmission) {
      return res.status(404).json({ error: "Patient admission not found" });
    }

    // Find and Update the Admission Record
    const updatedAdmission = await PatientAdmissionModel.findByIdAndUpdate(
      admissionId,
      {
        $set: {
          "dischargeSummary.dischargeDate":
            dischargeDate || existingAdmission.admissionDate,
          "dischargeSummary.dischargeTime":
            dischargeTime || existingAdmission.timeOfAdmission,
          "dischargeSummary.numberOfDays":
            numberOfDays || existingAdmission.numberOfDays,
          "dischargeSummary.statusAtDischarge":
            statusAtDischarge || existingAdmission.status,
          "dischargeSummary.dischargeNotes":
            dischargeNotes || existingAdmission.dischargeSummary.dischargeNotes,
          "dischargeSummary.finalDiagnosis":
            finalDiagnosis || existingAdmission.dischargeSummary.finalDiagnosis,
          "dischargeSummary.medications":
            medications || existingAdmission.dischargeSummary.medications,
          "dischargeSummary.followUpInstructions":
            followUpInstructions ||
            existingAdmission.dischargeSummary.followUpInstructions,

          "dischargeSummary.dischargeMode":
            dischargeMode || existingAdmission.dischargeSummary.dischargeMode,
          "dischargeSummary.complications":
            complications || existingAdmission.dischargeSummary.complications,
          "dischargeSummary.patientCondition":
            patientCondition ||
            existingAdmission.dischargeSummary.patientCondition,
          "dischargeSummary.keyInterventions":
            keyInterventions ||
            existingAdmission.dischargeSummary.keyInterventions,
          "dischargeSummary.dietaryInstructions":
            dietaryInstructions ||
            existingAdmission.dischargeSummary.dietaryInstructions,
          "dischargeSummary.activityRecommendations":
            activityRecommendations ||
            existingAdmission.dischargeSummary.activityRecommendations,
          "dischargeSummary.woundCareInstructions":
            woundCareInstructions ||
            existingAdmission.dischargeSummary.woundCareInstructions,
          "dischargeSummary.emergencyCareWhen":
            emergencyCareWhen ||
            existingAdmission.dischargeSummary.emergencyCareWhen,
          "dischargeSummary.emergencyCareHow":
            emergencyCareHow ||
            existingAdmission.dischargeSummary.emergencyCareHow,
          "dischargeSummary.dischargingDoctor": new mongoose.Types.ObjectId(
            dischargingDoctor ||
              existingAdmission.dischargeSummary.dischargingDoctor
          ),
          status: "Discharged",
        },
      },
      { new: true, upsert: true } // upsert ensures that if the dischargeSummary doesn't exist, it will be created
    ).populate("dischargeSummary.dischargingDoctor");

    if (!updatedAdmission) {
      return res.status(404).json({ error: "Patient admission not found" });
    }

    // Find the bed assigned to this patient and set isOccupied to false
    const latestWardHistory =
      updatedAdmission.wardHistory[updatedAdmission.wardHistory.length - 1];
    if (latestWardHistory && latestWardHistory.roomId) {
      const room = await roomModel.findById(latestWardHistory.roomId);

      if (room) {
        const bed = room.beds.find(
          (b) => b.bedName === latestWardHistory.bedName
        );
        if (bed) {
          bed.isOccupied = false;
          await room.save();
        } else {
          return res
            .status(404)
            .json({ error: "Bed not found in the assigned room" });
        }
      } else {
        return res.status(404).json({ error: "Room not found" });
      }
    }

    // Return success response with the updated admission
    res.status(200).json({
      success: true,
      message: "Discharge summary added successfully.",
      updatedAdmission,
    });
  } catch (error) {
    console.error("Error in adding discharge summary: ", error);
    await slackLogger("Discharge Summary Error", error.message, error, req);
    res.status(500).json({
      error: "Failed to add discharge summary",
      details: error.message,
    });
  }
};
export const addAllergy = async (req, res) => {
  try {
    const { admissionId } = req.params;
    const { allergyName, allergyType, notes, doctorId, doctorName, dateTime } =
      req.body;

    // console.log("Request received for adding allergy:", {
    //   admissionId,
    //   allergyName,
    //   allergyType,
    //   notes,
    //   doctorId,
    //   dateTime,
    // });

    // Validate input
    if (!allergyName || !allergyType || !doctorId || !dateTime) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Find the admission record
    const admission = await PatientAdmissionModel.findById(admissionId);

    if (!admission) {
      return res.status(404).json({ error: "Patient admission not found." });
    }

    // Add the allergy to the allergies array
    admission.allergies.push({
      allergyName,
      allergyType,
      notes,
      doctorId,
      dateTime,
    });

    // Save the updated document
    const updatedAdmission = await admission.save();

    res.status(200).json({
      message: "Allergy added successfully.",
      data: updatedAdmission,
    });
  } catch (error) {
    console.error("Error adding allergy:", error);
    await slackLogger("Allergy Addition Error", error.message, error, req);
    res
      .status(500)
      .json({ error: "An error occurred while adding the allergy." });
  }
};
// Update Physical Examination
export const updatePhysicalExamination = async (req, res) => {
  const { admissionId } = req.params;
  const {
    vitalSigns,
    doctorId,
    doctorName,
    sensorium,
    pallor,
    jaundice,
    cyanosis,
    oedema,
    clubbing,
    hair,
    skin,
    nails,
    findings,
    respiratorySystem,
    urinarySystem,
    nervousSystem,
    cardiovascularSystem,
    others,
  } = req.body;

  console.log(req.body);
  try {
    // Find the patient admission record by admissionId
    const admission = await PatientAdmissionModel.findById(admissionId);

    if (!admission) {
      return res.status(404).json({ message: "Patient Admission not found." });
    }

    // Update the physical examination data
    admission.physicalExamination = {
      vitalSigns,
      doctorId,
      doctorName,
      sensorium,
      pallor,
      jaundice,
      cyanosis,
      oedema,
      clubbing,
      hair,
      skin,
      nails,
      findings,
      respiratorySystem,
      urinarySystem,
      nervousSystem,
      cardiovascularSystem,
      others,
      updatedAt: new Date(), // Set the updated time to current time
    };

    // Save the updated patient admission record
    await admission.save();

    // Respond with the updated admission data
    res.json({
      message: "Physical Examination updated successfully.",
      updatedAdmission: admission,
    });
  } catch (error) {
    console.error("Error updating physical examination: ", error);
    await slackLogger(
      "Physical Examination Update Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error." });
  }
};
// Update Investigations
export const updateInvestigations = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const { labTests } = req.body;

    // console.log(req.body);

    // Validate that labTests is an array of objects
    if (!Array.isArray(labTests)) {
      return res
        .status(400)
        .json({ success: false, message: "labTests must be an array" });
    }

    // Ensure each labTest object has the required fields
    for (const test of labTests) {
      if (!test.name || !test.dateTime || !test.status) {
        return res.status(400).json({
          success: false,
          message: "Each labTest must have name, dateTime, and status",
        });
      }
    }

    // Process labTests to add new ones to the TestModel
    const testNames = labTests.map((test) => test.name);
    const existingTests = await testModel
      .find({ name: { $in: testNames } })
      .select("name");
    const existingTestNames = existingTests.map((test) => test.name);

    const newTests = testNames
      .filter((name) => !existingTestNames.includes(name))
      .map((name) => ({ name }));

    if (newTests.length > 0) {
      await testModel.insertMany(newTests);
      // console.log("New tests added to the TestModel:", newTests);
    }

    // Update the investigations field with new lab tests
    const ipdFile = await PatientAdmissionModel.findOneAndUpdate(
      { _id: patientAdmissionId },
      {
        $push: {
          "investigations.labTests": { $each: labTests },
        },
        $set: { "investigations.updatedAt": Date.now() },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Investigations updated successfully",
      ipdFile,
    });
  } catch (error) {
    console.error("Error updating investigations: ", error);
    await slackLogger("Investigations Update Error", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to update investigations",
      error,
    });
  }
};
export const updateChiefComplaints = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const { complaint, type, duration, description } = req.body;

    // Validate input: Ensure complaint, type, and duration are provided and are of correct type
    if (
      !complaint ||
      !type ||
      !duration ||
      typeof complaint !== "string" ||
      typeof type !== "string" ||
      typeof duration !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "`complaint`, `type`, and `duration` are required and should be strings.",
      });
    }

    // Validate that the type is either "Major" or "Minor"
    if (!["Major", "Minor"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "`type` must be either 'Major' or 'Minor'.",
      });
    }

    // Push the new complaint object to the `chiefComplaints` array
    const ipdFile = await PatientAdmissionModel.findByIdAndUpdate(
      patientAdmissionId,
      {
        $push: {
          chiefComplaints: {
            complaint,
            type,
            duration,
            description,
            updatedAt: new Date(), // Timestamp for when the complaint was added
          },
        },
        $set: { updatedAt: new Date() }, // Update the main document's `updatedAt` field
      },
      { new: true } // Return the updated document
    );

    // If record not found
    if (!ipdFile) {
      return res.status(404).json({
        success: false,
        message: "Patient admission record not found.",
      });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Complaint added successfully.",
      ipdFile, // The updated `ipdFile` document with the new complaint
    });
  } catch (error) {
    // Error response
    console.error("Error updating chief complaints:", error);
    await slackLogger(
      "Chief Complaints Update Error",
      error.message,
      error,
      req
    );
    res.status(500).json({
      success: false,
      message: "Failed to add Complaint.",
      error: error.message,
    });
  }
};
// Add Chemo Notes
export const addChemoNotes = async (req, res) => {
  try {
    // Destructure required data from the request body
    // console.log(req.body);
    const { admissionId } = req.params;
    const {
      bsa,
      cycles,
      date,
      diagnosis,
      height,
      weight,
      investigations,
      plan,
      sideEffects,
      specificInstruction,
    } = req.body;

    // Construct the chemoNotes object
    const newChemoNote = {
      plan,
      diagnosis,
      BSA: bsa,
      cycle: cycles,
      height,
      weight,
      date,
      investigations: {
        cbcDiff: investigations.cbcDiff,
        echo: investigations.echo,
        familyCounselling: investigations.familyCounselling,
        ivAccess: investigations.ivAccess,
        kft: investigations.kft,
        lft: investigations.lft,
        viralMarker: investigations.viralMarker,
      },
      sideEffects,
      specificInstruction,
      updatedAt: new Date(),
    };

    // Find the PatientAdmission document by admissionId
    const admission = await PatientAdmissionModel.findById(admissionId);

    if (!admission) {
      return res.status(404).json({ message: "Patient admission not found." });
    }

    // Push the new chemoNote to the chemoNotes array
    admission.chemoNotes.push(newChemoNote);

    // Save the updated admission document
    await admission.save();

    // Send a success response
    res
      .status(200)
      .json({ message: "Chemotherapy notes added successfully.", admission });
  } catch (error) {
    console.error("Error adding chemotherapy notes:", error);
    await slackLogger("Chemo Notes Addition Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error adding chemotherapy notes.", error });
  }
};
// Controller to add a new visit note
export const addVisitNote = async (req, res) => {
  const { admissionId } = req.params; // Get the admission ID from the URL
  const { note, doctorId, dateTime } = req.body; // Get the note details from the request body

  try {
    // Find the patient admission by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    // Add the new visit note to the visitNotes array
    patientAdmission.visitNotes.push({
      note,
      doctorId,
      dateTime,
    });

    // Save the updated patient admission
    await patientAdmission.save();

    return res.status(200).json({
      message: "Visit note added successfully",
      visitNotes: patientAdmission.visitNotes,
    });
  } catch (err) {
    console.error("Error adding visit note:", err);
    await slackLogger("Visit Note Addition Error", err.message, err, req);
    return res.status(500).json({ message: "Failed to add visit note" });
  }
};
// Update Obs & Gynae
export const updateObsGynae = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    console.log(req.body);

    if (!patientAdmissionId) {
      return res.status(400).json({
        message: "Patient Admission ID and ObsGynae data are required.",
      });
    }

    // Find the patient admission document by ID
    const admission = await PatientAdmissionModel.findById(patientAdmissionId);

    if (!admission) {
      return res.status(404).json({
        message: "Patient admission not found.",
      });
    }

    // Update the obsGynae section
    admission.obsGynae = {
      ...admission.obsGynae,
      ...req.body,
      updatedAt: Date.now(),
    };

    // Save the changes
    const updatedAdmission = await admission.save();

    return res.status(200).json({
      message: "ObsGynae details updated successfully.",
      data: updatedAdmission.obsGynae,
    });
  } catch (error) {
    console.error("Error updating ObsGynae details:", error);
    await slackLogger("ObsGynae Update Error", error.message, error, req);
    return res.status(500).json({
      message: "An error occurred while updating ObsGynae details.",
      error: error.message,
    });
  }
};
export const getDischargeSummary = async (req, res) => {
  const { admissionId } = req.params;

  // Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient Admission ID" });
  }

  try {
    // Find the admission record with the discharge summary
    const patientAdmission = await PatientAdmissionModel.findById(admissionId)
      .select("dischargeSummary")
      .populate(
        "dischargeSummary.dischargingDoctor",
        "name specialization email"
      );

    if (!patientAdmission) {
      return res
        .status(404)
        .json({ success: false, message: "Patient Admission not found" });
    }

    res.status(200).json({
      success: true,
      dischargeSummary: patientAdmission.dischargeSummary, // Return only the dischargeSummary field
    });
  } catch (error) {
    console.error("Error fetching discharge summary:", error);
    await slackLogger(
      "Discharge Summary Fetch Error",
      error.message,
      error,
      req
    );
    res.status(500).json({
      success: false,
      message: "Failed to fetch discharge summary",
      error,
    });
  }
};
export const getChiefComplaints = async (req, res) => {
  const { admissionId } = req.params;

  // Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient Admission ID" });
  }
  try {
    const patientAdmission = await PatientAdmissionModel.findById(
      admissionId
    ).select("chiefComplaints");

    // if (!patientAdmission) {
    //   return res.status(404).json({ success: false, message: "Patient Admission not found" });
    // }

    res.status(200).json({
      success: true,
      complaints: patientAdmission.chiefComplaints,
    });
  } catch (error) {
    console.error("error fetching complaints", error);
    await slackLogger(
      "Chief Complaints Fetch Error",
      error.message,
      error,
      req
    );
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const getAdmissionDetails = async (req, res) => {
  try {
    const { admissionId } = req.params;
    // console.log('hit')
    // Validate the admissionId
    if (!admissionId) {
      return res.status(400).json({ message: "Admission ID is required" });
    }

    // Find the admission details by ID and populate references
    const admissionDetails = await PatientAdmissionModel.findById(admissionId)
      .populate({
        path: "patientId",
        select: "name age gender contact railwayType",
        populate: {
          path: "patientType",
        },
      })
      .populate("doctorId", "name specialization") // Populate doctor details
      .populate("wardHistory.roomId", "roomNumber type") // Populate room details
      .populate("wardHistory.wingId", "name") // Populate wing details
      .exec();

    // If no admission is found
    if (!admissionDetails) {
      return res.status(404).json({ message: "Admission details not found" });
    }

    // Return the admission details
    res.status(200).json(admissionDetails);
  } catch (error) {
    console.error("Error fetching admission details:", error);
    await slackLogger(
      "Admission Details Fetch Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};
export const getChemoNotes = async (req, res) => {
  const { admissionId } = req.params;

  // Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient Admission ID" });
  }
  try {
    const patientAdmission = await PatientAdmissionModel.findById(
      admissionId
    ).select("chemoNotes");

    // if (!patientAdmission) {
    //   return res.status(404).json({ success: false, message: "Patient Admission not found" });
    // }

    res.status(200).json({
      success: true,
      chemoNotes: patientAdmission.chemoNotes,
    });
  } catch (error) {
    console.error("error fetching complaints", error);
    await slackLogger("Chemo Notes Fetch Error", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const addConsumables = async (req, res) => {
  try {
    const { admissionId } = req.params; // ID of the patient admission
    const consumableData = req.body; // Data to be added to consumables
    const medications = consumableData.medications || ""; // Extract medications array

    // Find the PatientAdmission document by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    // Check each medication and add it to the Medications model if missing
    for (const med of medications) {
      const existingMedication = await medicationModel.findOne({
        name: med.name,
      });

      if (!existingMedication) {
        // Medication doesn't exist, add it to the Medications model
        const newMedication = new medicationModel({
          name: med.name || "",
        });
        await newMedication.save();
      }

      // Structure the consumable item according to the schema
      const consumableItem = {
        type: med.type || "",
        name: med.name || "",
        dosage: med.dosage || "",
        duration: med.duration || "",
        quantity: consumableData.quantity || 0,
        doctor: consumableData.doctor || "",
        status: consumableData.status || "Pending",
      };

      // Add the consumable item to the consumables array
      patientAdmission.consumables.push(consumableItem);
    }

    // Save the updated PatientAdmission document
    await patientAdmission.save();

    return res.status(200).json({
      message: "Consumables added successfully, and medications updated",
      patientAdmission,
    });
  } catch (error) {
    console.error("Error adding consumables:", error);
    await slackLogger("Consumables Addition Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const getAllergies = async (req, res) => {
  const { admissionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient Admission ID" });
  }

  try {
    const patientAdmission = await PatientAdmissionModel.findById(admissionId)
      .select("allergies")
      .populate({
        path: "allergies.doctorId", // Populate doctorId within the allergies array
        select: "name",
      });
    res.status(200).json({
      success: true,
      allergies: patientAdmission.allergies,
    });
  } catch (error) {
    console.error("Error getting allergies:", error);
    await slackLogger("Allergies Fetch Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const getConsumables = async (req, res) => {
  const { admissionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient Admission ID" });
  }

  try {
    const patientAdmission = await PatientAdmissionModel.findById(
      admissionId
    ).select("consumables");
    res.status(200).json({
      success: true,
      consumables: patientAdmission.consumables,
    });
  } catch (error) {
    console.error("Error getting consumable:", error);
    await slackLogger("Consumables Fetch Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const getVisitNotes = async (req, res) => {
  const { admissionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Patient Admission ID" });
  }

  try {
    const patientAdmission = await PatientAdmissionModel.findById(admissionId)
      .select("visitNotes")
      .populate({
        path: "visitNotes.doctorId", // Path to doctorId inside visitNotes
        select: "name", // Select only the name field
      });
    res.status(200).json({
      success: true,
      visitNotes: patientAdmission.visitNotes,
    });
  } catch (error) {
    console.error("Error getting visit notes:", error);
    await slackLogger("Visit Notes Fetch Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const deleteConsumable = async (req, res) => {
  const { admissionId, consumableId } = req.params;

  try {
    // Find the PatientAdmission document by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    // Find the consumable to delete
    const consumableIndex = patientAdmission.consumables.findIndex(
      (consumable) => consumable._id.toString() === consumableId
    );

    if (consumableIndex === -1) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    // Remove the consumable from the array
    patientAdmission.consumables.splice(consumableIndex, 1);

    // Save the updated PatientAdmission document
    await patientAdmission.save();

    return res
      .status(200)
      .json({ message: "Consumable deleted successfully", patientAdmission });
  } catch (error) {
    console.error("Error deleting consumable:", error);
    await slackLogger("Consumable Deletion Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const deleteComplaint = async (req, res) => {
  const { admissionId, complaintId } = req.params;

  try {
    // Find the PatientAdmission document by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    const complaintIndex = patientAdmission.chiefComplaints.findIndex(
      (complaint) => complaint._id.toString() === complaintId
    );

    if (complaintIndex === -1) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    patientAdmission.chiefComplaints.splice(complaintIndex, 1);

    // Save the updated PatientAdmission document
    await patientAdmission.save();

    return res
      .status(200)
      .json({ message: "Complaint deleted successfully", patientAdmission });
  } catch (error) {
    console.error("Error deleting Complaint:", error);
    await slackLogger("Complaint Deletion Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const deleteChemo = async (req, res) => {
  const { admissionId, chemoId } = req.params;

  try {
    // Find the PatientAdmission document by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    const chemoIndex = patientAdmission.chemoNotes.findIndex(
      (chemo) => chemo._id.toString() === chemoId
    );

    if (chemoIndex === -1) {
      return res.status(404).json({ message: "Chemo Note not found" });
    }

    patientAdmission.chemoNotes.splice(chemoIndex, 1);

    // Save the updated PatientAdmission document
    await patientAdmission.save();

    return res
      .status(200)
      .json({ message: "Chemo Note deleted successfully", patientAdmission });
  } catch (error) {
    console.error("Error deleting chemo note:", error);
    await slackLogger("Chemo Note Deletion Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const deleteAllergies = async (req, res) => {
  const { admissionId, allergyId } = req.params;

  try {
    // Find the PatientAdmission document by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    const allergyIndex = patientAdmission.allergies.findIndex(
      (allergy) => allergy._id.toString() === allergyId
    );

    if (allergyIndex === -1) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    patientAdmission.allergies.splice(allergyIndex, 1);

    // Save the updated PatientAdmission document
    await patientAdmission.save();

    return res
      .status(200)
      .json({ message: "Allergy deleted successfully", patientAdmission });
  } catch (error) {
    console.error("Error deleting allergy:", error);
    await slackLogger("Allergy Deletion Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const deleteVisitNotes = async (req, res) => {
  const { admissionId, noteId } = req.params;

  try {
    // Find the PatientAdmission document by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient admission not found" });
    }

    const noteIndex = patientAdmission.visitNotes.findIndex(
      (note) => note._id.toString() === noteId
    );

    if (noteIndex === -1) {
      return res.status(404).json({ message: "Visit Note not found" });
    }

    patientAdmission.visitNotes.splice(noteIndex, 1);

    // Save the updated PatientAdmission document
    await patientAdmission.save();

    return res
      .status(200)
      .json({ message: "Visit note deleted successfully", patientAdmission });
  } catch (error) {
    console.error("Error deleting visit note:", error);
    await slackLogger("Visit Note Deletion Error", error.message, error, req);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
export const updateConsumable = async (req, res) => {
  try {
    const { admissionId, consumableId } = req.params;
    const { doctor, dosage, duration, name, type } = req.body.formData;

    // console.log('Request Body:', req.body);
    // console.log(consumableId);

    // Find the patient admission by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient Admission not found" });
    }

    // Find the consumable to update by ID
    const consumable = patientAdmission.consumables.id(consumableId);

    if (!consumable) {
      return res.status(404).json({ message: "Consumable not found" });
    }

    // Update consumable fields
    consumable.doctor = doctor || consumable.doctor;
    consumable.dosage = dosage || consumable.dosage;
    consumable.duration = duration || consumable.duration;
    consumable.name = name || consumable.name;
    consumable.type = type || consumable.type;
    consumable.status = "In Progress"; // Example: Set status to 'In Progress'

    // Save the updated patient admission
    await patientAdmission.save();

    res
      .status(200)
      .json({ message: "Consumable updated successfully", patientAdmission });
  } catch (error) {
    console.error("Error updating consumable:", error);
    await slackLogger("Consumable Update Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error updating consumable", error: error.message });
  }
};
export const updateComplaint = async (req, res) => {
  try {
    const { admissionId, complaintId } = req.params; // Assuming patient admission ID and consumable ID are passed as URL parameters
    const { type, description, complaint } = req.body.formData;

    // console.log('Request Body:', req.body);

    // Find the patient admission by ID
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);

    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient Admission not found" });
    }

    // Find the consumable to update by ID
    const existingComplaint = patientAdmission.chiefComplaints.id(complaintId);

    if (!existingComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Update complaint fields
    existingComplaint.description =
      description || existingComplaint.description;
    existingComplaint.complaint = complaint || existingComplaint.complaint;
    existingComplaint.type = type || existingComplaint.type;

    // Save the updated patient admission
    await patientAdmission.save();

    res
      .status(200)
      .json({ message: "Complaint updated successfully", patientAdmission });
  } catch (error) {
    console.error("Error updating Complaint:", error);
    await slackLogger("Complaint Update Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error updating consumable", error: error.message });
  }
};
export const updateChemo = async (req, res) => {
  const { admissionId, chemoNoteId } = req.params;
  const { plan, diagnosis, BSA, cycle, height, weight, date, investigations } =
    req.body.chemoDetails;

  try {
    // Find the PatientAdmission document by ID
    const admission = await PatientAdmissionModel.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ error: "Patient admission not found" });
    }

    // Find the specific chemo note within the chemoNotes array
    const chemoNote = admission.chemoNotes.id(chemoNoteId);
    if (!chemoNote) {
      return res.status(404).json({ error: "Chemo note not found" });
    }

    // Update the chemo note fields
    if (plan !== undefined) chemoNote.plan = plan;
    if (diagnosis !== undefined) chemoNote.diagnosis = diagnosis;
    if (BSA !== undefined || BSA !== undefined) chemoNote.BSA = BSA || BSA;
    if (cycle !== undefined || cycle !== undefined)
      chemoNote.cycle = cycle || cycle;
    if (height !== undefined) chemoNote.height = height;
    if (weight !== undefined) chemoNote.weight = weight;
    if (date !== undefined) chemoNote.date = date;

    if (investigations) {
      chemoNote.investigations = {
        ...chemoNote.investigations, // Preserve existing investigation data
        ...investigations, // Overwrite or add new investigation data
      };
    }

    chemoNote.updatedAt = new Date(); // Update the timestamp

    // Save the updated admission document
    await admission.save();

    res.status(200).json({
      message: "Chemo note updated successfully",
      updatedChemoNote: chemoNote,
    });
  } catch (error) {
    console.error("Error updating chemo note:", error);
    await slackLogger("Chemo Note Update Error", error.message, error, req);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateAllergy = async (req, res) => {
  const { admissionId, allergyId } = req.params; // Extract admissionId and allergyId from the request parameters
  const { allergyName, allergyType, notes, doctorId, dateTime } = req.body; // Extract fields to update

  try {
    // Find the PatientAdmission document by ID
    const admission = await PatientAdmissionModel.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ error: "Patient admission not found" });
    }

    // Find the specific allergy within the allergies array
    const allergy = admission.allergies.id(allergyId);
    if (!allergy) {
      return res.status(404).json({ error: "Allergy not found" });
    }

    // Update the allergy fields if provided
    if (allergyName !== undefined) allergy.allergyName = allergyName;
    if (allergyType !== undefined) allergy.allergyType = allergyType;
    if (notes !== undefined) allergy.notes = notes;
    if (doctorId !== undefined) allergy.doctorId = doctorId;
    if (dateTime !== undefined) allergy.dateTime = dateTime;

    // Save the updated admission document
    await admission.save();

    res.status(200).json({
      message: "Allergy updated successfully",
      updatedAllergy: allergy,
    });
  } catch (error) {
    console.error("Error updating allergy:", error);
    await slackLogger("Allergy Update Error", error.message, error, req);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateVisitNote = async (req, res) => {
  try {
    const { admissionId, noteId } = req.params; // Admission ID and Note ID from the URL
    const { note, doctorId, dateTime } = req.body; // Updated fields for the note

    // Find the admission and update the specific visit note
    const patientAdmission = await PatientAdmissionModel.findOneAndUpdate(
      {
        _id: admissionId,
        "visitNotes._id": noteId, // Find the admission and the specific note
      },
      {
        $set: {
          "visitNotes.$.note": note,
          "visitNotes.$.doctorId": doctorId,
          "visitNotes.$.dateTime": dateTime,
          "visitNotes.$.updatedAt": new Date(), // Update the timestamp
        },
      },
      { new: true } // Return the updated document
    );

    if (!patientAdmission) {
      return res
        .status(404)
        .json({ message: "Patient admission or visit note not found." });
    }

    res.status(200).json({
      message: "Visit note updated successfully.",
      data: patientAdmission,
    });
  } catch (error) {
    console.error("Error updating visit note:", error);
    await slackLogger("Visit Note Update Error", error.message, error, req);
    res.status(500).json({
      message: "An error occurred while updating the visit note.",
      error,
    });
  }
};
export const getIPDDetails = async (req, res) => {
  const { admissionId } = req.params;

  // Validate if the provided ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res.status(400).json({ message: "Invalid admission ID." });
  }

  try {
    // Fetch the IPD details and populate references
    const ipdDetails = await PatientAdmissionModel.findById(admissionId)
      .populate("patientId")
      .populate("patientId.patientType", "name")
      .populate("doctorId", "name specialization email phone")
      .populate({
        path: "wardHistory.roomId",
        select: "roomNumber roomType",
      })
      .populate({
        path: "wardHistory.wingId",
        select: "name description",
      })
      .populate(
        "dischargeSummary.dischargingDoctor",
        "name specialization email"
      )
      .exec();

    if (!ipdDetails) {
      return res
        .status(404)
        .json({ message: "IPD details not found for the given admission ID." });
    }

    return res.status(200).json(ipdDetails);
  } catch (error) {
    console.error("Error fetching IPD details:", error);
    await slackLogger("IPD Details Fetch Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Server error while fetching IPD details." });
  }
};
export const getIpdLabTests = async (req, res) => {
  try {
    // Fetch all labTests from the database
    const labTests = await PatientAdmissionModel.aggregate([
      {
        $project: {
          labTests: "$investigations.labTests",
        },
      },
      {
        $unwind: "$labTests",
      },
      {
        $replaceRoot: { newRoot: "$labTests" },
      },
    ]);

    if (!labTests || labTests.length === 0) {
      return res.status(404).json({
        message: "No lab tests found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: labTests,
    });
  } catch (error) {
    console.error("Error fetching lab tests:", error);
    await slackLogger("Lab Tests Fetch Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching lab tests.",
      error: error.message,
    });
  }
};
export const deleteInvestigationLabTest = async (req, res) => {
  const { admissionId, labTestId } = req.params;

  try {
    // Find the PatientAdmission and remove the specific lab test
    const updatedAdmission = await PatientAdmissionModel.findOneAndUpdate(
      { _id: admissionId },
      { $pull: { "investigations.labTests": { _id: labTestId } } },
      { new: true }
    );

    if (!updatedAdmission) {
      return res.status(404).json({
        success: false,
        message: "Patient Admission or Lab Test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lab test deleted successfully.",
      data: updatedAdmission,
    });
  } catch (error) {
    console.error("Error deleting lab test:", error);
    await slackLogger("Lab Test Deletion Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the lab test.",
      error: error.message,
    });
  }
};
export const editInvestigationLabTest = async (req, res) => {
  const { admissionId, labTestId } = req.params;
  const { name, dateTime, status } = req.body;

  try {
    // Update the specific lab test in the investigations.labTests array
    const updatedAdmission = await PatientAdmissionModel.findOneAndUpdate(
      {
        _id: admissionId,
        "investigations.labTests._id": labTestId,
      },
      {
        $set: {
          "investigations.labTests.$.name": name,
          "investigations.labTests.$.dateTime": dateTime,
          "investigations.labTests.$.status": status,
          "investigations.updatedAt": new Date(),
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedAdmission) {
      return res.status(404).json({
        success: false,
        message: "Patient Admission or Lab Test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lab test updated successfully.",
      data: updatedAdmission,
    });
  } catch (error) {
    console.error("Error updating lab test:", error);
    await slackLogger("Lab Test Update Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the lab test.",
      error: error.message,
    });
  }
};
export const addWardHistory = async (req, res) => {
  const { admissionId } = req.params;
  const { bedId, roomId, wingId } = req.body;

  try {
    // Validate IDs
    if (
      !mongoose.Types.ObjectId.isValid(admissionId) ||
      !mongoose.Types.ObjectId.isValid(roomId) ||
      !mongoose.Types.ObjectId.isValid(wingId) ||
      !mongoose.Types.ObjectId.isValid(bedId)
    ) {
      return res.status(400).json({ message: "Invalid IDs provided." });
    }

    // Find the Room
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }

    // Find the Bed within the Room
    const bed = room.beds.id(bedId);
    if (!bed) {
      return res
        .status(404)
        .json({ message: "Bed not found in the specified room." });
    }

    if (bed.isOccupied) {
      return res.status(400).json({ message: "The bed is already occupied." });
    }

    // Find the Patient Admission
    const patientAdmission = await PatientAdmissionModel.findById(admissionId);
    if (!patientAdmission) {
      return res.status(404).json({ message: "Patient Admission not found." });
    }

    // If there is a previous ward assigned, mark its bed as unoccupied
    const latestWardHistory =
      patientAdmission.wardHistory[patientAdmission.wardHistory.length - 1];
    if (latestWardHistory && latestWardHistory.roomId) {
      const previousRoom = await roomModel.findById(latestWardHistory.roomId);
      if (previousRoom) {
        const previousBed = previousRoom.beds.find(
          (b) => b.bedName === latestWardHistory.bedName
        );
        if (previousBed) {
          previousBed.isOccupied = false;
          await previousRoom.save();
        }
      }
    }

    // Update the Ward History
    const wardHistoryEntry = {
      roomId,
      wingId,
      bedName: bed.bedName,
      updatedAt: new Date(),
    };

    patientAdmission.wardHistory.push(wardHistoryEntry);
    await patientAdmission.save();

    // Mark the new bed as occupied
    bed.isOccupied = true;
    await room.save();

    return res.status(200).json({
      message: "Ward history added and bed updated successfully.",
      wardHistory: wardHistoryEntry,
    });
  } catch (error) {
    console.error("Error adding ward history: ", error);
    await slackLogger("Ward History Addition Error", error.message, error, req);
    return res.status(500).json({
      message: "An error occurred while processing the request.",
      error,
    });
  }
};
export const getWardHistory = async (req, res) => {
  const { admissionId } = req.params;

  try {
    // Validate admissionId
    if (!admissionId) {
      return res.status(400).json({ message: "Admission ID is required." });
    }

    // Fetch the specific patient admission and populate ward history
    const admission = await PatientAdmissionModel.findById(admissionId)
      .populate({
        path: "wardHistory.roomId",
        select: "roomNumber roomType",
      })
      .populate({
        path: "wardHistory.wingId",
        select: "name",
      });

    if (!admission) {
      return res.status(404).json({ message: "Patient admission not found." });
    }

    const wardHistoryData = admission.wardHistory.map((history) => ({
      roomId: history.roomId?._id,
      roomNumber: history.roomId?.roomNumber,
      roomType: history.roomId?.roomType,
      wingId: history.wingId?._id,
      wingName: history.wingId?.name,
      bedName: history.bedName,
      updatedAt: history.updatedAt,
    }));

    return res
      .status(200)
      .json({ message: "Ward history fetched successfully.", wardHistoryData });
  } catch (error) {
    console.error("Get ward history: ", error);
    await slackLogger("Ward History Fetch Error", error.message, error, req);
    return res.status(500).json({
      message: "An error occurred while fetching ward history.",
      error,
    });
  }
};

export const getIpdItems = async (req, res) => {
  try {
    const { patientAddmissionId, itemType } = req.query;

    // Validate OPD record
    const patientAdmission = await PatientAdmissionModel.findById(
      patientAddmissionId
    );
    4;
    if (!patientAdmission) {
      return res
        .status(404)
        .json({ message: "patientAdmission record not found11" });
    }

    // Validate Patient
    const patient = await patientModel.findById(patientAdmission.patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientType = await patientTypeModel.findById(patient.patientType);

    // Validate Item Type
    const itemTypeToModelMap = {
      opdConsultation: opdRateModel,
      ipdRate: ipdRateModel,
      labTest: labTestModel,
      package: packagesModel,
      service: servicesModel,
      nursing: nursingModel,
      visitingDoctor: visitingDoctorModel,
    };

    const model = itemTypeToModelMap[itemType];
    if (!model) {
      return res.status(400).json({ message: "Invalid item type" });
    }

    // Fetch items based on the patientType
    const items = await model.find({
      "patientTypes.patientType": patient.patientType,
    });

    // Generate the array of prices and include railwayCode if needed
    let prices = [];
    if (patientType.name.toLowerCase() === "railway") {
      const isNabh = patient.railwayType.toLowerCase() === "nabh";
      prices = items.map((item) => ({
        itemName: item.name || "",
        price: isNabh ? item.nabhPrice : item.nonNabhPrice || "",
        railwayCode: item.railwayCode || "", // Include railwayCode for railway patients
      }));
    } else {
      prices = items.map((item) => ({
        price: item.generalFees, // Return generalFees for non-railway patients
      }));
    }

    res
      .status(200)
      .json({ message: "IPD items fetched successfully!", prices });
  } catch (error) {
    console.error("Error get IPD Items: ", error);
    await slackLogger("IPD Items Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

async function generateSixDigitNumber() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await ipdBillModal.findOne({
      billNumber: randomNumber,
    });
    if (!existingBill) {
      isUnique = true;
    }
  }

  return randomNumber;
}

async function generateSixDigitReport() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingReport = await labReportModal.findOne({
      reportNumber: randomNumber,
    });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const submitIpdBill = async (req, res) => {
  try {
    console.log("IPD bill: ", req.body);
    const newBill = new ipdBillModal(req.body);

    // Handle payment information
    if (req.body.paymentInfo) {
      if (!newBill.transactionHistory) {
        newBill.transactionHistory = [];
      }
      newBill.transactionHistory.push(req.body.paymentInfo);

      if (parseInt(req.body.paymentInfo.remainingDues) > 0) {
        newBill.status = "due";
      } else if (parseInt(req.body.paymentInfo.remainingDues) === 0) {
        newBill.status = "paid";
      }
      newBill.grandRemainingDues = req.body.paymentInfo.remainingDues;
    }

    // Generate and assign a bill number
    newBill.billNumber = await generateSixDigitNumber();

    // Save the initial bill
    await newBill.save();

    // Handle pharmacy items
    await Promise.all(
      newBill.item.map(async (item) => {
        if (item.itemType.toLowerCase() === "pharmacy" && item.itemId) {
          const medicine = await medicineModal.findById(item.itemId);
          if (medicine) {
            medicine.stockQuantity =
              parseInt(medicine.stockQuantity) - parseInt(item.quantity);
            await medicine.save();
          }
        }
      })
    );

    // Handle lab test items
    if (newBill.item.some((item) => item.itemCategory === "lab test")) {
      const admission = await PatientAdmissionModel.findById(
        newBill.admissionId
      )
        .populate("patientId")
        .populate("doctorId");

      const labTestItems = newBill.item.filter(
        (item) => item.itemCategory === "lab test"
      );

      await Promise.all(
        labTestItems.map(async (item) => {
          const components = await newLabTestModal
            .findOne({ name: item.itemName })
            .populate("components");

          if (!components) {
            console.error(`No lab test found with name: ${item.itemName}`);
            return; // Skip if no components are found
          }

          // Map components to test components
          const testComponents = components.components.map((component) => {
            let calculateReferenceValue;
            if (admission.patientId.age < 12) {
              calculateReferenceValue = component.rangeDescription.childRange;
            } else if (admission.patientId.gender.toLowerCase() === "male") {
              calculateReferenceValue = component.rangeDescription.maleRange;
            } else if (admission.patientId.gender.toLowerCase() === "female") {
              calculateReferenceValue = component.rangeDescription.femaleRange;
            } else {
              calculateReferenceValue = component.rangeDescription.genRange;
            }
            return {
              componentId: component._id,
              componentName: component.name,
              result: "",
              referenceValue: calculateReferenceValue,
              unit: component.unit,
            };
          });

          // Generate report number
          const reportNumber = await generateSixDigitReport();

          // Update the item's report number
          item.reportNumber = reportNumber;

          // Create and save the lab report
          const newLabReport = new labReportModal({
            patientId: admission.patientId._id,
            patientName: admission.patientId.name,
            billNumber: newBill.billNumber,
            reportNumber,
            labTest: {
              testName: item.itemName,
              testCategory: item.itemCategory,
              testDate: item.itemDate,
              testPrice: item.totalCharge,
              testComponents,
            },
            prescribedBy: admission.doctorId._id,
            prescribedByName: admission.doctorId.name,
          });

          await newLabReport.save();
          console.log(`Lab report created for item: ${item.itemName}`);
        })
      );

      // Save the updated bill with report numbers
      await newBill.save();
    }

    res.status(200).json({ message: "Bill submitted successfully", newBill });
    console.log("Bill submitted successfully");
  } catch (error) {
    console.error("Error in submit IPD bill: ", error);
    await slackLogger("IPD Bill Submission Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getNewIpdBills = async (req, res) => {
  try {
    let admissionId = req.query.admissionId;
    if (!admissionId) {
      return res.status(400).json({ message: "Admission ID is required" });
    }
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await ipdBillModal.countDocuments({ admissionId });
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
    const bills = await ipdBillModal
      .find({ admissionId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const itemTypeToModelMap = {
      opdconsultation: opdRateModel,
      ipdrate: ipdRateModel,
      labtest: labTestModel,
      package: packagesModel,
      service: servicesModel,
      nursing: nursingModel,
      visitingdoctor: visitingDoctorModel,
      otherServices: otherServicesModel,
    };

    const processedBills = await Promise.all(
      bills.map(async (bill) => {
        const groupedItems = await bill.item.reduce(
          async (accPromise, item) => {
            const acc = await accPromise;

            if (item.itemType === "all") {
              let matched = false; // To ensure only one match is processed

              // Check in the models defined in itemTypeToModelMap
              for (const [itemType, model] of Object.entries(
                itemTypeToModelMap
              )) {
                if (matched) break;
                const foundItem = await model
                  .findOne({ name: item.itemName })
                  .lean();
                if (foundItem) {
                  console.log("itemType: ", itemType);
                  const targetType =
                    itemType === "package"
                      ? "operations"
                      : itemType === "opdconsultation"
                      ? "opd consultation"
                      : itemType === "ipdrate"
                      ? "ipd rate"
                      : itemType === "labtest"
                      ? "lab test"
                      : itemType === "visitingdoctor"
                      ? "visiting doctor"
                      : itemType === "otherServices"
                      ? "service"
                      : itemType;

                  if (!acc[targetType]) {
                    acc[targetType] = [];
                  }
                  acc[targetType].push({ ...item, category: targetType });
                  matched = true;
                }
              }

              // If not matched, check in the medicineModal
              if (!matched) {
                const medicineName = item.itemName.split("(")[0];
                const foundMedicine = await medicineModal
                  .findOne({ name: medicineName })
                  .lean();
                if (foundMedicine) {
                  if (!acc["pharmacy"]) {
                    acc["pharmacy"] = [];
                  }
                  acc["pharmacy"].push({
                    ...item,
                    itemType: "pharmacy",
                    itemName: item.itemName.split("(")[0],
                    category: "pharmacy",
                  });
                  matched = true;
                }
              }

              // Log a warning if no match is found
              if (!matched) {
                console.warn(
                  `Item with name '${item.itemName}' not found in any category.`
                );
              }
            } else {
              console.log("itemType: ", item.itemType);

              // Change package to operations in non-"all" itemType
              const targetType =
                item.itemType === "package"
                  ? "operations"
                  : item.itemType === "opdConsultation"
                  ? "opd consultation"
                  : item.itemType === "ipdRate"
                  ? "ipd rate"
                  : item.itemType === "labTest"
                  ? "lab test"
                  : item.itemType === "visitingDoctor"
                  ? "visiting doctor"
                  : item.itemType;

              console.log("targetType: ", targetType);
              if (!acc[targetType]) {
                acc[targetType] = [];
              }
              acc[targetType].push({ ...item, category: targetType });
            }

            return acc;
          },
          Promise.resolve({})
        );

        for (const [key, value] of Object.entries(groupedItems)) {
          groupedItems[key] = value.sort((a, b) => {
            if (a.itemDate && b.itemDate) {
              // Convert to Date objects for comparison
              const dateA = new Date(a.itemDate);
              const dateB = new Date(b.itemDate);
              return dateA - dateB; // Sort in ascending order
            }
            // Handle cases where one or both dates are missing
            return a.itemDate ? -1 : 1; // Ensure items with a date come before those without
          });
        }

        return {
          ...bill,
          groupedItems,
        };
      })
    );

    res.status(200).json({
      message: "Bills Fetched Successfully!",
      items: processedBills, // Processed bills with grouped items
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.error("Error in getting bills: ", error);
    await slackLogger("IPD Bill Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteIpdBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await ipdBillModal.findByIdAndDelete(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.item.forEach(async (item) => {
      if (item.itemType.toLowerCase() === "pharmacy") {
        if (item.itemId) {
          const medicine = await medicineModal.findById(item.itemId);
          medicine.stockQuantity =
            parseInt(medicine.stockQuantity) + parseInt(item.quantity);
          await medicine.save();
        }
      }
    });

    const deletedLabReports = await labReportModal.deleteMany({
      billNumber: bill.billNumber,
    });

    res
      .status(200)
      .json({ message: "Bill deleted successfully", bill, deletedLabReports });
  } catch (error) {
    console.error("Error deleting bill: ", error);
    await slackLogger("IPD Bill Deletion Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateIpdBill = async (req, res) => {
  try {
    const { billId } = req.params;
    console.log("updateIpdBill: ", req.body);

    // Find the old bill
    const oldBill = await ipdBillModal.findById(billId);
    if (!oldBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Calculate grand remaining dues
    req.body.grandRemainingDues =
      parseInt(req.body.grandTotals.finalPrice) -
      req.body.transactionHistory.reduce((acc, item) => {
        return acc + parseInt(item.paymentAmount || 0);
      }, 0);

    // Update the bill
    const updatedBill = await ipdBillModal.findByIdAndUpdate(billId, req.body, {
      new: true,
    });

    if (!updatedBill) {
      return res.status(404).json({ message: "Failed to update bill" });
    }

    const admission = await PatientAdmissionModel.findById(
      updatedBill.admissionId
    )
      .populate("patientId")
      .populate("doctorId");

    // Process each item in the updated bill
    await Promise.all(
      updatedBill.item.map(async (item) => {
        // Pharmacy item stock adjustment
        if (item.itemType.toLowerCase() === "pharmacy" && item.itemId) {
          const oldItem = oldBill.item.find(
            (itemObj) => itemObj.itemId === item.itemId
          );
          const medicine = await medicineModal.findById(item.itemId);
          if (medicine) {
            medicine.stockQuantity =
              parseInt(medicine.stockQuantity) -
              parseInt(oldItem?.quantity || 0) +
              parseInt(item.quantity || 0);
            await medicine.save();
          }
        }

        // Lab test handling using reportNumber
        if (item.itemCategory === "lab test") {
          const oldLabReport = oldBill.item.find(
            (oldItem) => oldItem.reportNumber === item.reportNumber
          );

          if (!item.reportNumber) {
            console.error("Report number not found for lab test item");
            await slackLogger(
              "Report Number Not Found",
              "Report number not found for lab test item",
              item,
              req
            );
            return;
          }

          if (oldLabReport) {
            // Update existing lab report
            await labReportModal.updateOne(
              { reportNumber: item.reportNumber },
              {
                $set: {
                  "labTest.testDate": item.itemDate,
                  "labTest.testPrice": item.totalCharge,
                },
              }
            );
          } else {
            // Add a new lab report if not found
            const components = await newLabTestModal
              .findOne({ name: item.itemName })
              .populate("components");

            if (components) {
              // Map components to test components
              const testComponents = components.components.map((component) => {
                let calculateReferenceValue;
                if (admission.patientId.age < 12) {
                  calculateReferenceValue =
                    component.rangeDescription.childRange;
                } else if (
                  admission.patientId.gender.toLowerCase() === "male"
                ) {
                  calculateReferenceValue =
                    component.rangeDescription.maleRange;
                } else if (
                  admission.patientId.gender.toLowerCase() === "female"
                ) {
                  calculateReferenceValue =
                    component.rangeDescription.femaleRange;
                } else {
                  calculateReferenceValue = component.rangeDescription.genRange;
                }
                return {
                  componentId: component._id,
                  componentName: component.name,
                  result: "",
                  referenceValue: calculateReferenceValue,
                  unit: component.unit,
                };
              });

              const reportNumber = await generateSixDigitReport();

              const newLabReport = new labReportModal({
                patientId: admission.patientId._id,
                patientName: admission.patientId.name,
                billNumber: updatedBill.billNumber,
                reportNumber,
                labTest: {
                  testName: item.itemName,
                  testCategory: item.itemCategory,
                  testDate: item.itemDate,
                  testPrice: item.totalCharge,
                  testComponents,
                },
                prescribedBy: admission.doctorId._id,
                prescribedByName: admission.doctorId.name,
              });

              await newLabReport.save();
            }
          }
        }
      })
    );

    // Remove lab reports for deleted lab test items
    const updatedLabReports = updatedBill.item
      .filter((item) => item.itemCategory === "lab test")
      .map((item) => item.reportNumber);

    const oldLabReports = oldBill.item
      .filter((item) => item.itemCategory === "lab test")
      .map((item) => item.reportNumber);

    const deletedLabReports = oldLabReports.filter(
      (reportNumber) => !updatedLabReports.includes(reportNumber)
    );

    await Promise.all(
      deletedLabReports.map(async (reportNumber) => {
        await labReportModal.deleteOne({ reportNumber });
      })
    );

    res
      .status(200)
      .json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
    console.error("Error updating bill: ", error);
    await slackLogger("IPD Bill Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const addCustomPayment = async (req, res) => {
  try {
    const { billId, paymentType, paymentAmount, remainingDues, transactionId } =
      req.body;
    const bill = await ipdBillModal.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }
    if (parseInt(bill.grandRemainingDues) < parseInt(paymentAmount)) {
      return res
        .status(400)
        .json({ message: "Payment amount exceeds total amount" });
    }
    if (!bill.transactionHistory) {
      bill.transactionHistory = [];
    }
    bill.transactionHistory.push(req.body);
    bill.grandRemainingDues =
      parseInt(bill.grandTotals.finalPrice) -
      bill.transactionHistory.reduce((acc, item) => {
        return acc + parseInt(item.paymentAmount);
      }, 0);
    if (bill.grandRemainingDues == 0) {
      bill.status = "paid";
    }
    await bill.save();
    res.status(200).json({ message: "Payment added successfully" });
  } catch (error) {
    console.log("Error adding custom payment: ", error);
    await slackLogger(
      "Custom Payment Addition Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllIpdsItems = async (req, res) => {
  try {
    const itemTypeToModelMap = {
      opdConsultation: opdRateModel,
      ipdRate: ipdRateModel,
      labTest: labTestModel,
      package: packagesModel,
      service: servicesModel,
      nursing: nursingModel,
      visitingDoctor: visitingDoctorModel,
    };

    const { name } = req.query;

    // Use regex for name search directly in the database query
    const regexFilter = name ? { name: { $regex: name, $options: "i" } } : {};

    // Fetch all items in parallel with the filter applied
    const totalItems = (
      await Promise.all(
        Object.entries(itemTypeToModelMap).map(async ([itemType, model]) => {
          const items = await model.find(regexFilter);
          console.log("itemType: ", itemType, "model", model);
          return items.map((item) => ({
            ...item.toObject(), // Convert document to plain object
            itemCategory: itemType, // Add category field
          }));
        })
      )
    ).flat();

    res.status(200).json({
      message: "Items fetched successfully!",
      items: totalItems,
      totalItems: totalItems.length,
    });
  } catch (error) {
    console.error("Error in fetching items: ", error);
    await slackLogger("Error in getAllIpdsItems", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllTypeItems = async (req, res) => {
  try {
    const itemTypeToModelMap = {
      opdConsultation: opdRateModel,
      ipdRate: ipdRateModel,
      labTest: labTestModel,
      package: packagesModel,
      service: servicesModel,
      nursing: nursingModel,
      visitingDoctor: visitingDoctorModel,
      pharmacy: medicineModal,
      laboratory: newLabTestModal,
      otherServices: otherServicesModel,
    };

    const { name } = req.query;

    // Use regex for name search directly in the database query
    const regexFilter = name ? { name: { $regex: name, $options: "i" } } : {};

    // Fetch all items in parallel with the filter applied
    const totalItems = (
      await Promise.all(
        Object.entries(itemTypeToModelMap).map(async ([key, model]) => {
          let items;
          if (key === "pharmacy") {
            // Apply additional filtering for pharmacy (medicineModal)
            items = await model.find(regexFilter);
            // Filter out items that don't have the required fields
            items = items.filter(
              (item) => item.pricePerUnit && item.batchNumber && item.expiryDate
            );
          } else {
            // For other models, apply the regex filter
            items = await model.find(regexFilter);
          }
          // Add the category field to each item
          return items.map((item) => ({
            ...item.toObject(),
            itemCategory: key === "otherServices" ? "service" : key,
          }));
        })
      )
    ).flat();

    res.status(200).json({
      message: "Items fetched successfully!",
      items: totalItems,
      totalItems: totalItems.length,
    });
  } catch (error) {
    console.error("Error in fetching items: ", error);
    await slackLogger("Error in getAllTypeItems", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getIpdStats = async (req, res) => {
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
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

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

    const bills = await ipdBillModal
      .find(query)
      .sort({ date: -1 })
      .populate({
        path: "admissionId",
        populate: {
          path: "patientId",
          select: "patientName uhid paymentType",
        },
      })
      .lean();

    const totalBills = bills.length;
    const totalCharge = bills.reduce(
      (acc, bill) =>
        acc +
        (isNaN(bill.grandTotals?.totalCharge)
          ? 0
          : parseFloat(bill.grandTotals.totalCharge)),
      0
    );
    const totalAmount = bills.reduce(
      (acc, bill) =>
        acc +
        (isNaN(bill.grandTotals?.finalPrice)
          ? 0
          : parseFloat(bill.grandTotals.finalPrice)),
      0
    );
    const totalDiscount = bills.reduce(
      (acc, bill) =>
        acc +
        (isNaN(bill.grandTotals?.totalDiscount)
          ? 0
          : parseFloat(bill.grandTotals.totalDiscount)),
      0
    );

    const billWithPatient = bills.map((bill) => {
      const patient = bill.admissionId?.patientId || {};
      return {
        ...bill,
        patientName: patient.patientName || "N/A",
        uhid: patient.uhid || "N/A",
        patientPaymentType: patient.paymentType || "N/A",
      };
    });

    const totalCreditPatients = billWithPatient.filter(
      (bill) => bill.patientPaymentType === "credit"
    );

    const totalCreditAmount = totalCreditPatients.reduce(
      (acc, bill) => acc + (parseFloat(bill.grandTotals?.finalPrice) || 0),
      0
    );

    const totalCashPatients = billWithPatient.filter(
      (bill) => bill.patientPaymentType === "cash"
    );

    const totalCashAmount = totalCashPatients.reduce(
      (acc, bill) => acc + (parseFloat(bill.grandTotals?.finalPrice) || 0),
      0
    );

    return res.status(200).json({
      success: true,
      message: "IPD Stats fetched successfully.",
      totalBills,
      totalCharge: totalCharge.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      totalCreditPatients: totalCreditPatients.length,
      totalCreditAmount: totalCreditAmount,
      totalCashPatients: totalCashPatients.length,
      totalCashAmount: totalCashAmount,
    });
  } catch (error) {
    console.error("Error fetching IPD Stats: ", error);
    await slackLogger("IPD Stats Fetch Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching IPD Stats.",
      error: error.message,
    });
  }
};

// export const getIpdReport = async (req, res) => {
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

//     // Parse dates
//     const start = new Date(startDate);
//     const end = new Date(endDate);

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
//       admissionDate: {
//         $gte: start,
//       },
//       "dischargeSummary.dischargeDate": {
//         $gte: end,
//       },
//     };

//     const patientAdmissions = await PatientAdmissionModel.find(query)
//       .select(
//         "patientId admissionDate dischargeSummary doctorId wardHistory reasonForAdmission referenceDoctor status"
//       )
//       .populate("doctorId")
//       .populate("wardHistory.roomId")
//       .populate("wardHistory.wingId")
//       .lean();

//     const totalAdmissions = patientAdmissions.length;

//     const paymentProcessed = Promise.all(
//       patientAdmissions.map(async (admission) => {
//         const payments = await patientPaymentModel.find({
//           admissionId: admission._id,
//         });
//         return admission.payments = payments || null;
//       })
//     );

//   } catch (error) {
//     console.error("Error fetching IPD Report: ", error);
//     await slackLogger("IPD Report Fetch Error", error.message, error, req);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while fetching IPD Report.",
//       error: error.message,
//     });
//   }
// };

export const getDateWisePayment = async (req, res) => {
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
      "transactions.date": {
        $gte: start,
        $lte: end,
      },
    };

    const patientPayments = await patientPaymentModel
      .find(query)
      .populate({
        path: "admissionId",
        populate: [
          {
            path: "doctorId", // Populate doctorId
          },
          {
            path: "wardHistory.wingId", // Populate wingId inside wardHistory
          },
          {
            path: "wardHistory.roomId", // Populate roomId inside wardHistory
          },
        ],
      })
      .lean();

    const payments = patientPayments.reduce((acc, curr) => {
      if (curr.transactions) {
        // Filter transactions to include only those within the specified range
        const filteredTransactions = curr.transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= start && transactionDate <= end;
        });

        // Process only filtered transactions
        filteredTransactions.forEach((transaction) => {
          const date = new Date(transaction.date).toLocaleDateString();

          // Ensure the date exists in the accumulator
          if (!acc[date]) {
            acc[date] = [];
          }

          // Add patient details to each transaction
          acc[date].push({
            ...transaction,
            patientId: curr.patientId || "Unknown Patient ID",
            patientName: curr.patientName || "Unknown Patient Name",
            admissionId: curr.admissionId?._id || "Unknown Admission ID",
            doctorName: curr.admissionId?.doctorId?.name || "Unknown Doctor",
            doctorId: curr.admissionId?.doctorId?._id || "Unknown Doctor ID",
            wing:
              curr.admissionId?.wardHistory?.length > 0
                ? curr.admissionId.wardHistory[
                    curr.admissionId.wardHistory.length - 1
                  ]?.wingId || "Unknown Wing"
                : "No Ward History",
          });
        });
      }
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      message: "Date Wise Payment fetched successfully.",
      payments: Object.values(payments).flat(),
    });
  } catch (error) {
    console.error("Error fetching Date Wise Payment: ", error);
    await slackLogger(
      "Date Wise Payment Fetch Error",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching Date Wise Payment.",
      error: error.message,
    });
  }
};

export const roomOccupancy = async (req, res) => {
  try {
    const { wingId, roomId, bedName } = req.body;
    const wing = await wingModel.findById(wingId);
    if (!wing) {
      return res.status(404).json({ message: "Wing not found" });
    }
    const room = await roomModel.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // find room in wing
    const wingRoom = wing.rooms.includes(roomId);
    if (!wingRoom) {
      return res.status(404).json({ message: "Room not found in wing" });
    }
    const bed = room.beds.find((bed) => bed.bedName == bedName);
    if (!bed) {
      return res.status(404).json({ message: "Bed not found" });
    }
    bed.isOccupied = false;
    room.save();
    return res
      .status(200)
      .json({ message: "Room Occupancy updated successfully", bed });
  } catch (error) {
    console.error("Error in roomOccupancy: ", error);
    await slackLogger("Room Occupancy Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};
