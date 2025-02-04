import employeeModel from "../models/employee.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import doctorModel from "../models/doctor.model.js";
import { slackLogger } from "../middleware/webHook.js";

export const employeeRegistration = async (req, res) => {
  try {
    const existingEmployee = await employeeModel.findOne({
      email: req.body.email,
    });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee with this email already exists.",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const newEmployee = new employeeModel({
      ...req.body,
      password: hashedPassword,
    });
    await newEmployee.save();
    const token = jwt.sign({ id: newEmployee._id }, process.env.JWT_SECRET);
    if (newEmployee) {
      return res.status(200).json({
        success: true,
        message: "New Employee created successfully.",
        newEmployee,
        token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to create an employee.",
      });
    }
  } catch (error) {
    console.log("Error in Employee Registration: ", error);
    await slackLogger("Employee Registration Error", error, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
export const employeeLogin = async (req, res) => {
  try {
    // console.log(req.body);
    const existingEmployee = await employeeModel.findOne({
      email: req.body.email,
    });
    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee with this email doesn't exists.",
      });
    }
    const emp = await employeeModel.findOne({ email: req.body.email });
    const passwordValidation = bcrypt.compareSync(
      req.body.password,
      emp.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: emp._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      emp,
    });
  } catch (error) {
    console.log("Error in Login Employee", error);
    await slackLogger("Employee Login Error", error, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find().sort({ createdAt: -1 });
    if (doctors) {
      return res.status(200).json({
        success: true,
        message: "All doctors fetched.",
        doctors,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Unable to fetch doctors.",
      });
    }
  } catch (error) {
    console.log("Error in getting doctors: ", error);
    await slackLogger("Get Doctors Error", error, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};
