import { slackLogger } from "../middleware/webHook.js";
import opdBillModal from "../models/inventory/opdBill.modal.js";
import ipdRateModel from "../models/ipdRate.model.js";
import labReportModal from "../models/lab/labReport.modal.js";
import labTestModel from "../models/lab/labTest.model.js";
import newLabTestModal from "../models/lab/newLabTest.modal.js";
import nursingModel from "../models/nursing.model.js";
import opdModel from "../models/opd.model.js";
import opdRateModel from "../models/opdRate.model.js";
import packagesModel from "../models/packages.model.js";
import patientModel from "../models/patient.model.js";
import PatientAdmissionModel from "../models/PatientAdmission.model.js";
import patientTypeModel from "../models/patientType.model.js";
import paymentModel from "../models/payment.model.js";
import medicineModal from "../models/pharmacy/medicine.modal.js";
import servicesModel from "../models/services.model.js";
import visitingDoctorModel from "../models/visitingDoctor.model.js";
// import pharmacyModel from "../models/pharmacy/"

export const createOpd = async (req, res) => {
  try {
    // Find patient by phone number
    const patient = await patientModel.findOne({ mobile: req.body.phone });
    if (!patient) {
      return res.json({
        success: false,
        message: "Patient with this phone number doesn't exist. Create Patient",
      });
    }

    // Extract necessary fields from request body
    const { patientName, appointment, treatment } = req.body;

    // Set up OPD record data
    const body = {
      patientId: patient._id,
      patientName,
      appointment,
      treatment,
    };

    // Create and save OPD record
    const opdRecord = new opdModel(body);
    await opdRecord.save();

    res.status(201).json({
      message: "OPD record created successfully",
      opdRecord,
    });
  } catch (error) {
    console.error("Error creating OPD or Payment record:", error.message);
    await slackLogger("OPD Creation Error", error.messsage, error, req);
    res.status(400).json({
      message: "Error creating OPD record",
      error: error.message,
    });
  }
};
export const getAllOpdRecords = async (req, res) => {
  try {
    const opdDetails = await opdModel
      .find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("patientId", "patientName age gender mobile uhid") // Adjust fields as per your patient model
      .populate("appointment.department", "name")
      .populate("appointment.doctor", "name");
    res.status(200).json({
      success: true,
      message: "All opds fetched.",
      opdDetails,
    });
  } catch (error) {
    console.error("Error fetching OPD records:", error.message);
    await slackLogger("OPD Fetch Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error retrieving OPD records", error: error.message });
  }
};
export const deleteOpd = async (req, res) => {
  try {
    const exisitngOpd = await opdModel.findById(req.params.oId);
    const deleted = await opdModel.findByIdAndDelete(req.params.oId);
    if (deleted) {
      // delete bills regarding opd Id
      await opdBillModal.deleteMany({ opdId: exisitngOpd.opdId });
      return res.status(200).json({
        success: true,
        message: "OPD deleted successfully.",
        deleted,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to delete the OPD",
      });
    }
  } catch (error) {
    console.error("Error deleting OPD record:", error.message);
    await slackLogger("OPD Deletion Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error deleting OPD record", error: error.message });
  }
};
export const updateOpd = async (req, res) => {
  const { id } = req.params; // Assuming you pass the OPD ID in the URL
  const {
    patientName,
    phone, // Add phone to the model if needed
    appointment,
    administrativeDetails,
  } = req.body;

  try {
    // Find and update the OPD record
    const updatedOpd = await opdModel
      .findByIdAndUpdate(
        id,
        {
          patientName,
          appointment,
          administrativeDetails,
          phone,
        },
        { new: true, runValidators: true } // Returns the updated document
      )
      .populate("patientId", "patientName age gender mobile") // Populate patient details
      .populate("appointment.department", "name") // Populate department
      .populate("appointment.doctor", "name");

    if (!updatedOpd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    res
      .status(200)
      .json({ message: "OPD record updated successfully", updatedOpd });
  } catch (error) {
    console.error("Error updating OPD record:", error.message);
    await slackLogger("OPD Update Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error updating OPD record", error: error.message });
  }
};
export const getOpd = async (req, res) => {
  try {
    const opdDetail = await opdModel
      .findOne({ _id: req.params.id })
      .populate("patientId", "patientName age gender mobile")
      .populate("appointment.department", "name")
      .populate("appointment.doctor", "name");
    if (!opdDetail) {
      return res.json({
        message: "unable to update fetch the updated opd.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "fetched successfully.",
      opdDetail,
    });
  } catch (error) {
    console.error("Error fetching OPD record:", error.message);
    await slackLogger("OPD Fetch Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "Error fetching OPD record", error: error.message });
  }
};
export const getOpdByOpdId = async (req, res) => {
  try {
    const { oId } = req.params;
    // console.log("hit");
    // Find OPD by ID and populate the necessary fields
    const opdDetails = await opdModel
      .findOne({ opdId: oId })
      .populate("patientId", "name age gender uhid height weight bloodGroup")
      .populate("appointment.department", "name location")
      .populate("appointment.doctor", "name specialty")
      .populate("treatment.assignedTests.testId", "name description");

    // console.log(opdDetails);

    if (!opdDetails) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    res.status(200).json({ success: true, opdDetails });
  } catch (error) {
    console.error("Error fetching OPD record:", error.message);
    await slackLogger("OPD Fetch Error by ID", error.message, error, req);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const addMedications = async (req, res) => {
  const { oId } = req.params;
  const medications = req.body;
  try {
    const validMedications = medications.filter(
      (med) => med.name && med.dosage && med.frequency
    );

    // If no valid medications, return an error response
    if (validMedications.length === 0) {
      return res.status(400).json({ message: "No valid medications provided" });
    }

    // Find the OPD record by ID
    const opd = await opdModel.findOne({ opdId: oId });
    if (!opd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    // Mark existing medications as previous
    opd.treatment.medications.forEach((med) => {
      med.isPrevious = true; // Mark existing medications as previous
    });

    // Add new medications to the medications array
    const newMedications = medications.map((med) => ({
      ...med,
      isPrevious: false, // New medications will not be marked as previous
    }));

    opd.treatment.medications.push(...newMedications);

    // Save the updated OPD record
    await opd.save();

    return res
      .status(200)
      .json({ message: "Medications assigned successfully", opd });
  } catch (error) {
    console.error("Error assigning medications:", error);
    await slackLogger("Medication Assignment Error", error.message, error, req);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const addAllergies = async (req, res) => {
  const { oId } = req.params;
  const { allergyName, severity, notes } = req.body;

  if (!allergyName || !severity) {
    return res
      .status(400)
      .json({ message: "Allergy name and severity are required." });
  }

  try {
    const opd = await opdModel.findOne({ opdId: oId });
    if (!opd) {
      return res.status(404).json({ message: "OPD record not found." });
    }

    const newAllergy = {
      name: allergyName,
      severity,
      notes,
      dateReported: new Date(),
    };

    opd.treatment.allergies.push(newAllergy);
    await opd.save();

    res
      .status(200)
      .json({ message: "Allergy added successfully.", allergy: newAllergy });
  } catch (error) {
    console.error("Error adding allergy:", error);
    await slackLogger("Allergy Addition Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "An error occurred while adding the allergy.", error });
  }
};
export const assignTests = async (req, res) => {
  const { id } = req.params; // Get the OPD ID from the request parameters
  const { tests, notes, status } = req.body; // Get the array of test IDs, the single note, and status from the request body
  // console.log(req.body);

  try {
    // Use findOneAndUpdate directly to find and update in one step
    const updatedOpd = await opdModel.findOneAndUpdate(
      { opdId: id }, // Find the OPD by opdId
      {
        $push: {
          "treatment.assignedTests": {
            $each: tests.map((testId) => ({
              testId,
              status, // Add the status for each assigned test
              notes,
            })),
          },
        },
        "treatment.notes": notes, // Store the single note for all tests
      },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedOpd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Tests assigned successfully.",
      updatedOpd,
    }); // Respond with the updated OPD document
  } catch (error) {
    console.error("Error assigning tests:", error);
    await slackLogger("Test Assignment Error", error.message, error, req);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const addAssessment = async (req, res) => {
  const { opdId } = req.params; // Get the opdId from URL parameters
  const { assessmentContent } = req.body; // Get the assessment content from the request body

  try {
    // Find the OPD by opdId
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Update the assessment field with the new content
    opd.assessment = assessmentContent;
    await opd.save();

    res.status(200).json({ message: "Assessment added successfully", opd });
  } catch (error) {
    console.error("Error adding assessment:", error);
    await slackLogger("Assessment Addition Error", error.message, error, req);
    res
      .status(500)
      .json({ message: "An error occurred while adding assessment" });
  }
};
export const getPaymentsHistory = async (req, res) => {
  try {
    const { oId } = req.params; // Get opdId from request parameters

    // Find the OPD record by ID and populate the paymentIds array with doctor details
    const opdRecord = await opdModel
      .findOne({ opdId: oId })
      .populate("paymentIds") // Populate paymentIds with payment details
      .populate("patientId", "mobile") // Optionally populate patient details
      .populate({
        path: "paymentIds", // Populate payments array
        populate: {
          path: "opdId", // Reference to OPD model
          populate: {
            path: "appointment.doctor", // Get doctor details from OPD
            select: "name specialization", // Specify the fields you need from the doctor
          },
        },
      });

    if (!opdRecord) {
      return res.status(404).json({
        success: false,
        message: "OPD record not found.",
      });
    }

    res.status(200).json({
      success: true,
      payments: opdRecord.paymentIds,
    });
  } catch (error) {
    console.error("Error fetching OPD with payments:", error.message);
    await slackLogger("Payment Fetch Error", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Error fetching OPD details.",
      error: error.message,
    });
  }
};
export const addFollowUpDate = async (req, res) => {
  const { opdId } = req.params; // The OPD ID passed in the request parameters
  const { followUpDate, notes, doctorId } = req.body; // Data for the new follow-up

  try {
    // Find the OPD record by ID
    const opd = await opdModel.findOne({ opdId: opdId });
    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Add the new follow-up date to the history
    opd.treatment.followUpDatesHistory.push({
      date: followUpDate,
      notes,
      assignedBy: doctorId,
    });

    // Save the updated OPD record
    await opd.save();

    res.status(200).json({
      message: "Follow-up date added successfully",
      followUpHistory: opd.treatment.followUpDatesHistory,
    });
  } catch (error) {
    console.error("Error adding follow-up date:", error);
    await slackLogger(
      "Follow-up Date Addition Error",
      error.message,
      error,
      req
    );
    res
      .status(500)
      .json({ message: "Error adding follow-up date", error: error.message });
  }
};
export const getFollowUpHistory = async (req, res) => {
  const { opdId } = req.params;

  try {
    // Find the OPD record and only select the follow-up dates history
    const opd = await opdModel
      .findOne({ opdId: opdId })
      .select("treatment.followUpDatesHistory")
      .populate("treatment.followUpDatesHistory.assignedBy", "name");
    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    res
      .status(200)
      .json({ followUpHistory: opd.treatment.followUpDatesHistory });
  } catch (error) {
    console.error("Error fetching follow-up history:", error);
    await slackLogger(
      "Follow-up History Fetch Error",
      error.message,
      error,
      req
    );
    res.status(500).json({
      message: "Error fetching follow-up history",
      error: error.message,
    });
  }
};
export const getOpdMedications = async (req, res) => {
  try {
    const { opdId } = req.params; // Extract the opdId from the request params

    // Find the OPD document using the provided opdId
    const opd = await opdModel.findOne({ opdId });

    // If the OPD document is not found, return an error response
    if (!opd) {
      return res.status(404).json({
        success: false,
        message: `OPD with ID ${opdId} not found.`,
      });
    }

    // Extract the medications from the treatment object
    const medications = opd.treatment.medications;

    // Return the medications list in the response
    res.status(200).json({
      success: true,
      medications,
    });
  } catch (error) {
    console.error("Error fetching medications:", error.message);
    await slackLogger("Medication Fetch Error", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to fetch medications. Please try again later.",
    });
  }
};
export const getOpdAllergies = async (req, res) => {
  try {
    // console.log('hit')
    const { opdId } = req.params; // Extract the opdId from the request params

    // Find the OPD document using the provided opdId
    const opd = await opdModel.findOne({ opdId });

    // If the OPD document is not found, return an error response
    if (!opd) {
      return res.status(404).json({
        success: false,
        message: `OPD with ID ${opdId} not found.`,
      });
    }

    // Extract the allergies from the treatment object
    const allergies = opd.treatment.allergies;

    // Return the allergies list in the response
    res.status(200).json({
      success: true,
      allergies,
    });
  } catch (error) {
    console.error("Error fetching allergies:", error.message);
    await slackLogger("Allergy Fetch Error", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to fetch allergies. Please try again later.",
    });
  }
};
export const getOpdTests = async (req, res) => {
  try {
    const { opdId } = req.params; // Extract the opdId from the request params

    // Find the OPD document using the provided opdId
    const opd = await opdModel
      .findOne({ opdId })
      .populate("treatment.assignedTests.testId");

    // If the OPD document is not found, return an error response
    if (!opd) {
      return res.status(404).json({
        success: false,
        message: `OPD with ID ${opdId} not found.`,
      });
    }

    // Extract the assignedTests from the treatment object
    const assignedTests = opd.treatment.assignedTests;

    // Return the assignedTests list in the response
    res.status(200).json({
      success: true,
      assignedTests,
    });
  } catch (error) {
    console.error("Error fetching assignedTests:", error.message);
    await slackLogger("Assigned Test Fetch Error", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignedTests. Please try again later.",
    });
  }
};
export const deleteMedication = async (req, res) => {
  const { opdId, medicationId } = req.params;

  try {
    // Find the OPD record by ID
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    // Find the medication to delete
    const medicationIndex = opd.treatment.medications.findIndex(
      (med) => med._id.toString() === medicationId
    );

    if (medicationIndex === -1) {
      return res
        .status(404)
        .json({ message: "Medication not found in the OPD record" });
    }

    // Remove the medication from the array
    opd.treatment.medications.splice(medicationIndex, 1);

    // Save the updated OPD record
    await opd.save();

    return res
      .status(200)
      .json({ message: "Medication deleted successfully", opd });
  } catch (error) {
    console.log("Error deleting medication:", error);
    await slackLogger("Medication Deletion Error", error.message, error, req);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const deleteAllergies = async (req, res) => {
  const { opdId, allergyId } = req.params;

  try {
    // Find the OPD record by ID
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    const allergyIndex = opd.treatment.allergies.findIndex(
      (allergy) => allergy._id.toString() === allergyId
    );

    if (allergyIndex === -1) {
      return res
        .status(404)
        .json({ message: "Allergy not found in the OPD record" });
    }

    // Remove the medication from the array
    opd.treatment.allergies.splice(allergyIndex, 1);

    // Save the updated OPD record
    await opd.save();

    return res
      .status(200)
      .json({ message: "Allergy deleted successfully", opd });
  } catch (error) {
    console.error("Error deleting allergy:", error);
    await slackLogger("Allergy Deletion Error", error.message, error, req);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const deleteAssignedTest = async (req, res) => {
  const { opdId, testId } = req.params;

  try {
    // Find the OPD record by ID
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    const testIndex = opd.treatment.assignedTests.findIndex(
      (test) => test._id.toString() === testId
    );

    if (testIndex === -1) {
      return res
        .status(404)
        .json({ message: "Test not found in the OPD record" });
    }

    // Remove the medication from the array
    opd.treatment.assignedTests.splice(testIndex, 1);

    // Save the updated OPD record
    await opd.save();

    return res.status(200).json({ message: "Test deleted successfully", opd });
  } catch (error) {
    console.error("Error deleting test:", error);
    await slackLogger("Test Deletion Error", error.message, error, req);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const deleteFollowupHistory = async (req, res) => {
  const { opdId, followupId } = req.params;

  try {
    // Find the OPD record by ID
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    const followupIndex = opd.treatment.followUpDatesHistory.findIndex(
      (followup) => followup._id.toString() === followupId
    );

    if (followupIndex === -1) {
      return res
        .status(404)
        .json({ message: "Follow up not found in the OPD record" });
    }

    // Remove the medication from the array
    opd.treatment.followUpDatesHistory.splice(followupIndex, 1);

    // Save the updated OPD record
    await opd.save();

    return res
      .status(200)
      .json({ message: "Followup deleted successfully", opd });
  } catch (error) {
    console.error("Error deleting followup:", error);
    await slackLogger("Followup Deletion Error", error.message, error, req);
    return res.status(500).json({ message: "Server error", error });
  }
};
export const updateMedication = async (req, res) => {
  const { opdId, medicineId } = req.params; // Get opdId and medicineId from the URL params
  // console.log(req.body);
  const updatedData = req.body; // Get the updated data from the request body
  try {
    // Find the OPD entry by opdId
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Find the specific medication within the treatment array
    const medicationIndex = opd.treatment.medications.findIndex(
      (med) => med._id.toString() === medicineId
    );

    if (medicationIndex === -1) {
      return res.status(404).json({ message: "Medication not found" });
    }

    // Update the medication fields with the new data
    opd.treatment.medications[medicationIndex] = {
      ...opd.treatment.medications[medicationIndex],
      ...updatedData,
    };

    // Save the updated OPD record
    await opd.save();

    res.status(200).json({
      message: "Medication updated successfully",
      updatedMedication: opd.treatment.medications[medicationIndex],
    });
  } catch (error) {
    console.error("Error updating medication:", error);
    await slackLogger("Medication Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateOpdAllergy = async (req, res) => {
  const { opdId, allergyId } = req.params; // Get opdId and medicineId from the URL params
  // console.log(req.body);
  const updatedData = req.body; // Get the updated data from the request body
  try {
    // Find the OPD entry by opdId
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Find the specific medication within the treatment array
    const allergyIndex = opd.treatment.allergies.findIndex(
      (allergy) => allergy._id.toString() === allergyId
    );

    if (allergyIndex === -1) {
      return res.status(404).json({ message: "Allergy not found" });
    }

    // Update the medication fields with the new data
    opd.treatment.allergies[allergyIndex] = {
      ...opd.treatment.allergies[allergyIndex],
      ...updatedData,
    };

    // Save the updated OPD record
    await opd.save();

    res.status(200).json({
      message: "Allergy updated successfully",
      updatedAllergy: opd.treatment.allergies[allergyIndex],
    });
  } catch (error) {
    console.error("Error updating allergy:", error);
    await slackLogger("Allergy Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateFollowup = async (req, res) => {
  const { opdId, followupId } = req.params; // Get opdId and medicineId from the URL params
  // console.log(req.body);
  const updatedData = req.body; // Get the updated data from the request body
  try {
    // Find the OPD entry by opdId
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Find the specific followup within the treatment array
    const followupIndex = opd.treatment.followUpDatesHistory.findIndex(
      (followup) => followup._id.toString() === followupId
    );

    if (followupIndex === -1) {
      return res.status(404).json({ message: "Followup not found" });
    }

    // Update the medication fields with the new data
    opd.treatment.followUpDatesHistory[followupIndex] = {
      ...opd.treatment.followUpDatesHistory[followupIndex],
      ...updatedData,
    };

    // Save the updated OPD record
    await opd.save();

    res.status(200).json({
      message: "Followup updated successfully",
      updatedFollowup: opd.treatment.followUpDatesHistory[followupIndex],
    });
  } catch (error) {
    console.error("Error updating followup:", error);
    await slackLogger("Followup Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};
export const updateOpdTest = async (req, res) => {
  const { opdId, testId } = req.params;
  // console.log(req.body);
  const updatedData = req.body; // Get the updated data from the request body
  try {
    // Find the OPD entry by opdId
    const opd = await opdModel.findOne({ opdId });

    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Find the specific followup within the treatment array
    const testIndex = opd.treatment.assignedTests.findIndex(
      (test) => test._id.toString() === testId
    );

    if (testIndex === -1) {
      return res.status(404).json({ message: "test not found" });
    }

    opd.treatment.assignedTests[testIndex] = {
      ...opd.treatment.assignedTests[testIndex],
      ...updatedData,
    };

    // Save the updated OPD record
    await opd.save();

    res.status(200).json({
      message: "Test updated successfully",
      updatedTest: opd.treatment.assignedTests[testIndex],
    });
  } catch (error) {
    console.error("Error updating test:", error);
    await slackLogger("Test Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOpdItems = async (req, res) => {
  try {
    const { opdId, itemType } = req.query;

    // Validate OPD record
    const opd = await opdModel.findOne({ opdId });
    if (!opd) {
      return res.status(404).json({ message: "OPD record not found" });
    }

    // Validate Patient
    const patient = await patientModel.findById(opd.patientId);
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

    res.status(200).json({ prices });
  } catch (error) {
    console.error("Error fetching OPD items:", error);
    await slackLogger("OPD Items Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

async function generateSixDigitNumber() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await opdBillModal.findOne({
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

export const submitOpdBill = async (req, res) => {
  try {
    const newBill = new opdBillModal(req.body);
    if (req.body.paymentInfo) {
      if (!newBill.transactionHistory) {
        newBill.transactionHistory = [];
      }
      newBill.transactionHistory.push(req.body.paymentInfo);
      // if (parseInt(req.body.paymentInfo.remainingDues) > 0) {
      //   newBill.status = "due";
      // } else if (parseInt(req.body.paymentInfo.remainingDues) === 0) {
      //   newBill.status = "paid";
      // }
      // newBill.grandRemainingDues = req.body.paymentInfo.remainingDues;
    }
    newBill.billNumber = await generateSixDigitNumber();
    await newBill.save();
    // newBill.item.forEach(async (item) => {
    //   if (item.itemType.toLowerCase() === "pharmacy") {
    //     if (item.itemId) {
    //       const medicine = await medicineModal.findById(item.itemId);
    //       medicine.stockQuantity =
    //         parseInt(medicine.stockQuantity) - parseInt(item.quantity);
    //       await medicine.save();
    //     }
    //   }
    // });
    // if (newBill.item.some((item) => item.itemCategory === "lab test")) {
    //   const opd = await opdModel
    //     .findOne({ opdId: newBill.opdId })
    //     .populate("patientId")
    //     .populate("appointment.doctor");

    //   const labTestItems = newBill.item.filter(
    //     (item) => item.itemCategory === "lab test"
    //   );

    //   await Promise.all(
    //     labTestItems.map(async (item) => {
    //       const components = await newLabTestModal
    //         .findOne({ name: item.itemName })
    //         .populate("components");

    //       if (!components) {
    //         console.error(`No lab test found with name: ${item.itemName}`);
    //         return; // Skip if no components are found
    //       }

    //       // Map components to test components
    //       const testComponents = components.components.map((component) => {
    //         let calculateReferenceValue;
    //         if (admission.patientId.age < 12) {
    //           calculateReferenceValue = component.rangeDescription.childRange;
    //         } else if (admission.patientId.gender.toLowerCase() === "male") {
    //           calculateReferenceValue = component.rangeDescription.maleRange;
    //         } else if (admission.patientId.gender.toLowerCase() === "female") {
    //           calculateReferenceValue = component.rangeDescription.femaleRange;
    //         } else {
    //           calculateReferenceValue = component.rangeDescription.genRange;
    //         }
    //         return {
    //           componentId: component._id,
    //           componentName: component.name,
    //           result: "",
    //           referenceValue: calculateReferenceValue,
    //           unit: component.unit,
    //         };
    //       });

    //       // Generate report number
    //       const reportNumber = await generateSixDigitReport();

    //       // Update the item's report number
    //       item.reportNumber = reportNumber;

    //       // Create and save the lab report
    //       const newLabReport = new labReportModal({
    //         patientId: opd.patientId._id,
    //         billNumber: newBill.billNumber,
    //         reportNumber,
    //         labTest: {
    //           testName: item.itemName,
    //           testCategory: item.itemCategory,
    //           testDate: item.itemDate,
    //           testPrice: item.totalCharge,
    //           testComponents,
    //         },
    //         prescribedBy: opd.appointment.doctor.name,
    //       });

    //       await newLabReport.save();
    //       console.log(`Lab report created for item: ${item.itemName}`);
    //     })
    //   );

    //   // Save the updated bill with report numbers
    //   await newBill.save();
    // }
    res.status(200).json({ message: "Bill submitted successfully", newBill });
    console.log("Bill submitted successfully");
  } catch (error) {
    console.error("Error submitting OPD bill:", error);
    await slackLogger("OPD Bill Submission Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteOpdBill = async (req, res) => {
  try {
    const billId = req.params.billId;
    const deletedBill = await opdBillModal.findByIdAndDelete(billId);
    if (!deletedBill) {
      res.status(404).json({ message: "Bill not found" });
    } else {
      // deletedBill.item.forEach(async (item) => {
      //   if (item.itemType.toLowerCase() === "pharmacy") {
      //     if (item.itemId) {
      //       const medicine = await medicineModal.findById(item.itemId);
      //       medicine.stockQuantity =
      //         parseInt(medicine.stockQuantity) + parseInt(item.quantity);
      //       await medicine.save();
      //     }
      //   }
      // });

      // const deletedLabReports = await labReportModal.deleteMany({
      //   billNumber: deletedBill.billNumber,
      // });

      res.status(200).json({
        message: "Bill deleted successfully",
        bill: deletedBill,
        // deletedLabReports,
      });
    }
  } catch (error) {
    console.error("Error deleting OPD bill:", error);
    await slackLogger("OPD Bill Deletion Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOpdBill = async (req, res) => {
  try {
    const { billId } = req.params;
    console.log("updateIpdBill: ", req.body);

    if (req.body.paymentInfo) {
      req.body.transactionHistory = [req.body.paymentInfo];
    }
    // Find the old bill
    // const oldBill = await opdBillModal.findById(billId);
    // if (!oldBill) {
    //   return res.status(404).json({ message: "Bill not found" });
    // }

    // Calculate grand remaining dues
    // req.body.grandRemainingDues =
    //   parseInt(req.body.grandTotals.finalPrice) -
    //   req.body.transactionHistory.reduce((acc, item) => {
    //     return acc + parseInt(item.paymentAmount || 0);
    //   }, 0);

    // Update the bill
    const updatedBill = await opdBillModal.findByIdAndUpdate(billId, req.body, {
      new: true,
    });

    if (!updatedBill) {
      return res.status(404).json({ message: "Failed to update bill" });
    }

    // const opd = await opdModel
    //   .findOne({ opdId: updatedBill.opdId })
    //   .populate("patientId")
    //   .populate("appointment.doctor");

    // const admission = await PatientAdmissionModel.findById(
    //   updatedBill.admissionId
    // ).populate("patientId")
    // .populate("doctorId");

    // Process each item in the updated bill
    // await Promise.all(
    //   updatedBill.item.map(async (item) => {
    //     // Pharmacy item stock adjustment
    //     if (item.itemType.toLowerCase() === "pharmacy" && item.itemId) {
    //       const oldItem = oldBill.item.find(
    //         (itemObj) => itemObj.itemId === item.itemId
    //       );
    //       const medicine = await medicineModal.findById(item.itemId);
    //       if (medicine) {
    //         medicine.stockQuantity =
    //           parseInt(medicine.stockQuantity) -
    //           parseInt(oldItem?.quantity || 0) +
    //           parseInt(item.quantity || 0);
    //         await medicine.save();
    //       }
    //     }

    //     // Lab test handling using reportNumber
    //     if (item.itemCategory === "lab test") {
    //       const oldLabReport = oldBill.item.find(
    //         (oldItem) => oldItem.reportNumber === item.reportNumber
    //       );

    //       if (!item.reportNumber) {
    //         console.error("Report number not found for lab test item");
    //         await slackLogger(
    //           "Report Number Not Found",
    //           "Report number not found for lab test item",
    //           null,
    //           req
    //         );
    //         return;
    //       }

    //       if (oldLabReport) {
    //         // Update existing lab report
    //         await labReportModal.updateOne(
    //           { reportNumber: item.reportNumber },
    //           {
    //             $set: {
    //               "labTest.testDate": item.itemDate,
    //               "labTest.testPrice": item.totalCharge,
    //             },
    //           }
    //         );
    //       } else {
    //         // Add a new lab report if not found
    //         const components = await newLabTestModal
    //           .findOne({ name: item.itemName })
    //           .populate("components");

    //         if (components) {
    //           // Map components to test components
    //           const testComponents = components.components.map((component) => {
    //             let calculateReferenceValue;
    //             if (opd.patientId.age < 12) {
    //               calculateReferenceValue =
    //                 component.rangeDescription.childRange;
    //             } else if (opd.patientId.gender.toLowerCase() === "male") {
    //               calculateReferenceValue =
    //                 component.rangeDescription.maleRange;
    //             } else if (opd.patientId.gender.toLowerCase() === "female") {
    //               calculateReferenceValue =
    //                 component.rangeDescription.femaleRange;
    //             } else {
    //               calculateReferenceValue = component.rangeDescription.genRange;
    //             }
    //             return {
    //               componentId: component._id,
    //               componentName: component.name,
    //               result: "",
    //               referenceValue: calculateReferenceValue,
    //               unit: component.unit,
    //             };
    //           });

    //           const reportNumber = await generateSixDigitReport();

    //           const newLabReport = new labReportModal({
    //             patientId: opd.patientId._id,
    //             billNumber: updatedBill.billNumber,
    //             reportNumber,
    //             labTest: {
    //               testName: item.itemName,
    //               testCategory: item.itemCategory,
    //               testDate: item.itemDate,
    //               testPrice: item.totalCharge,
    //               testComponents,
    //             },
    //             prescribedBy: opd.appointment.doctor.name,
    //           });

    //           await newLabReport.save();
    //         }
    //       }
    //     }
    //   })
    // );

    // // Remove lab reports for deleted lab test items
    // const updatedLabReports = updatedBill.item
    //   .filter((item) => item.itemCategory === "lab test")
    //   .map((item) => item.reportNumber);

    // const oldLabReports = oldBill.item
    //   .filter((item) => item.itemCategory === "lab test")
    //   .map((item) => item.reportNumber);

    // const deletedLabReports = oldLabReports.filter(
    //   (reportNumber) => !updatedLabReports.includes(reportNumber)
    // );

    // await Promise.all(
    //   deletedLabReports.map(async (reportNumber) => {
    //     await labReportModal.deleteOne({ reportNumber });
    //   })
    // );

    res
      .status(200)
      .json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
    console.error("Error updating OPD bill:", error);
    await slackLogger("OPD Bill Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOpdBills = async (req, res) => {
  try {
    let opdId = req.query.opdId;

    console.log("opdId", opdId);

    if (!opdId) {
      return res.status(400).json({ message: "OPD ID is required" });
    }
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await opdBillModal.countDocuments({ opdId });
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
    const bills = await opdBillModal
      .find({ opdId })
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
      totalItems: totalPages,
    });
  } catch (error) {
    console.error("Error fetching OPD bills:", error);
    await slackLogger("OPD Bills Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const addOpdPayment = async (req, res) => {
  try {
    const { billId, paymentType, paymentAmount, remainingDues, transactionId } =
      req.body;

    const bill = await opdBillModal.findById(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    if (bill.paymentStatus === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }
    if (paymentAmount > bill.grandRemainingDues) {
      return res
        .status(400)
        .json({ message: "Payment amount exceeds total amount" });
    }
    if (!bill.transactionHistory) {
      bill.transactionHistory = [];
    }
    bill.transactionHistory.push(req.body);
    bill.grandRemainingDues =
      parseInt(bill.grandRemainingDues) - parseInt(paymentAmount);
    if (bill.grandRemainingDues === 0) {
      bill.status = "paid";
    }
    await bill.save();
    res.status(200).json({ message: "Payment added successfully" });
  } catch (error) {
    console.error("Error adding payment:", error);
    await slackLogger("OPD Payment Addition Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const addCustomPayment = async (req, res) => {
  try {
    const { billId, paymentType, paymentAmount, remainingDues, transactionId } =
      req.body;
    const bill = await opdBillModal.findById(billId);
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
    console.error("Error adding payment:", error);
    await slackLogger("OPD Payment Addition Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPatientByOpdId = async (req, res) => {
  try {
    console.log("hit");
    const { opdId } = req.params;
    const patient = await opdModel
      .findOne({ opdId })
      .populate({
        path: "patientId",
        populate: {
          path: "patientType",
        },
      })
      .populate("appointment.doctor");
    if (!patient) {
      return res.status(404).json({ message: "OPD record not found" });
    }
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
      appointmentDate: patient.appointment?.date,
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
      doctorName: patient.appointment?.doctor?.name,
      tpaCorporate: patient.patientId?.tpaCorporate,
      patientType: patient.patientId?.patientType,
    };

    res
      .status(200)
      .json({ message: "Patient fetched successfully", patient: ptientObject });
  } catch (error) {
    console.error("Error fetching patient:", error);
    await slackLogger("Patient Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOpdStats = async (req, res) => {
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

    const bills = await opdBillModal.find(query);

    const totalBills = bills.length;
    const totalCharge = bills.reduce((acc, bill) => {
      return (
        acc +
        (isNaN(bill.grandTotals.totalCharge)
          ? 0
          : parseFloat(bill.grandTotals.totalCharge))
      );
    }, 0);
    const totalAmount = bills.reduce((acc, bill) => {
      // console.log("bill.grandTotals.finalAmount: ", bill.grandTotals.finalPrice);
      return (
        acc +
        (isNaN(bill.grandTotals.finalPrice)
          ? 0
          : parseFloat(bill.grandTotals.finalPrice))
      );
    }, 0);
    const totalDiscount = bills.reduce((acc, bill) => {
      return (
        acc +
        (isNaN(bill.grandTotals.totalDiscount)
          ? 0
          : parseFloat(bill.grandTotals.totalDiscount))
      );
    }, 0);

    const totalDue =
      parseFloat(totalAmount) -
      bills.reduce((acc, bill) => {
        return (
          acc +
          bill.transactionHistory.reduce((innerAcc, item) => {
            const payment = item.paymentAmount; // Extract paymentAmount
            const parsedPayment =
              payment == null || isNaN(payment) ? 0 : parseFloat(payment); // Handle null and invalid values
            return innerAcc + parsedPayment; // Add valid payment or 0
          }, 0)
        );
      }, 0);

    const dueBills = bills.filter((bill) => bill.status === "due").length;
    const paidBills = bills.filter((bill) => bill.status === "paid").length;

    return res.status(200).json({
      success: true,
      message: "OPD Stats fetched successfully.",
      totalBills,
      totalCharge: totalCharge.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      totalDue: totalDue.toFixed(2),
      dueBills,
      paidBills,
    });
  } catch (error) {
    console.error("Error fetching OPD Stats: ", error);
    await slackLogger("OPD Stats Fetch Error", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching OPD Stats.",
      error: error.message,
    });
  }
};
