import opdModel from "../models/opd.model.js";
import patientModel from "../models/patient.model.js";

export const createOpd = async (req, res) => {
  try {
    const patient = await patientModel.findOne({ mobile: req.body.phone });
    if (!patient) {
      return res.json({
        success: false,
        message:
          "Patient with this phone number doesn't exists. Create Patient",
      });
    }
    const body = { ...req.body, patientId: patient._id };
    const opdRecord = new opdModel(body);
    await opdRecord.save();
    res
      .status(201)
      .json({ message: "OPD record created successfully", opdRecord });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error creating OPD record", error: error.message });
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
    const updatedOpd = await opdModel.findByIdAndUpdate(
      id,
      {
        patientName,
        appointment,
        administrativeDetails,
        phone,
      },
      { new: true, runValidators: true } // Returns the updated document
    ).populate("patientId", "patientName age gender mobile") // Populate patient details
    .populate("appointment.department", "name") // Populate department
    .populate("appointment.doctor", "name");;

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

export const addMedications = async(req, res)=>{
  const { oId } = req.params;
  const medications = req.body;
  try {

    const validMedications = medications.filter(
      (med) => med.name && med.dosage && med.frequency
    );

    // If no valid medications, return an error response
    if (validMedications.length === 0) {
      return res.status(400).json({ message: 'No valid medications provided' });
    }

    // Find the OPD record by ID
    const opd = await opdModel.findOne({opdId: oId});
    if (!opd) {
      return res.status(404).json({ message: 'OPD not found' });
    }

    // Mark existing medications as previous
    opd.treatment.medications.forEach(med => {
      med.isPrevious = true; // Mark existing medications as previous
    });

    // Add new medications to the medications array
    const newMedications = medications.map(med => ({
      ...med,
      isPrevious: false, // New medications will not be marked as previous
    }));
    
    opd.treatment.medications.push(...newMedications);

    // Save the updated OPD record
    await opd.save();

    return res.status(200).json({ message: 'Medications assigned successfully', opd });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

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