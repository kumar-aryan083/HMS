import roomModel from "../models/room.model.js";
import wingModel from "../models/wing.model.js";

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
        const rooms = await roomModel.find();
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
    const { wId } = req.params;  // Get the wing ID from the route params
    
    // Check if the wing exists
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
      deletedWing: wing,  // Return the deleted wing's information if needed
    });
    
  } catch (error) {
    console.error("Error deleting wing:", error);  // Better error logging
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
    console.error("Error deleting wing:", error);  // Better error logging
    return res.status(500).json({
      success: false,
      message: "Server error, failed to update wing",
    });
  }
}
export const deleteRoom = async(req, res)=>{
  try {
    const { rId } = req.params;  // Get the wing ID from the route params
    
    // Check if the wing exists
    const room = await roomModel.findById(rId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
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
}
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