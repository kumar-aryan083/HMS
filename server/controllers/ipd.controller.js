import nursingModel from "../models/nursing.model.js";
import roomModel from "../models/room.model.js";
import visitingDoctorModel from "../models/visitingDoctor.model.js";
import wingModel from "../models/wing.model.js";
import patientModel from "../models/patient.model.js";
import doctorModel from "../models/doctor.model.js";
import PatientAdmissionModel from "../models/PatientAdmission.model.js";

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