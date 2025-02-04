import adminModel from "../models/roles/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import departmentModel from "../models/department.model.js";
import doctorModel from "../models/doctor.model.js";
import hrModel from "../models/roles/hr.model.js";
import pharmacyModel from "../models/roles/pharmacy.model.js";
import doctorRoleModel from "../models/roles/doctorRole.model.js";
import storeRoleModel from "../models/roles/storeRole.model.js";
import counterModel from "../models/roles/counter.model.js";
import nurseModel from "../models/roles/nurse.model.js";
import laboratoryModel from "../models/roles/laboratory.model.js";
import { slackLogger } from "../middleware/webHook.js";
import inventoryModel from "../models/roles/inventory.model.js";
import agentModal from "../models/agent.modal.js";
import otherRoleModal from "../models/roles/otherRole.modal.js";

export const adminRegistration = async (req, res) => {
  try {
    const existingAdmin = await adminModel.findOne({ email: req.body.email });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email already exists.",
      });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const newAdmin = new adminModel({
      ...req.body,
      password: hashedPassword,
      isAdmin: true,
    });
    await newAdmin.save();
    if (newAdmin) {
      return res.status(200).json({
        success: true,
        message: "New Admin created successfully.",
        newAdmin,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to create an admin.",
      });
    }
  } catch (error) {
    console.log("Error in Admin Registration", error);
    await slackLogger("Error in Admin Registration", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const adminLogin = async (req, res) => {
  try {
    // console.log(req.body);
    const existingAdmin = await adminModel.findOne({ email: req.body.email });
    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin with this email doesn't exists.",
      });
    }
    const admin = await adminModel.findOne({ email: req.body.email });
    const passwordValidation = bcrypt.compareSync(
      req.body.password,
      admin.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: admin,
    });
  } catch (error) {
    console.log("Error in Admin Login", error);
    await slackLogger("Error in Admin Login", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addDepartment = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins has access." });
    }
    const { name, location, headOfDepartment, servicesOffered } = req.body;
    const existingDepartment = await departmentModel.findOne({
      name: req.body.name,
    });
    if (existingDepartment) {
      return res.status(400).json({ message: "Department already exists." });
    }
    const newDepartment = new departmentModel(req.body);
    await newDepartment.save();
    res.status(201).json({
      message: "Department added successfully!",
      department: newDepartment,
    });
  } catch (error) {
    console.error("Error adding department:", error);
    await slackLogger("Error adding department", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const addDoctor = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }

    const existingDoctor = await doctorModel.findOne({ email: req.body.email });
    if (existingDoctor) {
      return res
        .status(400)
        .json({ message: "A doctor with this email already exists." });
    }

    if (req.body.department === "") {
      delete req.body.department;
    }
    const newDoctor = new doctorModel(req.body);
    await newDoctor.save();

    res
      .status(201)
      .json({ message: "Doctor added successfully!", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    // await slackLogger("Error adding doctor", error.message, error, req);
    // res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const getDoctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find().sort({ createdAt: -1 });
    res.status(200).json({ message: "Doctors fetched!", doctors });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    // await slackLogger("Error adding doctor", error.message, error, req);
    // res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { dId } = req.params;
    const doctor = await doctorModel.findById(dId);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }
    const deletedDoctor = await doctorModel.findByIdAndDelete(dId);

    return res.status(200).json({ message: "Doctors Deleted!", deletedDoctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    // await slackLogger("Error adding doctor", error.message, error, req);
    // res.status(500).json({ message: "Server error. Please try again later." });
  }
};
export const editDoctor = async (req, res) => {
  try {
    const { dId } = req.params;
    const doctor = await doctorModel.findById(dId);
    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found.",
      });
    }
    const updatedDoctor = await doctorModel.findByIdAndUpdate(dId, req.body, {
      new: true,
    });

    return res.status(200).json({ message: "Doctor Updated!", updatedDoctor });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    // await slackLogger("Error adding doctor", error.message, error, req);
    // res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const addDoctorRole = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }

    const existingDoctor = await doctorRoleModel.findOne({ email });
    if (existingDoctor) {
      return res
        .status(400)
        .json({ message: "A doctor with this email already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newDoctor = new doctorRoleModel({
      ...req.body,
      password: hashedPassword,
    });
    await newDoctor.save();

    res
      .status(201)
      .json({ message: "Doctor added successfully!", doctor: newDoctor });
  } catch (error) {
    console.error("Error adding doctor:", error);
    await slackLogger("Error adding doctor", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingDoctor = await doctorRoleModel.findOne({
      email: email,
    });
    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingDoctor.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: existingDoctor._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingDoctor,
    });
  } catch (error) {
    console.log("Error logging in doctor!", error);
    await slackLogger("Error logging in doctor", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await departmentModel.find().sort({ createdAt: -1 });
    if (departments) {
      return res.status(200).json({
        success: true,
        message: "Departments fetched successfully.",
        departments,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Unable to fetched departments.",
      });
    }
  } catch (error) {
    console.log("Error fetching departments", error);
    await slackLogger("Error fetching departments", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const deleteDepartment = async (req, res) => {
  try {
    const { dId } = req.params;
    const department = await departmentModel.findById(dId);
    if (!department) {
      return res.status(404).json({
        message: "Department not found.",
      });
    }
    const deletedDepartment = await departmentModel.findByIdAndDelete(dId);

    return res
      .status(200)
      .json({ message: "Department Deleted!", deletedDepartment });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    // await slackLogger("Error adding doctor", error.message, error, req);
    // res.status(500).json({ message: "Server error. Please try again later." });
  }
};
export const editDepartment = async (req, res) => {
  try {
    const { dId } = req.params;
    const department = await departmentModel.findById(dId);
    if (!department) {
      return res.status(404).json({
        message: "Department not found.",
      });
    }
    const updatedDepartment = await departmentModel.findByIdAndUpdate(
      dId,
      req.body,
      {
        new: true,
      }
    );

    return res
      .status(200)
      .json({ message: "Department Updated!", updatedDepartment });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    // await slackLogger("Error adding doctor", error.message, error, req);
    // res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const addNurse = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }
    const { name, email, phone, department, password } = req.body;
    if (!name || !email || !phone || !department || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const existingNurse = await nurseModel.findOne({
      email,
    });
    if (existingNurse) {
      return res
        .status(400)
        .json({ message: "A nurse with this email already exists." });
    }
    const departmentExists = await departmentModel.findById(department);
    if (!departmentExists) {
      return res.status(400).json({ message: "Invalid department." });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newNurse = new nurseModel({
      ...req.body,
      password: hashedPassword,
    });
    await newNurse.save();
    return res
      .status(201)
      .json({ message: "Nurse added successfully!", nurse: newNurse });
  } catch (error) {
    console.error("Error adding nurse:", error);
    await slackLogger("Error adding nurse", error.message, error, req);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const loginNurse = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingNurse = await nurseModel.findOne({
      email: email,
    });
    if (!existingNurse) {
      return res.status(404).json({
        success: false,
        message: "Nurse with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingNurse.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: existingNurse._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingNurse,
    });
  } catch (error) {
    console.log("Error logging in nurse!", error);
    await slackLogger("Error logging in nurse", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addHr = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const existingHr = await hrModel.findOne({
      email,
    });
    if (existingHr) {
      return res
        .status(400)
        .json({ message: "A hr with this email already exists." });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newHr = new hrModel({
      ...req.body,
      password: hashedPassword,
    });
    await newHr.save();
    return res
      .status(201)
      .json({ message: "Hr added successfully!", hr: newHr });
  } catch (error) {
    console.error("Error adding hr:", error);
    await slackLogger("Error adding hr", error.message, error, req);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const loginHr = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingHr = await hrModel.findOne({
      email: email,
    });
    if (!existingHr) {
      return res.status(404).json({
        success: false,
        message: "Hr with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingHr.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: existingHr._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingHr,
    });
  } catch (error) {
    console.log("Error logging in hr!", error);
    await slackLogger("Error logging in hr", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addPharmacy = async (req, res) => {
  try {
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const existingPharmacy = await pharmacyModel.findOne({
      email,
    });
    if (existingPharmacy) {
      return res
        .status(400)
        .json({ message: "A pharmacy with this email already exists." });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newPharmacy = new pharmacyModel({
      ...req.body,
      password: hashedPassword,
    });
    await newPharmacy.save();
    return res
      .status(201)
      .json({ message: "Pharmacy added successfully!", pharmacy: newPharmacy });
  } catch (error) {
    console.error("Error adding pharmacy:", error);
    await slackLogger("Error adding pharmacy", error.message, error, req);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

export const loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingPharmacy = await pharmacyModel.findOne({
      email: email,
    });
    if (!existingPharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingPharmacy.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign(
      { id: existingPharmacy._id },
      process.env.JWT_SECRET
    );
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingPharmacy,
    });
  } catch (error) {
    console.log("Error logging in pharmacy!", error);
    await slackLogger("Error logging in pharmacy", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addStoreRole = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }

    const existingStore = await storeRoleModel.findOne({ email });
    if (existingStore) {
      return res
        .status(400)
        .json({ message: "A store with this email already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newStore = new storeRoleModel({
      ...req.body,
      password: hashedPassword,
    });
    await newStore.save();

    res
      .status(201)
      .json({ message: "Store added successfully!", store: newStore });
  } catch (error) {
    console.error("Error adding store:", error);
    await slackLogger("Error adding store", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginStoreRole = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingStore = await storeRoleModel.findOne({
      email: email,
    });
    if (!existingStore) {
      return res.status(404).json({
        success: false,
        message: "Store with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingStore.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: existingStore._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingStore,
    });
  } catch (error) {
    console.log("Error logging in store!", error);
    await slackLogger("Error logging in store", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addLaboratory = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }

    const existingLaboratory = await laboratoryModel.findOne({ email });
    if (existingLaboratory) {
      return res
        .status(400)
        .json({ message: "A laboratory with this email already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newLaboratory = new laboratoryModel({
      ...req.body,
      password: hashedPassword,
    });
    await newLaboratory.save();

    res.status(201).json({
      message: "Laboratory added successfully!",
      laboratory: newLaboratory,
    });
  } catch (error) {
    console.error("Error adding laboratory:", error);
    await slackLogger("Error adding laboratory", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginLaboratory = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingLaboratory = await laboratoryModel.findOne({
      email: email,
    });
    if (!existingLaboratory) {
      return res.status(404).json({
        success: false,
        message: "Laboratory with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingLaboratory.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign(
      { id: existingLaboratory._id },
      process.env.JWT_SECRET
    );
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingLaboratory,
    });
  } catch (error) {
    console.log("Error logging in laboratory!", error);
    await slackLogger("Error logging in laboratory", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addCounter = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }

    const existingCounter = await counterModel.findOne({ email });
    if (existingCounter) {
      return res
        .status(400)
        .json({ message: "A counter with this email already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newCounter = new counterModel({
      ...req.body,
      password: hashedPassword,
    });
    await newCounter.save();

    res.status(201).json({
      message: "Counter added successfully!",
      counter: newCounter,
    });
  } catch (error) {
    console.error("Error adding counter:", error);
    await slackLogger("Error adding counter", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginCounter = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingCounter = await counterModel.findOne({
      email: email,
    });
    if (!existingCounter) {
      return res.status(404).json({
        success: false,
        message: "Counter with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingCounter.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: existingCounter._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingCounter,
    });
  } catch (error) {
    console.log("Error logging in counter!", error);
    await slackLogger("Error logging in counter", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addInventoryRole = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }

    const existingInventory = await inventoryModel.findOne({ email });
    if (existingInventory) {
      return res
        .status(400)
        .json({ message: "A inventory with this email already exists." });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newInventory = new inventoryModel({
      ...req.body,
      password: hashedPassword,
    });
    await newInventory.save();

    res.status(201).json({
      message: "Inventory added successfully!",
      inventory: newInventory,
    });
  } catch (error) {
    console.error("Error adding inventory:", error);
    await slackLogger("Error adding inventory", error.message, error, req);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

export const loginInventoryRole = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingInventory = await inventoryModel.findOne({
      email: email,
    });
    if (!existingInventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingInventory.password
    );

    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign(
      { id: existingInventory._id },
      process.env.JWT_SECRET
    );
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingInventory,
    });
  } catch (error) {
    console.log("Error logging in inventory!", error);
    await slackLogger("Error logging in inventory", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

export const addAgent = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }
    const existingAgent = await agentModal.findOne({ email });
    if (existingAgent) {
      return res
        .status(400)
        .json({ message: "An agent with this email already exists." });
    }
    // const salt = bcrypt.genSaltSync(10);
    // const hashedPassword = bcrypt.hashSync(password, salt);
    const newAgent = new agentModal({
      ...req.body,
      // password: hashedPassword,
    });

    await newAgent.save();

    res
      .status(200)
      .json({ message: "Agent added successfully", data: newAgent });
  } catch (error) {
    console.error("Error adding agent:", error);
    await slackLogger("Agent Addition Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAgents = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await agentModal.countDocuments();
    let totalPages = 1;

    // Check if pagination is required
    if (page && limit) {
      pageSize = parseInt(limit) || 10;
      const currentPage = parseInt(page) || 1;
      skip = (currentPage - 1) * pageSize;
      totalPages = Math.ceil(countDocuments / pageSize);
    } else {
      pageSize = countDocuments; // Fetch all records if pagination is not provided
    }
    const agents = await agentModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "Agents retrieved successfully!",
      agents,
      totalPages,
      totalAgents: countDocuments,
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    await slackLogger("Agent Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const agentId = req.params.aId;
    const deletedAgent = await agentModal.findByIdAndDelete(agentId);
    if (!deletedAgent) {
      res.status(404).json({ message: "Agent not found" });
    } else {
      res
        .status(200)
        .json({ message: "Agent deleted successfully", data: deletedAgent });
    }
  } catch (error) {
    console.error("Error deleting agent:", error);
    await slackLogger("Agent Deletion Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const agentId = req.params.aId;
    const updatedAgent = await agentModal.findByIdAndUpdate(agentId, req.body, {
      new: true,
    });
    if (!updatedAgent) {
      res.status(404).json({ message: "Agent not found" });
    } else {
      res
        .status(200)
        .json({ message: "Agent updated successfully", data: updatedAgent });
    }
  } catch (error) {
    console.error("Error updating agent:", error);
    await slackLogger("Agent Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const addOtherRole = async (req, res) => {
  try {
    const { role, email, phone, password } = req.body;
    if (!role || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }
    const admin = await adminModel.findOne({ _id: req.user.id });
    if (!admin.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admins has the access only." });
    }
    const existingRole = await otherRoleModal.findOne({ email });
    if (existingRole) {
      return res
        .status(400)
        .json({ message: "A role with this email already exists." });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const newRole = new otherRoleModal({
      ...req.body,
      password: hashedPassword,
    });
    await newRole.save();
    res
      .status(201)
      .json({ message: "Role added successfully!", role: newRole });

  } catch (error) {
    console.error("Error in otherRoleRegister:", error);
    await slackLogger("Error in otherRoleRegister:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export const loginOtherRole = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingRole = await otherRoleModal.findOne({
      email: email,
    });
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: "Role with this email doesn't exists.",
      });
    }
    const passwordValidation = bcrypt.compareSync(
      password,
      existingRole.password
    );
    if (!passwordValidation) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password.",
      });
    }
    const token = jwt.sign({ id: existingRole._id }, process.env.JWT_SECRET);
    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: existingRole,
    });
  } catch (error) {
    console.error("Error in otherRoleLogin:", error);
    await slackLogger("Error in otherRoleLogin:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getAgentAndStaff = async (req, res) => {
  try {
    const agentAndStaffModels = {
      agent: agentModal,
      doctor: doctorModel,
      hr: hrModel,
      pharmacy: pharmacyModel,
      store: storeRoleModel,
      counter: counterModel,
      nurse: nurseModel,
      laboratory: laboratoryModel,
      inventory: inventoryModel,
      other: otherRoleModal,
    };

    const allItems = await Promise.all(
      Object.keys(agentAndStaffModels).map(async (key) => {
        return await agentAndStaffModels[key].find();
      })
    );

    return res
      .status(200)
      .json({ message: "Agent and Staff fetched!", allItems: allItems.flat() });
  } catch (error) {
    console.error("Error fetching agent and staff:", error);
    await slackLogger("Agent and Staff Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};
