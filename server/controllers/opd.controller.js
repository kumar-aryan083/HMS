import opdModel from "../models/opd.model.js";
import patientModel from "../models/patient.model.js";
import paymentModel from "../models/payment.model.js";

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
    const {
      patientName,
      appointment,
      administrativeDetails,
      treatment,
    } = req.body;

    // Set up OPD record data
    const body = {
      patientId: patient._id,
      patientName,
      appointment,
      treatment,
      administrativeDetails: {
        ...administrativeDetails,
        patientId: patient._id, // Ensure patientId is included here if needed
      },
    };

    // Create and save OPD record
    const opdRecord = new opdModel(body);
    await opdRecord.save();
    console.log("OPD record created successfully:", opdRecord);

    // Create initial payment record for doctor's fee, if available
    if (administrativeDetails.consultationFee && administrativeDetails.paymentMode) {
      const paymentRecord = new paymentModel({
        opdId: opdRecord._id, // Associate with created OPD
        patientId: patient._id,
        amount: administrativeDetails.consultationFee,
        mode: administrativeDetails.paymentMode,
        purpose: 'Doctor Fee', // Purpose set to Doctor Fee
        transactionId: administrativeDetails.transactionId || null, // Optional transaction ID
      });
      await paymentRecord.save();
      console.log("Payment record created successfully:", paymentRecord);

      // Update OPD record to include payment ID
      opdRecord.paymentIds.push(paymentRecord._id);
      await opdRecord.save();
    }

    res.status(201).json({
      message: "OPD record created successfully",
      opdRecord,
    });
  } catch (error) {
    console.error("Error creating OPD or Payment record:", error.message);
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
      .populate("patientId", "patientName age gender mobile") // Adjust fields as per your patient model
      .populate("appointment.department", "name")
      .populate("appointment.doctor", "name");
    res.status(200).json({
      success: true,
      message: "All opds fetched.",
      opdDetails,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving OPD records", error: error.message });
  }
};
export const deleteOpd = async (req, res) => {
  try {
    const deleted = await opdModel.findByIdAndDelete(req.params.oId);
    if (deleted) {
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
    console.log("error: ", error);
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
    console.error(error);
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
    console.log(error);
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
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const addAllergies = async (req, res) => {
  try {
    const { oId } = req.params;
    const { allergyContent } = req.body;

    const opdRecord = await opdModel.findOne({ opdId: oId });

    if (!opdRecord) {
      return res.status(404).json({ message: "OPD record not found." });
    }

    // Check if allergies field already has content
    if (opdRecord.treatment.allergies) {
      // Update existing content
      opdRecord.treatment.allergies = allergyContent;
    } else {
      // Add content for the first time
      opdRecord.treatment.allergies = allergyContent;
    }

    // Save the updated OPD record
    await opdRecord.save();

    res.status(200).json({
      message: "Allergy content updated successfully.",
      allergies: opdRecord.treatment.allergies,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating allergy content", error });
  }
};

export const assignTests = async (req, res) => {
  const { id } = req.params; // Get the OPD ID from the request parameters
  const { tests } = req.body; // Get the array of test IDs from the request body

  try {
    // Use findOneAndUpdate directly to find and update in one step
    const updatedOpd = await opdModel.findOneAndUpdate(
      { opdId: id }, // Find the OPD by opdId
      {
        $push: {
          "treatment.assignedTests": {
            $each: tests.map((testId) => ({ testId })),
          },
        },
      },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedOpd) {
      return res.status(404).json({ message: "OPD not found" });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Tests assigned successfully.",
        updatedOpd,
      }); // Respond with the updated OPD document
  } catch (error) {
    console.error("Error assigning tests:", error);
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
      return res.status(404).json({ message: 'OPD record not found' });
    }

    // Update the assessment field with the new content
    opd.assessment = assessmentContent;
    await opd.save();

    res.status(200).json({ message: 'Assessment added successfully', opd });
  } catch (error) {
    console.error("Error adding assessment:", error);
    res.status(500).json({ message: 'An error occurred while adding assessment' });
  }
};


export const getPaymentsHistory = async (req, res) => {
  try {
    const { oId } = req.params; // Get opdId from request parameters

    // Find the OPD record by ID and populate the paymentIds array
    const opdRecord = await opdModel.findOne({opdId: oId})
      .populate('paymentIds') // Populate paymentIds with payment details
      .populate('patientId', 'mobile'); // Optionally populate patient details

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
    res.status(500).json({
      success: false,
      message: "Error fetching OPD details.",
      error: error.message,
    });
  }
};