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
    const opdRecords = await opdModel
      .find()
      .populate("patientId", "patientName age gender") // Adjust fields as per your patient model
      .populate("appointment.department", "name")
      .populate("appointment.doctor", "name");
    res.status(200).json(opdRecords);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving OPD records", error: error.message });
  }
};
