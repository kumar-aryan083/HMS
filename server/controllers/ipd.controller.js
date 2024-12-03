import nursingModel from "../models/nursing.model.js";
import roomModel from "../models/room.model.js";
import visitingDoctorModel from "../models/visitingDoctor.model.js";
import wingModel from "../models/wing.model.js";
import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";
import PatientAdmissionModel from "../models/PatientAdmission.model.js";
import mongoose from "mongoose";

export const createWing = async (req, res) => {
  try {
    // console.log(req.body);
    const existingWing = await wingModel.findOne({name: req.body.name});
    if(existingWing){
        return res.status(403).json({
            success: false, 
            message: "Wing with this name already exists."
        })
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
    return res.status(500).json({
      success: false,
      message: "Internal server error, inside catch",
    });
  }
};
export const getWings = async (req, res) => {
  try {
    const wings = await wingModel.find();
    if(wings){
        return res.status(200).json({
            success: true,
            message: 'wings fetched.',
            wings
        })
    }else{
        return res.status(403).json({
            success: false,
            message: "Unable to fetch wings"
        })
    }
  } catch (error) {
    return res.status(500).json({
        success: false,
        message: "Internal server error, unable to fecth wing details.",
      });
  }
};
export const addRoom = async (req, res)=>{
    try {
        // Check if the wing exists
        console.log(req.body);
        const wingExists = await wingModel.findById(req.body.wingId);
        if (!wingExists) {
          return res.status(404).json({ success: false, message: 'Wing not found' });
        }
    
        // Check if the room number is unique
        const existingRoom = await roomModel.findOne({ roomNumber: req.body.roomNumber });
        if (existingRoom) {
          return res.status(400).json({ success: false, message: 'Room number already exists' });
        }
    
        // Create a new room
        const newRoom = new roomModel({...req.body});
        const savedRoom = await newRoom.save();
    
        await wingModel.findByIdAndUpdate(req.body.wingId, {
            $push:{rooms: savedRoom._id}
        });

        return res.status(201).json({
          success: true,
          message: 'Room added successfully',
          room: savedRoom,
        });
      } catch (error) {
        console.error('Error adding room:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
      }
}
export const getRooms = async (req, res)=>{
    try {
        const rooms = await roomModel.find().populate('wingId');
        return res.status(200).json({
            success: true,
            message: 'rooms fetched.',
            rooms
        })
    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Server error"
        })
    }
}
export const deleteWing = async(req, res)=>{
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
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete wing",
    });
  }
}
export const editWing = async(req, res)=>{
  try {
    const { wId } = req.params;
    const updates = req.body;

    const updatedWing = await wingModel.findByIdAndUpdate(wId, updates, { new: true });

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
    return res.status(500).json({
      success: false,
      message: "Server error, failed to update wing",
    });
  }
}
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
      await wing.save();  // Save the updated wing document
    }

    await roomModel.findByIdAndDelete(rId);

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
      deletedRoom: room,  
    });
    
  } catch (error) {
    console.error("Error deleting room:", error);  // Better error logging
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete room",
    });
  }
};
export const editRoom = async(req, res)=>{
  try {
    const { rId } = req.params;
    const updates = req.body;

    const updatedRoom = await roomModel.findByIdAndUpdate(rId, updates, { new: true });

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
    console.error("Error deleting room:", error);  // Better error logging
    return res.status(500).json({
      success: false,
      message: "Server error, failed to update room",
    });
  }
}
export const addVisitingDoctor = async(req, res)=>{
  try {
    const { name, email, phone, specialization, visitFees } = req.body;

    const existingDoctor = await visitingDoctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "A doctor with this email already exists.",
      });
    }

    // Check if the specialization is valid (optional if enum is strictly enforced in schema)
    const validSpecializations = ["ENT", "Physician", "Cardiology", "Gynecology", "General Surgery", "Neurology", "Psychiatry"];
    if (!validSpecializations.includes(specialization)) {
      return res.status(400).json({
        success: false,
        message: "Invalid specialization.",
      });
    }

    // Create the new visiting doctor
    const newDoctor = new visitingDoctorModel({
      name,
      email,
      phone,
      specialization,
      visitFees,
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
    return res.status(500).json({
      success: false,
      message: "Server error, failed to add visiting doctor",
    });
  }
}
export const getVisitingDoctor = async (req, res)=>{
  try {
      const doctors = await visitingDoctorModel.find();
      return res.status(200).json({
          success: true,
          message: 'Visiting Doctors fetched.',
          doctors
      })
  } catch (error) {
      console.log(error);
      return res.json({
          success: false,
          message: "Server error"
      })
  }
}
export const deleteVisitingDoctor = async(req, res)=>{
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
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete visiting doctor",
    });
  }
}
export const editVisitingDoctor = async(req, res)=>{
  try {
    const { dId } = req.params;
    const updates = req.body;

    const updatedDoctor = await visitingDoctorModel.findByIdAndUpdate(dId, updates, { new: true });

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
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit visiting doctor",
    });
  }
}
export const addNursing = async(req, res)=>{
  try {
    const { name, phone, gender, perUnitPrice } = req.body;

    // Check if a nurse with the same phone number already exists
    const existingNurse = await nursingModel.findOne({ phone });
    if (existingNurse) {
      return res.status(400).json({
        success: false,
        message: "A nurse with this phone number already exists.",
      });
    }

    const validGenders = ["Male", "Female", "Other"];
    if (!validGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: "Invalid gender value.",
      });
    }

    // Create a new Nursing staff member
    const newNurse = new nursingModel({
      name,
      phone,
      gender,
      perUnitPrice,
    });
    await newNurse.save();

    return res.status(201).json({
      success: true,
      message: "Nurse added successfully.",
      nurse: newNurse,
    });

  } catch (error) {
    console.error("Error editing visiting doctor:", error);  
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit visiting doctor",
    });
  }
}
export const getNursing = async (req, res)=>{
  try {
      const nurses = await nursingModel.find();
      return res.status(200).json({
          success: true,
          message: 'All Nurses fetched.',
          nurses
      })
  } catch (error) {
      console.log(error);
      return res.json({
          success: false,
          message: "Server error"
      })
  }
}
export const deleteNursing = async(req, res)=>{
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
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete Nursing",
    });
  }
}
export const editNursing = async(req, res)=>{
  try {
    const { nId } = req.params;
    const updates = req.body;

    const updatedNurse = await nursingModel.findByIdAndUpdate(nId, updates, { new: true });

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
    console.error("Error editing nurse:", error);  // Better error logging
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit nurse",
    });
  }
}
export const patientAdmission = async(req, res)=>{
  try {
    const { patientId, doctorId, roomId, wingId, reasonForAdmission } = req.body;

    // Validate patient, doctor, room, and wing exist
    const patient = await patientModel.findById(patientId);
    const doctor = await doctorModel.findById(doctorId);
    const room = await roomModel.findById(roomId);
    const wing = await wingModel.findById(wingId);

    if (!patient || !doctor || !room || !wing) {
      return res.status(404).json({ message: 'Invalid patient, doctor, room, or wing.' });
    }

    // Check room availability
    if (!room.isAvailable()) {
      return res.status(400).json({ message: 'This room is fully occupied.' });
    }

    // If the room type is "Private Room", set occupancy to limit
    if (room.roomType === 'Private Room') {
      room.currentOccupancy = room.capacity;  // Fully occupy the room
      room.isOccupied = true;                       // Mark as occupied
    } else {
      // For other room types, increment occupancy
      room.currentOccupancy += 1;
      if (room.currentOccupancy >= room.capacity) {
        room.isOccupied = true;
      }
    }
    await room.save();

    // Create the admission record
    const admission = new PatientAdmissionModel({
      patientId,
      doctorId,
      roomId,
      wingId,
      reasonForAdmission,
      nursingRate: room.charges
    });
    await admission.save();

    if (room.currentOccupancy >= room.occupancyLimit) {
      room.isOccupied = true;
    }
    await room.save();

    res.status(201).json({ message: 'Patient admitted successfully', admission });
  } catch (error) {
    console.error("Error admitting patient:", error);  // Better error logging
    return res.status(500).json({
      success: false,
      message: "Server error, failed to admit patient.",
    });
  }
}
export const allIpds = async(req, res)=>{
  try {
    const ipds = await PatientAdmissionModel.find().populate('patientId').populate('doctorId');
    return res.status(200).json({
      success: true,
      message: "All ipds fetched.",
      ipds
    })
  } catch (error) {
    console.error("Error fetching ipds", error);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to fetch all ipds."
    })
  }
}
export const addDischargeSummary = async (req, res) => {
    const { admissionId } = req.params;
    const {
        dischargeDate,
        statusAtDischarge,
        dischargeNotes,
        finalDiagnosis,
        procedures,
        medications,
        followUpInstructions,
        dischargingDoctor
    } = req.body;

    try {
        // Validate Admission ID
        if (!mongoose.Types.ObjectId.isValid(admissionId)) {
            return res.status(400).json({ error: 'Invalid admission ID' });
        }

        // Find and Update the Admission Record
        const updatedAdmission = await PatientAdmissionModel.findByIdAndUpdate(
            admissionId,
            {
                $set: {
                    'dischargeSummary.dischargeDate': dischargeDate,
                    'dischargeSummary.statusAtDischarge': statusAtDischarge,
                    'dischargeSummary.dischargeNotes': dischargeNotes,
                    'dischargeSummary.finalDiagnosis': finalDiagnosis,
                    'dischargeSummary.procedures': procedures,
                    'dischargeSummary.medications': medications,
                    'dischargeSummary.followUpInstructions': followUpInstructions,
                    'dischargeSummary.dischargingDoctor': dischargingDoctor,
                    status: 'Discharged'
                }
            },
            { new: true } 
        ).populate('dischargeSummary.dischargingDoctor');

        if (!updatedAdmission) {
            return res.status(404).json({ error: 'Patient admission not found' });
        }

        res.status(200).json({success: true, message: 'Discharge summary added successfully', updatedAdmission });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add discharge summary', details: error.message });
    }
};
export const updateAllergies = async (req, res) => {
  try {
    const { admissionId } = req.params; // Admission ID from the URL
    const { allergies } = req.body;    // Allergies content from the request body
    console.log(allergies)
    // Validate input
    if (!allergies) {
      return res.status(400).json({ error: 'Allergies field cannot be empty.' });
    }

    // Find and update the patient admission
    const updatedAdmission = await PatientAdmissionModel.findByIdAndUpdate(
      admissionId,
      { allergies },
      { new: true, runValidators: true } // Return the updated document and validate
    );

    // If no record is found, return a 404 error
    if (!updatedAdmission) {
      return res.status(404).json({ error: 'Patient admission not found.' });
    }

    // Respond with success
    res.status(200).json({
      message: 'Allergies updated successfully.',
      data: updatedAdmission
    });
  } catch (error) {
    console.error('Error updating allergies:', error);
    res.status(500).json({ error: 'An error occurred while updating allergies.' });
  }
};
// Update Physical Examination
export const updatePhysicalExamination = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params; // This should be the _id of the PatientAdmission document
    const { findings, vitalSigns } = req.body;

    // Ensure the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(patientAdmissionId)) {
      return res.status(400).json({ success: false, message: "Invalid Patient Admission ID" });
    }

    // Validate vitalSigns object structure
    const { bloodPressure, heartRate, temperature, respiratoryRate, oxygenSaturation, bmi } = vitalSigns;
    if (
      !bloodPressure ||
      !heartRate ||
      !temperature ||
      !respiratoryRate ||
      !oxygenSaturation ||
      !bmi
    ) {
      return res.status(400).json({
        success: false,
        message: "All vital signs fields are required.",
      });
    }

    // Update the physical examination fields
    const ipdFile = await PatientAdmissionModel.findOneAndUpdate(
      { _id: patientAdmissionId }, // Match the patient admission by ID
      {
        $set: {
          "physicalExamination.findings": findings,
          "physicalExamination.vitalSigns.bloodPressure": bloodPressure,
          "physicalExamination.vitalSigns.heartRate": heartRate,
          "physicalExamination.vitalSigns.temperature": temperature,
          "physicalExamination.vitalSigns.respiratoryRate": respiratoryRate,
          "physicalExamination.vitalSigns.oxygenSaturation": oxygenSaturation,
          "physicalExamination.updatedAt": Date.now(),
        },
      },
      { new: true, upsert: false } // Do not create a new record if it doesn't exist
    );

    // Handle case where no matching document is found
    if (!ipdFile) {
      return res.status(404).json({ success: false, message: "Patient Admission not found" });
    }

    res.status(200).json({ success: true, message: "Physical Examination updated successfully", ipdFile });
  } catch (error) {
    console.error("Error updating Physical Examination:", error);
    res.status(500).json({ success: false, message: "Failed to update Physical Examination", error });
  }
};
// Update Investigations
export const updateInvestigations = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const { labTest, imagingTest } = req.body;

    // console.log(req.body)
    // Ensure labTest and imagingTest are valid strings (i.e., not empty)
    if (!labTest || !imagingTest) {
      return res.status(400).json({ success: false, message: "Both labTest and imagingTest are required" });
    }

    // Push the new tests into the investigations field (single entries, not arrays)
    const ipdFile = await PatientAdmissionModel.findOneAndUpdate(
      { _id: patientAdmissionId },
      {
        $push: {
          "investigations.labTests": labTest,  // Push the new single lab test
          "investigations.imaging": imagingTest // Push the new single imaging test
        },
        $set: { "investigations.updatedAt": Date.now() }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Investigations updated", ipdFile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update Investigations", error });
  }
};

