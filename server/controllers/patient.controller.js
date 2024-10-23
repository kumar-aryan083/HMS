import patientModel from "../models/patient.model.js"
import { getNextUHID } from '../utils/uhidGenerator.js'

export const patientRegister = async (req, res) => {
    try {
        const existingPatient = await patientModel.findOne({ email: req.body.email });
        if (existingPatient) {
            return res.status(409).json({
                success: false,
                message: "Patient with this email already exists."
            })
        }
        const uhid = await getNextUHID();
        const newPatient = new patientModel({ ...req.body, uhid });
        await newPatient.save();
        if (newPatient) {
            return res.status(200).json({
                success: true,
                message: "Patient registered successfully.",
                newPatient
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Unable to register patient."
            })
        }
    } catch (error) {
        console.error(error);
    }
}

export const patientList = async (req, res) => {
    try {
        const { name, fromDate, toDate } = req.query; // Get query parameters from the request
        const filter = {};

        // Filter by patient name if provided
        if (name) {
            filter.patientName = { $regex: name, $options: 'i' }; // Case insensitive search
        }

        // Filter by date range if provided
        if (fromDate && toDate) {
            const parsedFromDate = new Date(fromDate);
            const parsedToDate = new Date(toDate);

            // Validate the parsed dates
            if (isNaN(parsedFromDate) || isNaN(parsedToDate)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format."
                });
            }

            const start = new Date(parsedFromDate); // Start of the fromDate
            const end = new Date(parsedToDate); // End of the toDate
            end.setDate(end.getDate() + 1); // Set to the next day

            filter.createdAt = { $gte: start, $lt: end }; // Filter patients within the date range
        }

        const patientDetails = await patientModel.find(filter); // Find patients based on the filter

        if (patientDetails.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Patient list fetched.",
                patientDetails
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No patients found."
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching patient list."
        });
    }
}

export const deletePatient = async (req, res) => {
    try {
        const deleted = await patientModel.findByIdAndDelete(req.params.pId);
        if (deleted) {
            return res.status(200).json({
                success: true,
                message: "Patient deleted successfully.",
                deleted
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Unable to delete the patient"
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export const getPatient = async (req, res) => {
    try {
        const { uhid } = req.params;
        const getPatient = await patientModel.findOne({ uhid });
        if (getPatient) {
            return res.status(200).json({ success: true, patientDetails: getPatient });
        } else {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }
    } catch (error) {
        console.log(error);
    }
}
export const updatePatient = async (req, res) => {
    try {
        const { uhid } = req.params;
        const updated = await patientModel.findOneAndUpdate({uhid}, req.body, { new: true });
        if(updated){
            return res.status(200).json({
                success: true,
                message: "Patient updated.",
                updated
            })
        }else{
            return res.status(400).json({
                success: false,
                message: "Unable to update patient."
            })
        }
    } catch (error) {
        console.log(error);
    }
}