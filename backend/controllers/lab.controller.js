import { slackLogger } from "../middleware/webHook.js";
import labBillModal from "../models/billings&payments/labBill.modal.js";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import opdBillModal from "../models/inventory/opdBill.modal.js";
import chargesModal from "../models/lab/charges.modal.js";
import componentModal from "../models/lab/component.modal.js";
import labCategoryModel from "../models/lab/labCategory.model.js";
import labReportModal from "../models/lab/labReport.modal.js";
import labTemplateModal from "../models/lab/labTemplate.modal.js";
import labTestModel from "../models/lab/labTest.model.js";
import lookUpModal from "../models/lab/lookUp.modal.js";
import mapGovItemModal from "../models/lab/mapGovItem.modal.js";
import newLabTestModal from "../models/lab/newLabTest.modal.js";
import vendorModal from "../models/lab/vendor.modal.js";
import patientModel from "../models/patient.model.js";

export const addCharges = async (req, res) => {
  try {
    const { sNo, treatment, nonNabh, nonNabh10, nabh, nabh10 } = req.body;
    const existingCharge = await chargesModal.findOne({
      treatment: treatment,
    });
    if (existingCharge) {
      return res.send("Charge already exists");
    }
    const newCharge = new chargesModal({
      sNo: sNo,
      treatment: treatment,
      nonNabh: nonNabh,
      nonNabh10: nonNabh10,
      nabh: nabh,
      nabh10: nabh10,
    });
    await newCharge.save();
    res.send("Charge added successfully");
  } catch (error) {
    console.log("Error in addCharges: ", error);
    await slackLogger("Error in addCharges: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addChargesScript = async (req, res) => {
  try {
    json.forEach(async (item) => {
      console.log(item.procedure, item.rate1, item.discounted_rate1);
      // const { treatment, nonNabh, nonNabh10, nabh, nabh10 } = item;
      const existingCharge = await chargesModal.findOne({
        treatment: item.procedure,
      });
      if (existingCharge) {
        return console.log("Charge already exists");
      }
      const newCharge = new chargesModal({
        treatment: item.procedure,
        nonNabh: item.rate1,
        nonNabh10: item.discounted_rate1,
        nabh: item.rate2,
        nabh10: item.discounted_rate2,
      });
      await newCharge.save();
      console.log("Charge added successfully", item.procedure);
    });
  } catch (error) {
    console.log("Error in addChargesScript: ", error);
    await slackLogger("Error in addChargesScript: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getCharges = async (req, res) => {
  try {
    const charges = await chargesModal.find().sort({ _id: -1 });
    res.send(charges);
  } catch (error) {
    console.log("Error in getCharges: ", error);
    await slackLogger("Error in getCharges: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addLabTest = async (req, res) => {
  try {
    const newLabTest = new labTestModel({
      ...req.body,
    });

    await newLabTest.save();
    res.status(201).json({ message: "Lab test added.", newLabTest });
  } catch (error) {
    console.log("Error in addLabTest: ", error);
    await slackLogger("Error in addLabTest: ", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add lab test", message: error.message });
  }
};

export const getLabTests = async (req, res) => {
  try {
    const labTests = await labTestModel.find().sort({ _id: -1 }).populate("labCategory name");
    if (labTests.length === 0) {
      return res.status(404).json({ message: "No lab tests found." });
    }
    res.status(200).json({ message: "lab test fetched.", labTests });
  } catch (error) {
    console.log("Error in getLabTests: ", error);
    await slackLogger("Error in getLabTests: ", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editLabTest = async (req, res) => {
  try {
    const { tId } = req.params;
    const updates = req.body;

    const updatedType = await labTestModel.findByIdAndUpdate(tId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "lab test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "lab test updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing lab test:", error); // Better error logging
    await slackLogger("Error editing lab test:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit lab test",
    });
  }
};

export const deleteLabTest = async (req, res) => {
  try {
    const { tId } = req.params;
    // console.log('hit')
    const labTests = await labTestModel.findById(tId);
    if (!labTests) {
      return res.status(404).json({
        success: false,
        message: "lab test not found",
      });
    }

    await labTestModel.findByIdAndDelete(tId);

    return res.status(200).json({
      success: true,
      message: "Lab Test deleted.",
      deletedType: labTests,
    });
  } catch (error) {
    console.error("Error deleting lab test:", error);
    await slackLogger("Error deleting lab test:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete lab test",
    });
  }
};

export const addLabCategory = async (req, res) => {
  try {
    const newLabCategory = new labCategoryModel({
      ...req.body,
    });

    await newLabCategory.save();
    res.status(201).json({ message: "Lab Category added.", newLabCategory });
  } catch (error) {
    console.log("Error in addLabCategory: ", error);
    await slackLogger("Error in addLabCategory: ", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add lab category", message: error.message });
  }
};

export const getLabCategories = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await labCategoryModel.countDocuments();
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
    const labCategories = await labCategoryModel.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    return res.status(200).json({
      message: "Lab Categories fetched.",
      labCategories,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getLabCategories: ", error);
    await slackLogger("Error in getLabCategories: ", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editLabCategory = async (req, res) => {
  try {
    const { cId } = req.params;
    const updates = req.body;

    const updatedType = await labCategoryModel.findByIdAndUpdate(cId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "lab cateogory not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "lab category updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing lab category:", error); // Better error logging
    await slackLogger("Error editing lab category:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit category category",
    });
  }
};

export const deleteLabCategory = async (req, res) => {
  try {
    const { cId } = req.params;
    // console.log('hit')
    const labCategory = await labCategoryModel.findById(cId);
    if (!labCategory) {
      return res.status(404).json({
        success: false,
        message: "lab category not found",
      });
    }

    await labCategoryModel.findByIdAndDelete(cId);

    return res.status(200).json({
      success: true,
      message: "Lab category deleted.",
      deletedType: labCategory,
    });
  } catch (error) {
    console.error("Error deleting lab category:", error);
    await slackLogger(
      "Error deleting lab category:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete lab category",
    });
  }
};

export const addComponent = async (req, res) => {
  try {
    const newComponent = new componentModal(req.body);
    await newComponent.save();
    res.status(201).json({ message: "Component added.", newComponent });
  } catch (error) {
    console.log("Error in addComponent: ", error);
    await slackLogger("Error in addComponent: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getAllComponents = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await componentModal.countDocuments();
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
    const components = await componentModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);

    res.status(200).json({
      message: "Components fetched.",
      components,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getAllComponents: ", error);
    await slackLogger("Error in getAllComponents: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteComponent = async (req, res) => {
  try {
    const componentId = req.params.id;
    const component = await componentModal.findByIdAndDelete(componentId);
    if (!component) {
      return res.status(404).json({ message: "Component not found." });
    }
    res.status(200).json({ message: "Component deleted.", component });
  } catch (error) {
    console.log("Error in deleteComponent: ", error);
    await slackLogger("Error in deleteComponent: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const editComponent = async (req, res) => {
  try {
    const componentId = req.params.id;
    const component = await componentModal.findByIdAndUpdate(
      componentId,
      req.body,
      { new: true }
    );
    if (!component) {
      return res.status(404).json({ message: "Component not found." });
    } else {
      res.status(200).json({ message: "Component updated.", component });
    }
  } catch (error) {
    console.log("Error in editComponent: ", error);
    await slackLogger("Error in editComponent: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addLabTemp = async (req, res) => {
  try {
    const labTemp = new labTemplateModal(req.body);
    await labTemp.save();
    res.status(201).json({ message: "Lab Template added.", labTemp });
  } catch (error) {
    console.log("Error in addLabTemp: ", error);
    await slackLogger("Error in addLabTemp: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const editLabTemp = async (req, res) => {
  try {
    const labTempId = req.params.id;
    const labTemp = await labTemplateModal.findByIdAndUpdate(
      labTempId,
      req.body,
      { new: true }
    );
    if (!labTemp) {
      return res.status(404).json({ message: "Lab Template not found." });
    } else {
      res.status(200).json({ message: "Lab Template updated.", labTemp });
    }
  } catch (error) {
    console.log("Error in editLabTemp: ", error);
    await slackLogger("Error in editLabTemp: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteLabTemp = async (req, res) => {
  try {
    const labTempId = req.params.id;
    const labTemp = await labTemplateModal.findByIdAndDelete(labTempId);
    if (!labTemp) {
      return res.status(404).json({ message: "Lab Template not found." });
    } else {
      res.status(200).json({ message: "Lab Template deleted.", labTemp });
    }
  } catch (error) {
    console.log("Error in deleteLabTemp: ", error);
    await slackLogger("Error in deleteLabTemp: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getLabTemps = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await labTemplateModal.countDocuments();
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
    
    const labTemps = await labTemplateModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "Lab Templates fetched.",
      labTemps,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getLabTemps: ", error);
    await slackLogger("Error in getLabTemps: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addVendor = async (req, res) => {
  try {
    const vendor = new vendorModal(req.body);
    await vendor.save();
    res.status(201).json({ message: "Vendor added.", vendor });
  } catch (error) {
    console.log("Error in addVendor: ", error);
    await slackLogger("Error in addVendor: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getVendors = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await vendorModal.countDocuments();
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
    const vendors = await vendorModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "Vendors fetched.",
      vendors,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getVendors: ", error);
    await slackLogger("Error in getVendors: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const editVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await vendorModal.findByIdAndUpdate(vendorId, req.body, {
      new: true,
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    res.status(200).json({ message: "Vendor updated.", vendor });
  } catch (error) {
    console.log("Error in editVendor: ", error);
    await slackLogger("Error in editVendor: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const vendor = await vendorModal.findByIdAndDelete(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    res.status(200).json({ message: "Vendor deleted.", vendor });
  } catch (error) {
    console.log("Error in deleteVendor: ", error);
    await slackLogger("Error in deleteVendor: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addLookUp = async (req, res) => {
  try {
    const lookUp = new lookUpModal(req.body);
    await lookUp.save();
    res.status(201).json({ message: "LookUp added.", lookUp });
  } catch (error) {
    console.log("Error in addLookUp: ", error);
    await slackLogger("Error in addLookUp: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getLookUps = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await lookUpModal.countDocuments();
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
    const lookUps = await lookUpModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "LookUps fetched.",
      lookUps,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getLookUps: ", error);
    await slackLogger("Error in getLookUps: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const editLookUp = async (req, res) => {
  try {
    const lookUpId = req.params.id;
    const lookUp = await lookUpModal.findByIdAndUpdate(lookUpId, req.body, {
      new: true,
    });
    if (!lookUp) {
      return res.status(404).json({ message: "LookUp not found." });
    } else {
      res.status(200).json({ message: "LookUp updated.", lookUp });
    }
  } catch (error) {
    console.log("Error in editLookUp: ", error);
    await slackLogger("Error in editLookUp: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteLookUp = async (req, res) => {
  try {
    const lookUpId = req.params.id;
    const lookUp = await lookUpModal.findByIdAndDelete(lookUpId);

    if (!lookUp) {
      return res.status(404).json({ message: "LookUp not found." });
    }
    res.status(200).json({ message: "LookUp deleted.", lookUp });
  } catch (error) {
    console.log("Error in deleteLookUp: ", error);
    await slackLogger("Error in deleteLookUp: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addGovLabTest = async (req, res) => {
  try {
    const govLabItem = new mapGovItemModal(req.body);
    await govLabItem.save();
    res.status(201).json({ message: "Gov Lab Test added.", govLabItem });
  } catch (error) {
    console.log("Error in addGovLabTest: ", error);
    await slackLogger("Error in addGovLabTest: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const getGovLabTests = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await mapGovItemModal.countDocuments();
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
    const govLabItems = await mapGovItemModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    if (govLabItems.length === 0) {
      return res.status(404).json({ message: "No Gov Lab Tests found." });
    }
    res.status(200).json({
      message: "Gov Lab Tests fetched.",
      govLabItems,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getGovLabTests: ", error);
    await slackLogger("Error in getGovLabTests: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const editGovLabTest = async (req, res) => {
  try {
    const govLabItemId = req.params.id;
    const govLabItem = await mapGovItemModal.findByIdAndUpdate(
      govLabItemId,
      req.body,
      { new: true }
    );
    if (!govLabItem) {
      return res.status(404).json({ message: "Gov Lab Test not found." });
    } else {
      res.status(200).json({ message: "Gov Lab Test updated.", govLabItem });
    }
  } catch (error) {
    console.log("Error in editGovLabTest: ", error);
    await slackLogger("Error in editGovLabTest: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteGovLabTest = async (req, res) => {
  try {
    const govLabItemId = req.params.id;
    const govLabItem = await mapGovItemModal.findByIdAndDelete(govLabItemId);
    if (!govLabItem) {
      return res.status(404).json({ message: "Gov Lab Test not found." });
    } else {
      res.status(200).json({ message: "Gov Lab Test deleted.", govLabItem });
    }
  } catch (error) {
    console.log("Error in deleteGovLabTest: ", error);
    await slackLogger("Error in deleteGovLabTest: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const addNewLabTest = async (req, res) => {
  try {
    if (req.body.components) {
      // filter empty strings
      req.body.components = req.body.components.filter((item) => item != "");
    }
    const newLabTest = new newLabTestModal({
      ...req.body,
    });

    await newLabTest.save();
    res.status(201).json({ message: "Lab test added.", newLabTest });
  } catch (error) {
    console.log("Error in addNewLabTest: ", error);
    await slackLogger("Error in addNewLabTest: ", error.message, error, req);
    res
      .status(500)
      .json({ error: "Failed to add lab test", message: error.message });
  }
};

export const deletNewLabTest = async (req, res) => {
  try {
    const { tId } = req.params;
    // console.log('hit')
    const labTests = await newLabTestModal.findById(tId);
    if (!labTests) {
      return res.status(404).json({
        success: false,
        message: "lab test not found",
      });
    }

    await newLabTestModal.findByIdAndDelete(tId);

    return res.status(200).json({
      success: true,
      message: "Lab Test deleted.",
      deletedType: labTests,
    });
  } catch (error) {
    console.error("Error deleting lab test:", error);
    await slackLogger("Error deleting lab test:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to delete lab test",
    });
  }
};

export const getNewLabTests = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await newLabTestModal.countDocuments();
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
    const labTests = await newLabTestModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "Lab tests fetched.",
      labTests,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getLabTests: ", error);
    await slackLogger("Error in getLabTests: ", error.message, error, req);
    res.status(500).json({ message: "Server Error", error });
  }
};

export const editNewLabTest = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { tId } = req.params;
    const updates = req.body;

    const updatedType = await newLabTestModal.findByIdAndUpdate(tId, updates, {
      new: true,
    });

    if (!updatedType) {
      return res.status(404).json({
        success: false,
        message: "lab test not found.",
      });
    }

    return res.status(200).json({
      success: true,
      updatedType,
      message: "lab test updated.",
      updatedType,
    });
  } catch (error) {
    console.error("Error editing lab test:", error); // Better error logging
    await slackLogger("Error editing lab test:", error.message, error, req);
    return res.status(500).json({
      success: false,
      message: "Server error, failed to edit lab test",
    });
  }
};

export const searchLabTests = async (req, res) => {
  try {
    const regex = new RegExp(req.query.search, "i");
    const labTests = await newLabTestModal.find({ name: { $regex: regex } });
    labTests.forEach((labTest) => {
      labTest.itemCategory = "lab test";
    });
    res.status(200).json({ message: "Lab Tests fetched.", items: labTests });
  } catch (error) {
    console.log("Error in lab test search: ", error);
    await slackLogger("Error in lab test search: ", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getLabBills = async (req, res) => {
  try {
    const opdBills = await opdBillModal.find();
    const ipdBills = await ipdBillModal.find();

    const bills = [...opdBills, ...ipdBills];

    const filteredBills = bills.filter(
      (bill) =>
        bill.item && bill.item.some((item) => item.itemCategory === "lab test")
    );

    res
      .status(200)
      .json({ message: "Lab Tests fetched.", items: filteredBills });
  } catch (error) {
    console.log("Error in getLabBills: ", error);
    await slackLogger("Error in getLabBills: ", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getLabReports = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure page is at least 1
    const limit = Math.max(parseInt(req.query.limit) || 10, 1); // Ensure limit is at least 1

    const skip = (page - 1) * limit;

    // Fetch total count of documents
    const countDocuments = await labReportModal.countDocuments();

    // Fetch lab reports with pagination
    const labReports = await labReportModal
      .find()
      .sort({ _id: -1 })
      .populate("patientId", "patientName age gender mobile email uhid")
      .skip(skip)
      .limit(limit);

    if (!labReports.length) {
      return res.status(404).json({ message: "No lab reports found." });
    }

    const totalPages = Math.ceil(countDocuments / limit);

    // Respond with lab reports
    res.status(200).json({
      message: "Lab reports fetched successfully.",
      items: labReports, // Fixed to return labReports
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.error("Error in getLabReports: ", error);
    await slackLogger("Error in getLabReports", error.message, error, req);
    return res
      .status(500)
      .json({ message: "An error occurred while fetching lab reports." });
  }
};

export const updateLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    req.body.reported = Date.now();
    req.body.labTest.testStatus = "reported";
    const updates = req.body;
    const updateReport = await labReportModal
      .findByIdAndUpdate(reportId, updates, { new: true })
      .populate("patientId");
    if (!updateReport) {
      return res.status(404).json({ message: "Lab report not found." });
    } else {
      res
        .status(200)
        .json({ message: "Lab report updated.", report: updateReport });
    }
  } catch (error) {
    console.error("Error in updateLabReport: ", error);
    await slackLogger("Error in updateLabReport", error.message, error, req);
    return res
      .status(500)
      .json({ message: "An error occurred while updating lab report." });
  }
};

export const updateCollectedDate = async (req, res) => {
  try {
    const { reportId } = req.params;
    const updateReport = await labReportModal
      .findByIdAndUpdate(
        reportId,
        { collected: Date.now(), "labTest.testStatus": "in-review" },
        { new: true }
      )
      .populate("patientId");
    if (!updateReport) {
      return res.status(404).json({ message: "Lab report not found." });
    } else {
      res
        .status(200)
        .json({ message: "Lab report updated.", report: updateReport });
    }
  } catch (error) {
    console.error("Error in updateCollectedDate: ", error);
    await slackLogger(
      "Error in updateCollectedDate",
      error.message,
      error,
      req
    );
    return res
      .status(500)
      .json({ message: "An error occurred while updating collected date." });
  }
};

export const prevLabReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const updateReport = await labReportModal
      .findByIdAndUpdate(
        reportId,
        { "labTest.testStatus": "in-review", reported: null },
        { new: true }
      )
      .populate("patientId");
    if (!updateReport) {
      return res.status(404).json({ message: "Lab report not found." });
    } else {
      res
        .status(200)
        .json({ message: "Lab report updated.", report: updateReport });
    }
  } catch (error) {
    console.error("Error in prevLabReport: ", error);
    await slackLogger("Error in prevLabReport", error.message, error, req);
    return res
      .status(500)
      .json({ message: "An error occurred while updating lab report." });
  }
};

// ===========-=-=-=-=-=-=- Laboratory Billing -=-=-=-=-=-=-=-================ //

async function generateSixDigitLaboratory() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await labBillModal.findOne({
      billNumber: randomNumber,
    });
    if (!existingBill) {
      isUnique = true;
    }
  }

  return randomNumber;
}

async function generateSixDigitReport() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingReport = await labReportModal.findOne({
      reportNumber: randomNumber,
    });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const submitLaboratoryBill = async (req, res) => {
  try {
    console.log("Laboratory bill data received:", req.body);
    const date = new Date();
    const time = date.toLocaleTimeString();
    console.log("Time:", time);
    req.body.time = time;

    const newBill = new labBillModal(req.body);

    // Generate and assign a unique bill number
    newBill.billNumber = await generateSixDigitLaboratory();

    const patient = await patientModel.findById(req.body.patientId);

    await Promise.all(
      newBill.item.map(async (item) => {
        const components = await newLabTestModal
          .findOne({ name: item.itemName })
          .populate("components");

        if (!components) {
          console.error(`No lab test found with name: ${item.itemName}`);
          return; // Skip if no components are found
        }

        // Map components to test components
        const testComponents = components.components.map((component) => {
          let calculateReferenceValue;
          if (parseInt(patient?.age) < 12) {
            calculateReferenceValue = component.rangeDescription.childRange;
          } else if (patient?.gender.toLowerCase() === "male") {
            calculateReferenceValue = component.rangeDescription.maleRange;
          } else if (patient?.gender.toLowerCase() === "female") {
            calculateReferenceValue = component.rangeDescription.femaleRange;
          } else {
            calculateReferenceValue = component.rangeDescription.genRange;
          }
          return {
            componentId: component._id,
            componentName: component.name,
            result: "",
            referenceValue: calculateReferenceValue,
            unit: component.unit,
          };
        });

        // Generate report number
        const reportNumber = await generateSixDigitReport();

        // Update the item's report number
        item.reportNumber = reportNumber;

        // Create and save the lab report
        const newLabReport = new labReportModal({
          patientId: req.body.patientId,
          patientName: req.body.patientName,
          billNumber: newBill.billNumber,
          reportNumber,
          labTest: {
            testName: item.itemName,
            testCategory: item.itemCategory,
            testDate: item.itemDate,
            testPrice: item.totalCharge,
            testComponents,
          },
          prescribedBy: req.body.prescribedBy,
          prescribedByName: req.body.prescribedByName,
        });

        await newLabReport.save();
        console.log(`Lab report created for item: ${item.itemName}`);
      })
    );

    // Save the pharmacy bill
    await newBill.save();

    res.status(200).json({
      message: "Laboratory bill submitted successfully.",
      bill: newBill,
    });
    console.log("Laboratory bill submitted successfully.");
  } catch (error) {
    console.error("Error in submitLaboratoryBill:", error);
    await slackLogger(
      "Laboratory Bill Submission Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const getNewLaboratoryBills = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide both startDate and endDate in query parameters.",
      });
    }

    // Normalize startDate and endDate to remove time
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Start of the day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    // Validate date formats
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate format. Use YYYY-MM-DD.",
      });
    }

    // Ensure startDate is not after endDate
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "startDate must be earlier than or equal to endDate.",
      });
    }

    // Define the query
    const query = {
      date: {
        $gte: start,
        $lte: end,
      },
    };

    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await labBillModal.countDocuments(query);
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

    const bills = await labBillModal
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();


    res.status(200).json({
      message: "Bills Fetched Successfully!",
      items: bills, // Processed bills with grouped items
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.error("Error in getting bills: ", error);
    await slackLogger(
      "Laboratory Bills Fetch Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteLaboratoryBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await labBillModal.findByIdAndDelete(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    const deletedLabReports = await labReportModal.deleteMany({
      billNumber: bill.billNumber,
    });

    res
      .status(200)
      .json({ message: "Bill deleted successfully", bill, deletedLabReports });
  } catch (error) {
    console.error("Error deleting bill: ", error);
    await slackLogger(
      "Laboratory Bill Deletion Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLaboratoryBill = async (req, res) => {
  try {
    const { billId } = req.params;
    console.log("updateLaboratoryBill: ", req.body);

    // Find the old bill
    const oldBill = await labBillModal.findById(billId);
    if (!oldBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Update the bill
    const updatedBill = await labBillModal.findByIdAndUpdate(billId, req.body, {
      new: true,
    });

    if (!updatedBill) {
      return res.status(404).json({ message: "Failed to update bill" });
    }

    const patient = await patientModel.findById(updatedBill.patientId);

    // Process each item in the updated bill
    await Promise.all(
      updatedBill.item.map(async (item) => {
        // Lab test handling using reportNumber
        if (item.itemCategory === "lab test") {
          const oldLabReport = oldBill.item.find(
            (oldItem) => oldItem.reportNumber === item.reportNumber
          );

          // if (!item.reportNumber) {
          //   console.error("Report number not found for lab test item");
          //   await slackLogger(
          //     "Report Number Not Found",
          //     "Report number not found for lab test item",
          //     item,
          //     req
          //   );
          //   return;
          // }

          if (oldLabReport) {
            // Update existing lab report
            await labReportModal.updateOne(
              { reportNumber: item.reportNumber },
              {
                $set: {
                  "labTest.testDate": item.itemDate,
                  "labTest.testPrice": item.totalCharge,
                },
              }
            );
          } else {
            // Add a new lab report if not found
            const components = await newLabTestModal
              .findOne({ name: item.itemName })
              .populate("components");

            if (components) {
              // Map components to test components
              const testComponents = components.components.map((component) => {
                let calculateReferenceValue;
                if (patient?.age < 12) {
                  calculateReferenceValue =
                    component.rangeDescription.childRange;
                } else if (patient?.gender.toLowerCase() === "male") {
                  calculateReferenceValue =
                    component.rangeDescription.maleRange;
                } else if (patient?.gender.toLowerCase() === "female") {
                  calculateReferenceValue =
                    component.rangeDescription.femaleRange;
                } else {
                  calculateReferenceValue = component.rangeDescription.genRange;
                }
                return {
                  componentId: component._id,
                  componentName: component.name,
                  result: "",
                  referenceValue: calculateReferenceValue,
                  unit: component.unit,
                };
              });

              const reportNumber = await generateSixDigitReport();

              const newLabReport = new labReportModal({
                patientId: patient._id,
                patientName: patient.patientName,
                billNumber: updatedBill.billNumber,
                reportNumber,
                labTest: {
                  testName: item.itemName,
                  testCategory: item.itemCategory,
                  testDate: item.itemDate,
                  testPrice: item.totalCharge,
                  testComponents,
                },
                prescribedBy: updatedBill.prescribedBy,
                prescribedByName: updatedBill.prescribedByName,
              });

              await newLabReport.save();
            }
          }
        }
      })
    );

    // Remove lab reports for deleted lab test items
    const updatedLabReports = updatedBill.item
      .filter((item) => item.itemCategory === "lab test")
      .map((item) => item.reportNumber);

    const oldLabReports = oldBill.item
      .filter((item) => item.itemCategory === "lab test")
      .map((item) => item.reportNumber);

    const deletedLabReports = oldLabReports.filter(
      (reportNumber) => !updatedLabReports.includes(reportNumber)
    );

    await Promise.all(
      deletedLabReports.map(async (reportNumber) => {
        await labReportModal.deleteOne({ reportNumber });
      })
    );

    res
      .status(200)
      .json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
    console.error("Error updating bill: ", error);
    await slackLogger(
      "Laboratory Bill Update Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};
