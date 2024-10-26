import patientModel from "../models/patient.model.js"
import doctorModel from "../models/doctor.model.js"
import departmentModel from "../models/department.model.js"
import { getNextUHID } from '../utils/uhidGenerator.js'
import appointmentModel from "../models/appointment.model.js"

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

export const bookAppointment = async (req, res) => {
    try {
        const { patientId, doctor, department, appointmentDate, appointmentTime, reason } = req.body;
        if(!patientId){
            return res.status(404).json({ message: 'Patient not found. First create a patient then only you can book appointment.' });
        }
        if (!patientId || !doctor || !department || !appointmentDate || !appointmentTime || !reason) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        console.log(req.body);
        const patient = await patientModel.findById(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found. First create a patient then only you can book appointment.' });
        }

        const doc = await doctorModel.findById(doctor);
        if (!doc) {
            return res.status(404).json({ message: 'Doctor not found.' });
        }

        // Verify department exists
        const dept = await departmentModel.findById(department);
        if (!dept) {
            return res.status(404).json({ message: 'Department not found.' });
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
            return res.status(409).json({ message: 'An appointment already exists for this patient with the selected doctor, date, and time.' });
        }

        // Create new appointment
        const newAppointment = new appointmentModel({
            patient: patientId,
            doctor,
            department,
            appointmentDate,
            appointmentTime,
            reason,
            status: 'Scheduled',
        });

        await newAppointment.save();

        await doctorModel.findByIdAndUpdate(doctor, {
            $push: { appointments: newAppointment._id }
        });
        res.status(201).json({ message: 'Appointment booked successfully!', appointment: newAppointment });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

export const searchPatientsByName = async (req, res) => {
    try {
      const nameQuery = req.query.name;
  
      if (!nameQuery) {
        return res.status(400).json({ error: 'Name query parameter is required.' });
      }
  
      const patients = await patientModel.find({patientName: new RegExp(nameQuery, 'i') }).limit(10);
      if(patients){
        return res.status(200).json({
            success: true,
            message: 'patient fectched',
            patients
        })
      }else{
        return res.status(400).json({
            success: false,
            message: 'unable to fetch data'
        })
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };