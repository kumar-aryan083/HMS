import adminModel from "../models/admin.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import departmentModel from "../models/department.model.js";
import doctorModel from "../models/doctor.model.js";

export const adminRegistration = async (req, res) => {
    try {
        const existingAdmin = await adminModel.findOne({ email: req.body.email });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Admin with this email already exists."
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const newAdmin = new adminModel({ ...req.body, password: hashedPassword, isAdmin: true });
        await newAdmin.save();
        if (newAdmin) {
            return res.status(200).json({
                success: true,
                message: "New Admin created successfully.",
                newAdmin
            })
        } else {
            return res.status(400).json({
                success: false,
                message: "Unable to create an admin."
            })
        }
    } catch (error) {
        console.log(error);
    }
}

export const adminLogin = async (req, res) => {
    try {
        // console.log(req.body);
        const existingAdmin = await adminModel.findOne({ email: req.body.email });
        if (!existingAdmin) {
            return res.status(404).json({
                success: false,
                message: "Admin with this email doesn't exists."
            })
        }
        const admin = await adminModel.findOne({ email: req.body.email });
        const passwordValidation = bcrypt.compareSync(req.body.password, admin.password);
        if (!passwordValidation) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Password."
            })
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            admin
        });
    } catch (error) {
        console.log(error);
    }
}

export const addDepartment = async (req, res) => {
    try {
        const admin = await adminModel.findOne({ _id: req.user.id });
        if (!admin.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Only admins has access.' });
        }
        const { name, location, headOfDepartment, servicesOffered } = req.body;
        if (!name || !location || !headOfDepartment) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }
        const existingDepartment = await departmentModel.findOne({ name });
        if (existingDepartment) {
            return res.status(400).json({ message: 'Department already exists.' });
        }
        const newDepartment = new departmentModel({
            name,
            location,
            headOfDepartment,
            servicesOffered: servicesOffered || [],
        });
        await newDepartment.save();
        res.status(201).json({ message: 'Department added successfully!', department: newDepartment });
    } catch (error) {
        console.error('Error adding department:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

export const addDoctor = async (req, res) => {
    try {
        const admin = await adminModel.findOne({ _id: req.user.id });
        if (!admin.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admins has the access only.' });
        }

        const { name, email, phone, specialization, qualifications, experienceYears, department, availableDays, availableTime } = req.body;
        if (!name || !email || !phone || !specialization || !qualifications || !experienceYears || !department || !availableDays || !availableTime) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ message: 'A doctor with this email already exists.' });
        }
        const departmentExists = await departmentModel.findById(department);
        if (!departmentExists) {
            return res.status(400).json({ message: 'Invalid department.' });
        }

        const newDoctor = new doctorModel({
            name,
            email,
            phone,
            specialization,
            qualifications,
            experienceYears,
            department,
            availableDays,
            availableTime
        });
        await newDoctor.save();

        await departmentModel.findByIdAndUpdate(
            department,
            { $push: { doctors: newDoctor._id } },
            { new: true }
        );
        
        res.status(201).json({ message: 'Doctor added successfully!', doctor: newDoctor });
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

export const getDepartments = async(req, res)=>{
    try {
        const departments = await departmentModel.find();
        if(departments){
            return res.status(200).json({
                success: true,
                message: 'Departments fetched successfully.',
                departments
            })
        }else{
            return res.status(400).json({
                success: false,
                message: 'Unable to fetched departments.'
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}