// Update Chief Complaints
export const updateChiefComplaints = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const { complaint } = req.body;

    // Validate that `complaint` is provided and is a string
    if (!complaint || typeof complaint !== "string") {
      return res.status(400).json({
        success: false,
        message: "`complaint` is required and should be a string.",
      });
    }

    // Push the new complaint to the array
    const ipdFile = await PatientAdmissionModel.findByIdAndUpdate(
      patientAdmissionId,
      {
        $push: { "chiefComplaints.complaints": complaint }, // Push new complaint
        $set: { "chiefComplaints.updatedAt": new Date() }, // Update timestamp
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
      message: "Chief Complaint added successfully.",
      ipdFile,
    });
  } catch (error) {
    // Error response
    res.status(500).json({
      success: false,
      message: "Failed to add Chief Complaint.",
      error: error.message,
    });
  }
};
// Update Chemo Notes
export const updateChemoNotes = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const { cycles, regimen, sideEffects } = req.body;

    const ipdFile = await PatientAdmissionModel.findOneAndUpdate(
      { _id: patientAdmissionId },
      { $set: { chemoNotes: { cycles, regimen, sideEffects, updatedAt: Date.now() } } },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Chemo Notes updated", ipdFile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update Chemo Notes", error });
  }
};
// Update Visit Notes
export const updateVisitNotes = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const { note } = req.body;  // Expecting a single note instead of an array

    if (!note) {
      return res.status(400).json({ success: false, message: "Note is required" });
    }

    // Push the single new note into the existing array of notes
    const ipdFile = await PatientAdmissionModel.findOneAndUpdate(
      { _id: patientAdmissionId },
      {
        $push: { 
          "visitNotes.notes": note  // Push a single note
        },
        $set: {  // Use $set to update the updatedAt field separately
          "visitNotes.updatedAt": Date.now()
        }
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Visit Note updated", ipdFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to update Visit Note", error: error.message });
  }
};
// Update Obs & Gynae
export const updateObsGynae = async (req, res) => {
  try {
    const { patientAdmissionId } = req.params;
    const {
      pregnancyHistory,
      menstrualHistory,
      lastMenstrualPeriod,
      obstetricHistory,
      gynecologicalHistory,
      contraceptiveHistory,
      fertilityHistory,
      familyHistory,
      sexualHistory,
      menopauseDetails
    } = req.body;
    console.log(req.body);

    // Find and update the IPD file with the new Obs & Gynae data
    const ipdFile = await PatientAdmissionModel.findOneAndUpdate(
      { _id: patientAdmissionId },
      {
        $set: {
          obsGynae: {
            pregnancyHistory,
            menstrualHistory,
            lastMenstrualPeriod,
            obstetricHistory,
            gynecologicalHistory,
            contraceptiveHistory,
            fertilityHistory,
            familyHistory,
            sexualHistory,
            menopauseDetails,
            updatedAt: Date.now()
          }
        }
      },
      { new: true, upsert: true }
    );

    // Respond with success message and updated data
    res.status(200).json({
      success: true,
      message: "Obs & Gynae updated successfully",
      ipdFile
    });
  } catch (error) {
    // Handle error and respond with failure message
    res.status(500).json({
      success: false,
      message: "Failed to update Obs & Gynae",
      error: error.message
    });
  }
};
export const getDischargeSummary = async(req, res)=>{
  const { admissionId } = req.params;

  // Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res.status(400).json({ success: false, message: "Invalid Patient Admission ID" });
  }

  try {
    // Find the admission record with the discharge summary
    const patientAdmission = await PatientAdmissionModel.findById(admissionId).select('dischargeSummary');
    
    if (!patientAdmission) {
      return res.status(404).json({ success: false, message: "Patient Admission not found" });
    }

    res.status(200).json({
      success: true,
      dischargeSummary: patientAdmission.dischargeSummary, // Return only the dischargeSummary field
    });
  } catch (error) {
    console.error("Error fetching discharge summary:", error);
    res.status(500).json({ success: false, message: "Failed to fetch discharge summary", error });
  }
} 
export const getChiefComplaints = async(req, res)=>{
  const { admissionId } = req.params;

  // Check if the provided ID is valid
  if (!mongoose.Types.ObjectId.isValid(admissionId)) {
    return res.status(400).json({ success: false, message: "Invalid Patient Admission ID" });
  }
  try {
    const patientAdmission = await PatientAdmissionModel.findById(admissionId).select('chiefComplaints');
    
    // if (!patientAdmission) {
    //   return res.status(404).json({ success: false, message: "Patient Admission not found" });
    // }

    res.status(200).json({
      success: true,
      complaints: patientAdmission.chiefComplaints, 
    });
  } catch (error) {
    console.error("error fetching complaints", error);
  }
}