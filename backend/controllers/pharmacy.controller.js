import categoryModal from "../models/pharmacy/category.modal.js";
import Company from "../models/pharmacy/company.modal.js";
import dispensaryModal from "../models/pharmacy/dispensary.modal.js";
import genericNameModal from "../models/pharmacy/genericName.modal.js";
import invoiceHeaderModal from "../models/pharmacy/invoiceHeader.modal.js";
import itemModal from "../models/pharmacy/item.modal.js";
import itemTypeModal from "../models/pharmacy/itemType.modal.js";
import Supplier from "../models/pharmacy/supplier.model.js";
import tCModal from "../models/pharmacy/t&c.modal.js";
import taxModal from "../models/pharmacy/tax.modal.js";
import uomModal from "../models/pharmacy/uom.modal.js";
import rackModal from "../models/pharmacy/rack.modal.js";
import medicineModal from "../models/pharmacy/medicine.modal.js";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import opdBillModal from "../models/inventory/opdBill.modal.js";
import { slackLogger } from "../middleware/webHook.js";
import pharmacyBillModal from "../models/billings&payments/pharmacyBill.modal.js";
import { formatDate } from "../utils/utilFunctions.js";
import supplierBillModal from "../models/inventory/supplierBill.modal.js";
import returnMedModel from "../models/pharmacy/returnMed.model.js";
import patientModel from "../models/patient.model.js";

export const addSupplier = async (req, res) => {
  try {
    // console.log(req.body);
    const existingSupplier = await Supplier.find({
      or: [
        { name: req.body.name },
        { contactNo: req.body.contactNo },
        { email: req.body.email },
      ],
    });
    if (existingSupplier.length > 0) {
      return res
        .status(400)
        .json({ message: "Supplier already exists with same credentials." });
    }
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(200).json({ message: "Supplier added.", supplier });
  } catch (error) {
    console.log("Error in addSupplier", error);
    await slackLogger("Error in addSupplier", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await Supplier.countDocuments();
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

    const suppliers = await Supplier.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    console.log("suppliers fetched successfully!");

    res.status(200).json({
      message: "Suppliers fetched.",
      items: suppliers,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getSuppliers", error);
    await slackLogger("Error in getSuppliers", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.status(200).json({ message: "Supplier deleted." });
  } catch (error) {
    console.log("Error in deleteSupplier", error);
    await slackLogger("Error in deleteSupplier", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found." });
    }
    res.status(200).json({ message: "Supplier updated.", supplier });
  } catch (error) {
    console.log("Error in editSupplier", error);
    await slackLogger("Error in editSupplier", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addCompany = async (req, res) => {
  try {
    // console.log(req.body);
    const existingCompany = await Company.find({
      or: [
        { name: req.body.name },
        { contactNumber: req.body.contactNumber },
        { email: req.body.email },
      ],
    });
    if (existingCompany.length > 0) {
      return res
        .status(400)
        .json({ message: "Company already exists with same credentials." });
    }
    const company = new Company(req.body);
    await company.save();
    res.status(200).json({ message: "Company added.", company });
  } catch (error) {
    console.log("Error in addCompany", error);
    await slackLogger("Error in addCompany", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await Company.countDocuments();
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
    const companies = await Company.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Companies fetched.",
      items: companies,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getCompanies", error);
    await slackLogger("Error in getCompanies", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    res.status(200).json({ message: "Company deleted." });
  } catch (error) {
    console.log("Error in deleteCompany", error);
    await slackLogger("Error in deleteCompany", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    res.status(200).json({ message: "Company updated.", company });
  } catch (error) {
    console.log("Error in editCompany", error);
    await slackLogger("Error in editCompany", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addCategory = async (req, res) => {
  try {
    const existingCategory = await categoryModal.find({ name: req.body.name });
    if (existingCategory.length > 0) {
      return res
        .status(400)
        .json({ message: "Category already exists with same name." });
    }
    const category = new categoryModal(req.body);
    await category.save();
    res.status(200).json({ message: "Category added.", category });
  } catch (error) {
    console.log("Error in addCategory", error);
    await slackLogger("Error in addCategory", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await categoryModal.countDocuments();
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
    const categories = await categoryModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Categories fetched.",
      items: categories,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getCategories", error);
    await slackLogger("Error in getCategories", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await categoryModal.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category deleted." });
  } catch (error) {
    console.log("Error in deleteCategory", error);
    await slackLogger("Error in deleteCategory", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editCategory = async (req, res) => {
  try {
    const category = await categoryModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }
    res.status(200).json({ message: "Category updated.", category });
  } catch (error) {
    console.log("Error in editCategory", error);
    await slackLogger("Error in editCategory", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const searchCategory = async (req, res) => {
  try {
    const regex = new RegExp(req.body.search, "i");
    const categories = await categoryModal.find({ name: { $regex: regex } });
    if (categories.length === 0) {
      return res.status(404).json({ message: "No category found." });
    }
    res.status(200).json({ message: "Category fetched.", categories });
  } catch (error) {
    console.log("Error in searchCategory", error);
    await slackLogger("Error in searchCategory", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addUOM = async (req, res) => {
  try {
    const existingUOM = await uomModal.find({ uom: req.body.uom });
    if (existingUOM.length > 0) {
      return res
        .status(400)
        .json({ message: "UOM already exists with same name." });
    }
    const uom = new uomModal(req.body);
    await uom.save();
    res.status(200).json({ message: "UOM added.", uom });
  } catch (error) {
    console.log("Error in addUOM", error);
    await slackLogger("Error in addUOM", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getUOMs = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await uomModal.countDocuments();
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
    const uoms = await uomModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "UOMs fetched.",
      items: uoms,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getUOMs", error);
    await slackLogger("Error in getUOMs", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteUOM = async (req, res) => {
  try {
    const uom = await uomModal.findByIdAndDelete(req.params.id);
    if (!uom) {
      return res.status(404).json({ message: "UOM not found." });
    }
    res.status(200).json({ message: "UOM deleted." });
  } catch (error) {
    console.log("Error in deleteUOM", error);
    await slackLogger("Error in deleteUOM", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editUOM = async (req, res) => {
  try {
    const uom = await uomModal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!uom) {
      return res.status(404).json({ message: "UOM not found." });
    }
    res.status(200).json({ message: "UOM updated.", uom });
  } catch (error) {
    console.log("Error in editUOM", error);
    await slackLogger("Error in editUOM", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addItemType = async (req, res) => {
  try {
    const existingItemType = await itemTypeModal.find({ type: req.body.type });
    if (existingItemType.length > 0) {
      return res
        .status(400)
        .json({ message: "Item Type already exists with same name." });
    }
    const itemType = new itemTypeModal(req.body);
    await itemType.save();
    res.status(200).json({ message: "Item Type added.", itemType });
  } catch (error) {
    console.log("Error in addItemType", error);
    await slackLogger("Error in addItemType", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getItemTypes = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await itemTypeModal.countDocuments();
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
    const itemTypes = await itemTypeModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Item Types fetched.",
      items: itemTypes,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getItemTypes", error);
    await slackLogger("Error in getItemTypes", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteItemType = async (req, res) => {
  try {
    const itemType = await itemTypeModal.findByIdAndDelete(req.params.id);
    if (!itemType) {
      return res.status(404).json({ message: "Item Type not found." });
    }
    res.status(200).json({ message: "Item Type deleted." });
  } catch (error) {
    console.log("Error in deleteItemType", error);
    await slackLogger("Error in deleteItemType", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editItemType = async (req, res) => {
  try {
    const itemType = await itemTypeModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!itemType) {
      return res.status(404).json({ message: "Item Type not found." });
    }
    res.status(200).json({ message: "Item Type updated.", itemType });
  } catch (error) {
    console.log("Error in editItemType", error);
    await slackLogger("Error in editItemType", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addGenericName = async (req, res) => {
  try {
    const existingGenericName = await genericNameModal.find({
      genericName: req.body.name,
    });
    if (existingGenericName.length > 0) {
      return res
        .status(400)
        .json({ message: "Generic Name already exists with same name." });
    }
    const genericName = new genericNameModal(req.body);
    await genericName.save();
    res.status(200).json({ message: "Generic name added.", genericName });
  } catch (error) {
    console.log("Error in addGenericName", error);
    await slackLogger("Error in addGenericName", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getGenericNames = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await genericNameModal.countDocuments();
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
    const genericNames = await genericNameModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Generic Names fetched.",
      genericNames,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getGenericNames", error);
    await slackLogger("Error in getGenericNames", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteGenericName = async (req, res) => {
  try {
    const genericName = await genericNameModal.findByIdAndDelete(req.params.id);
    if (!genericName) {
      return res.status(404).json({ message: "Generic Name not found." });
    }
    res.status(200).json({ message: "Generic Name deleted." });
  } catch (error) {
    console.log("Error in deleteGenericName", error);
    await slackLogger("Error in deleteGenericName", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editGenericName = async (req, res) => {
  try {
    const genericName = await genericNameModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!genericName) {
      return res.status(404).json({ message: "Generic Name not found." });
    }
    res.status(200).json({ message: "Generic Name updated.", genericName });
  } catch (error) {
    console.log("Error in editGenericName", error);
    await slackLogger("Error in editGenericName", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addItem = async (req, res) => {
  try {
    const existingItem = await itemModal.find({
      or: [{ name: req.body.name }, { code: req.body.code }],
    });
    if (existingItem.length > 0) {
      return res
        .status(400)
        .json({ message: "Item already exists with same name or code." });
    }
    const item = new itemModal(req.body);
    await item.save();
    res.status(200).json({ message: "Item added.", item });
  } catch (error) {
    console.log("Error in addItem", error);
    await slackLogger("Error in addItem", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getItems = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await itemModal.countDocuments();
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
    const items = await itemModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Items fetched.",
      items,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getItems", error);
    await slackLogger("Error in getItems", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await itemModal.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.status(200).json({ message: "Item deleted." });
  } catch (error) {
    console.log("Error in deleteItem", error);
    await slackLogger("Error in deleteItem", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editItem = async (req, res) => {
  try {
    const item = await itemModal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }
    res.status(200).json({ message: "Item updated.", item });
  } catch (error) {
    console.log("Error in editItem", error);
    await slackLogger("Error in editItem", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addTax = async (req, res) => {
  try {
    const existingTax = await taxModal.find({ name: req.body.name });
    if (existingTax.length > 0) {
      return res
        .status(400)
        .json({ message: "Tax already exists with same name." });
    }
    const tax = new taxModal(req.body);
    await tax.save();
    res.status(200).json({ message: "Tax added.", tax });
  } catch (error) {
    console.log("Error in addTax", error);
    await slackLogger("Error in addTax", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getTaxes = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await taxModal.countDocuments();
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
    const taxes = await taxModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Taxes fetched.",
      items: taxes,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getTaxes", error);
    await slackLogger("Error in getTaxes", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteTax = async (req, res) => {
  try {
    const tax = await taxModal.findByIdAndDelete(req.params.id);
    if (!tax) {
      return res.status(404).json({ message: "Tax not found." });
    }
    res.status(200).json({ message: "Tax deleted." });
  } catch (error) {
    console.log("Error in deleteTax", error);
    await slackLogger("Error in deleteTax", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editTax = async (req, res) => {
  try {
    const tax = await taxModal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!tax) {
      return res.status(404).json({ message: "Tax not found." });
    }
    res.status(200).json({ message: "Tax updated.", tax });
  } catch (error) {
    console.log("Error in editTax", error);
    await slackLogger("Error in editTax", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addDispensary = async (req, res) => {
  try {
    const existingDispensary = await dispensaryModal.find({
      name: req.body.name,
    });
    if (existingDispensary.length > 0) {
      return res
        .status(400)
        .json({ message: "Dispensary already exists with same name." });
    }
    const dispensary = new dispensaryModal(req.body);
    await dispensary.save();
    res.status(200).json({ message: "Dispensary added.", dispensary });
  } catch (error) {
    console.log("Error in addDispensary", error);
    await slackLogger("Error in addDispensary", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getDispensaries = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await dispensaryModal.countDocuments();
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

    const dispensaries = await dispensaryModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Dispensaries fetched.",
      items: dispensaries,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getDispensaries", error);
    await slackLogger("Error in getDispensaries", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteDispensary = async (req, res) => {
  try {
    const dispensary = await dispensaryModal.findByIdAndDelete(req.params.id);
    if (!dispensary) {
      return res.status(404).json({ message: "Dispensary not found." });
    }
    res.status(200).json({ message: "Dispensary deleted." });
  } catch (error) {
    console.log("Error in deleteDispensary", error);
    await slackLogger("Error in deleteDispensary", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editDispensary = async (req, res) => {
  try {
    const dispensary = await dispensaryModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!dispensary) {
      return res.status(404).json({ message: "Dispensary not found." });
    }
    res.status(200).json({ message: "Dispensary updated." });
  } catch (error) {
    console.log("Error in editDispensary", error);
    await slackLogger("Error in editDispensary", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const searchDispensary = async (req, res) => {
  try {
    const regex = new RegExp(req.body.search, "i");
    const dispensaries = await dispensaryModal.find({
      name: { $regex: regex },
    });
    if (dispensaries.length === 0) {
      return res.status(404).json({ message: "No dispensary found." });
    }
    res.status(200).json({ message: "Dispensary fetched.", dispensaries });
  } catch (error) {
    console.log("Error in searchDispensary", error);
    await slackLogger("Error in searchDispensary", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addRack = async (req, res) => {
  try {
    // const existingRack = await rackModal.find([{ store: req.body.store }, { rackNo: req.body.rackNo }]);

    // if (existingRack.length > 0) {
    //   return res
    //     .status(400)
    //     .json({ message: "Rack already exists with same detail." });
    // }
    const rack = new rackModal(req.body);
    await rack.save();
    res.status(200).json({ message: "Rack added.", rack });
  } catch (error) {
    console.log("Error in addRack", error);
    await slackLogger("Error in addRack", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getRacks = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await rackModal.countDocuments();
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
    const racks = await rackModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "Racks fetched.",
      items: racks,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getRacks", error);
    await slackLogger("Error in getRacks", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteRack = async (req, res) => {
  try {
    const rack = await rackModal.findByIdAndDelete(req.params.id);
    if (!rack) {
      return res.status(404).json({ message: "Rack not found." });
    }
    res.status(200).json({ message: "Rack deleted.", rack });
  } catch (error) {
    console.log("Error in deleteRack", error);
    await slackLogger("Error in deleteRack", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editRack = async (req, res) => {
  try {
    const rack = await rackModal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!rack) {
      return res.status(404).json({ message: "Rack not found." });
    }
    res.status(200).json({ message: "Rack updated.", rack });
  } catch (error) {
    console.log("Error in editRack", error);
    await slackLogger("Error in editRack", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addInvoiceHeader = async (req, res) => {
  try {
    const existingInvoiceHeader = await invoiceHeaderModal.find({
      or: [{ hospitalName: req.body.hospitalName }, { email: req.body.email }],
    });
    if (existingInvoiceHeader.length > 0) {
      return res
        .status(400)
        .json({ message: "Invoice Header already exists with same name." });
    }
    const invoiceHeader = new invoiceHeaderModal(req.body);
    await invoiceHeader.save();
    res.status(200).json({ message: "Invoice added.", invoiceHeader });
  } catch (error) {
    console.log("Error in addInvoiceHeader", error);
    await slackLogger("Error in addInvoiceHeader", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getInvoiceHeaders = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await invoiceHeaderModal.countDocuments();
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
    const invoiceHeaders = await invoiceHeaderModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);
    res.status(200).json({
      message: "Invoice Headers fetched.",
      items: invoiceHeaders,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getInvoiceHeaders", error);
    await slackLogger("Error in getInvoiceHeaders", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteInvoiceHeader = async (req, res) => {
  try {
    const invoiceHeader = await invoiceHeaderModal.findByIdAndDelete(
      req.params.id
    );
    if (!invoiceHeader) {
      return res.status(404).json({ message: "Invoice Header not found." });
    }
    res.status(200).json({ message: "Invoice Header deleted." });
  } catch (error) {
    console.log("Error in deleteInvoiceHeader", error);
    await slackLogger(
      "Error in deleteInvoiceHeader",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: error });
  }
};

export const editInvoiceHeader = async (req, res) => {
  try {
    const invoiceHeader = await invoiceHeaderModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!invoiceHeader) {
      return res.status(404).json({ message: "Invoice Header not found." });
    }
    res.status(200).json({ message: "Invoice Header updated.", invoiceHeader });
  } catch (error) {
    console.log("Error in editInvoiceHeader", error);
    await slackLogger("Error in editInvoiceHeader", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const addTandC = async (req, res) => {
  try {
    const existingTandC = await tCModal.find({ shortName: req.body.shortName });
    if (existingTandC.length > 0) {
      return res.status(400).json({
        message: "TandC already exists with same name or description.",
      });
    }
    const tandC = new tCModal(req.body);
    await tandC.save();
    res.status(200).json({ message: "T&C added.", tandC });
  } catch (error) {
    console.log("Error in addTandC", error);
    await slackLogger("Error in addTandC", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getTandCs = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await tCModal.countDocuments();
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
    const tandCs = await tCModal.find().sort({ _id: -1 }).skip(skip).limit(pageSize);
    res.status(200).json({
      message: "T&Cs fetched.",
      items: tandCs,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getTandCs", error);
    await slackLogger("Error in getTandCs", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteTandC = async (req, res) => {
  try {
    const existingTandC = await tCModal.findByIdAndDelete(req.params.id);
    if (!existingTandC) {
      return res.status(404).json({ message: "T&C not found." });
    }
    res.status(200).json({ message: "T&C deleted." });
  } catch (error) {
    console.log("Error in deleteTandC", error);
    await slackLogger("Error in deleteTandC", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editTandC = async (req, res) => {
  try {
    const existingTandC = await tCModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!existingTandC) {
      return res.status(404).json({ message: "T&C not found." });
    }
    res.status(200).json({ message: "T&C updated.", existingTandC });
  } catch (error) {
    console.log("Error in editTandC", error);
    await slackLogger("Error in editTandC", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

//* <-------------- Other than pharmacy settings  -------------->

export const addMedicine = async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    req.body.stockQuantity = parseInt(req.body.stockQuantity) || 0;
    req.body.expiryDate = formatDate(req.body.expiryDate);
    const newMedicine = new medicineModal(req.body);
    await newMedicine.save();
    console.log("newMedicine added successfully!");
    res.status(200).json({ message: "Medicine added.", newMedicine });
  } catch (error) {
    console.log("Error in addMedicine: ", error);
    await slackLogger("Error in addMedicine: ", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getMedicines = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await medicineModal.countDocuments();
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

    // Fetch medicines with sorting, pagination applied
    const items = await medicineModal
      .find()
      .sort({ _id: -1 }) // Sort by _id in ascending order; use -1 for descending
      .skip(skip)
      .limit(pageSize);


    res.status(200).json({
      message: "Medicines not fetched successfully!",
      items,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    await slackLogger("Error fetching medicines:", error.message, error, req);
    return res.status(500).json({ message: "Server error" });
  }
};

export const searchMedicine = async (req, res) => {
  try {
    const regex = new RegExp(req.query.search, "i");
    const medicines = await medicineModal.find({ name: { $regex: regex } });
    medicines.forEach((med) => {
      med.itemCategory = "pharmacy";
    });
    res.status(200).json({ message: "Medicine fetched.", medicines });
  } catch (error) {
    console.log("Error in medicine search: ", error);
    await slackLogger("Error in medicine search: ", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await medicineModal.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }
    res.status(200).json({ message: "Medicine deleted." });
  } catch (error) {
    console.log("Error in deleteMedicine", error);
    await slackLogger("Error in deleteMedicine", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const editMedicine = async (req, res) => {
  try {
    req.body.stockQuantity = parseInt(req.body.stockQuantity) || 0;
    const medicine = await medicineModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }
    res.status(200).json({ message: "Medicine updated.", medicine });
  } catch (error) {
    console.log("Error in editMedicine", error);
    await slackLogger("Error in editMedicine", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const returnMedicine = async (req, res) => {
  try {
    const { patientId, medicines } = req.body;

    // Check if patient exists
    const patient = await patientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Create a new return entry
    const newReturn = new returnMedModel(req.body);

    // Iterate over each medicine to adjust stock
    for (const medicine of medicines) {
      const { medicineId, quantity } = medicine;

      // Find existing medicine by ID
      const existingMedicine = await medicineModal.findById(medicineId);
      if (!existingMedicine) {
        console.warn(`Medicine with ID ${medicineId} not found, skipping...`);
        continue;
      }

      // Update stock quantity
      existingMedicine.stockQuantity = parseInt(existingMedicine.stockQuantity, 10) + parseInt(quantity, 10);

      // Save the updated medicine to the database
      await existingMedicine.save();
    }

    // Save the return entry
    await newReturn.save();

    // Send success response
    return res.status(200).json({ message: "Medicine returned successfully!", newReturn });
  } catch (error) {
    console.error("Error in returnMedicine:", error);
    await slackLogger("Error in returnMedicine", error.message, error, req);
    return res.status(500).json({ message: "An error occurred while processing the return." });
  }
};

export const deleteReturnMedicine = async (req, res) => {
  try {
    const returnEntry = await returnMedModel.findByIdAndDelete(req.params.id);
    if (!returnEntry) {
      return res.status(404).json({ message: "Return entry not found." });
    } else {
      for (const medicine of returnEntry.medicines) {
        const existingMedicine = await medicineModal.findById(medicine.medicineId);
        if (!existingMedicine) {
          console.warn(`Medicine with ID ${medicine.medicineId} not found, skipping...`);
          continue;
        }
        existingMedicine.stockQuantity = parseInt(existingMedicine.stockQuantity, 10) - parseInt(medicine.quantity, 10);
        await existingMedicine.save();
      }
    }
    res.status(200).json({ message: "Return entry deleted.", deleted: returnEntry });
  } catch (error) {
    console.log("Error in deleteReturn", error);
    await slackLogger("Error in deleteReturn", error.message, error, req);
    return res.status(500).json({ message: error });
  }
}

export const updateReturnMedicine = async (req, res) => {
  try {
    const existingReturn = await returnMedModel.findById(req.params.id);
    if (!existingReturn) {
      return res.status(404).json({ message: "Return entry not found." });
    }
    const returnEntry = await returnMedModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!returnEntry) {
      return res.status(404).json({ message: "Return entry not found." });
    } else {
      for (const medicine of existingReturn.medicines) {
        const existingMedicine = await medicineModal.findById(medicine.medicineId);
        if (!existingMedicine) {
          console.warn(`Medicine with ID ${medicine.medicineId} not found, skipping...`);
          continue;
        }
        existingMedicine.stockQuantity = parseInt(existingMedicine.stockQuantity, 10) - parseInt(medicine.quantity, 10);
        await existingMedicine.save();
      }
      for (const medicine of req.body.medicines) {
        const existingMedicine = await medicineModal.findById(medicine.medicineId);
        if (!existingMedicine) {
          console.warn(`Medicine with ID ${medicine.medicineId} not found, skipping...`);
          continue;
        }
        existingMedicine.stockQuantity = parseInt(existingMedicine.stockQuantity, 10) + parseInt(medicine.quantity, 10);
        await existingMedicine.save();
      }
    }
    return res.status(200).json({ message: "Return entry updated.", returnEntry });
  } catch (error) {
    console.log("Error in updateReturn", error);
    await slackLogger("Error in updateReturn", error.message, error, req);
    return res.status(500).json({ message: error });
  }
}

export const getReturnMedicine = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate presence of startDate and endDate
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide both startDate and endDate in query parameters.",
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

    // Query parameters
    const query = {
      returnDate: { $gte: start, $lte: end },
    };

    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await returnMedModel.countDocuments();
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

    // Fetch returns with sorting, pagination applied
    const items = await returnMedModel
      .find(query)
      .sort({ _id: -1 }) // Sort by _id in ascending order; use -1 for descending
      .skip(skip)
      .limit(pageSize);


    res.status(200).json({
      message: "Returns fetched successfully!",
      items,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error in getReturns", error);
    await slackLogger("Error in getReturns", error.message, error, req);
    return res.status(500).json({ message: error });
  }
};

export const getAllBills = async (req, res) => {
  try {
    const ipdBills = await ipdBillModal.find();
    const opdBills = await opdBillModal.find();

    // Combine both arrays
    const returnObj = [...ipdBills, ...opdBills];

    // Filter the objects where `item` array contains an object with `itemCategory: "pharmacy"`
    const filteredBills = returnObj.filter(
      (bill) =>
        bill.item && bill.item.some((item) => item.itemCategory === "pharmacy")
    );

    const sortedBills = filteredBills.sort((a, b) => b.date - a.date);

    return res
      .status(200)
      .json({ message: "Bills retrieved successfully!", item: sortedBills });
  } catch (error) {
    console.error("Error fetching bills:", error);
    await slackLogger("Error fetching bills:", error.message, error, req);
    return res.status(500).json({ message: error.message });
  }
};

export const getMedStats = async (req, res) => {
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
      "item.itemCategory": "pharmacy",
    };

    // Fetch all IPD and OPD bills with relevant items
    const [ipdBills, opdBills, pharmacyBills] = await Promise.all([
      ipdBillModal.find(query),
      opdBillModal.find(query),
      pharmacyBillModal.find({
        date: {
          $gte: start,
          $lte: end,
        }
      }),
    ]);

    // Combine and filter pharmacy items
    const medItems = [...ipdBills, ...opdBills, ...pharmacyBills]
      .flatMap((bill) => bill.item)
      .filter((item) => item.itemCategory === "pharmacy");

    // Extract unique medicine IDs
    const medicineIds = [...new Set(medItems.map((item) => item.itemId))];

    if (medicineIds.length === 0) {
      return res.status(200).json({
        message: "No medicine stats available.",
        totalItem: 0,
        stats: [],
        grandTotal: "0.00",
      });
    }

    const supplierBills = await supplierBillModal.find({
      billDate: {
        $gte: start,
        $lte: end,
      },
    });

    // console.log("supplierBills: ", supplierBills);

    // console.log("supplierBills: ", supplierBills.flatMap((bill) => bill.medicines));

    const supplierItemsMap = Object.fromEntries(
      supplierBills.flatMap((bill) => bill.medicines).map((item) => [item.medicineId, item])
    );

    console.log("supplierItemsMap: ", supplierItemsMap);

    // Fetch medicine stock and map data for quick lookup
    const medicineStock = await medicineModal.find({
      _id: { $in: medicineIds },
    });
    const stockMap = Object.fromEntries(
      medicineStock.map((med) => [med._id, med.stockQuantity])
    );
    const priceMap = Object.fromEntries(
      medicineStock.map((med) => [med._id, med.pricePerUnit])
    );
    const expiryMap = Object.fromEntries(
      medicineStock.map((med) => [med._id, med.expiryDate])
    )

    // Compute stats as an array of objects
    const statsArray = medItems.reduce((acc, cur) => {
      const name = cur.itemName.split("(")[0].trim();
      const existing = acc.find((item) => item.name === name);

      if (existing) {
        existing.quantity += cur.quantity;
        existing.totalPrice = (existing.quantity * existing.price).toFixed(2);
      } else {
        acc.push({
          itemId: cur.itemId,
          name,
          expiryDate: expiryMap[cur.itemId] || "N/A",
          quantity: cur.quantity,
          stockQuantity: stockMap[cur.itemId] || 0,
          price: priceMap[cur.itemId] || 0,
          totalPrice: (cur.quantity * (priceMap[cur.itemId] || 0)).toFixed(2),
          buyPrice: supplierItemsMap[cur.itemId]?.buyPrice || 0,
        });
      }
      return acc;
    }, []);

    // Calculate grand total
    const grandTotal = statsArray.reduce(
      (acc, cur) => acc + parseFloat(cur.totalPrice),
      0
    );

    return res.status(200).json({
      message: "Medicine stats fetched.",
      totalItem: statsArray.length,
      stats: statsArray,
      grandTotal: grandTotal.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching medicine stats:", error);
    await slackLogger(
      "Error fetching medicine stats:",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: error.message });
  }
};

export const getMedStatsById = async (req, res) => {
  try {
    const { medId } = req.params;

    // Find the medicine in the database
    const medicine = await medicineModal.findById(medId);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found." });
    }

    // Fetch and process IPD bills
    const ipdStats = await ipdBillModal.find({
      "item.itemId": medId,
    })
      .lean()
      .then((bills) =>
        bills.flatMap((bill) =>
          bill.item
            .filter((item) => item.itemId.toString() === medId)
            .map((item) => ({
              ...item,
              billType: "IPD",
              billNumber: bill.billNumber, // Add billNumber from bill
            }))
        )
      );

    // Fetch and process OPD bills
    const opdStats = await opdBillModal.find({
      "item.itemId": medId,
    })
      .lean()
      .then((bills) =>
        bills.flatMap((bill) =>
          bill.item
            .filter((item) => item.itemId.toString() === medId)
            .map((item) => ({
              ...item,
              billType: "OPD",
              billNumber: bill.billNumber, // Add billNumber from bill
            }))
        )
      );

    // Fetch and process Pharmacy bills
    const pharmacyStats = await pharmacyBillModal.find({
      "item.itemId": medId,
    })
      .lean()
      .then((bills) =>
        bills.flatMap((bill) =>
          bill.item
            .filter((item) => item.itemId.toString() === medId)
            .map((item) => ({
              ...item,
              billType: "Pharmacy",
              billNumber: bill.billNumber, // Add billNumber from bill
            }))
        )
      );

    // Combine stats from all sources
    const stats = [...ipdStats, ...opdStats, ...pharmacyStats];

    return res.status(200).json({
      success: true,
      message: "Medicine fetched.",
      stats,
    });
  } catch (error) {
    console.error("Error fetching medicine stats by ID:", error);
    await slackLogger(
      "Error fetching medicine stats by ID:",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: error.message });
  }
};

// ===========-=-=-=-=-=-=- Pharmacy Billing -=-=-=-=-=-=-=-================ //

async function generateSixDigitPharmacy() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await pharmacyBillModal.findOne({
      billNumber: randomNumber,
    });
    if (!existingBill) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const submitPharmacyBill = async (req, res) => {
  try {
    console.log("Pharmacy bill data received:", req.body);
    const date = new Date();
    const time = date.toLocaleTimeString();
    console.log("Time:", time);
    req.body.time = time;

    const newBill = new pharmacyBillModal(req.body);

    // Generate and assign a unique bill number
    newBill.billNumber = await generateSixDigitPharmacy();

    // Validate pharmacy items and update stock
    for (const item of newBill.item) {
      if (item.itemId) {
        const medicine = await medicineModal.findById(item.itemId);
        if (!medicine) {
          return res.status(404).json({
            message: `Medicine with ID ${item.itemId} not found.`,
          });
        }

        // Validate stock availability and update stock
        const stockQuantity = parseInt(medicine.stockQuantity, 10) || 0;
        const itemQuantity = parseInt(item.quantity, 10) || 0;

        // Allow negative quantity for returns and handle stock accordingly
        if (itemQuantity > 0 && stockQuantity < itemQuantity) {
          return res.status(400).json({
            message: `Not enough stock available for ${medicine.name}. Available: ${stockQuantity}, Requested: ${itemQuantity}`,
          });
        }

        // Adjust stock for sales or returns
        medicine.stockQuantity = stockQuantity - itemQuantity; // Deduct for sales, add for returns
        await medicine.save();
      } else {
        return res.status(400).json({
          message: "Item ID is required for all items.",
        });
      }
    }

    // Save the pharmacy bill
    await newBill.save();

    res.status(200).json({
      message: "Pharmacy bill submitted successfully.",
      bill: newBill,
    });
    console.log("Pharmacy bill submitted successfully.");
  } catch (error) {
    console.error("Error in submitPharmacyBill:", error);
    await slackLogger(
      "Pharmacy Bill Submission Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const getNewPharmacyBills = async (req, res) => {
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
    let countDocuments = await pharmacyBillModal.countDocuments(query);
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
    const bills = await pharmacyBillModal
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();


    return res.status(200).json({
      message: "Bills Fetched Successfully!",
      items: bills, // Processed bills with grouped items
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.error("Error in getting bills: ", error);
    await slackLogger("Pharmacy Bills Fetch Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePharmacyBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await pharmacyBillModal.findByIdAndDelete(billId);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    bill.item.forEach(async (item) => {
      if (item.itemCategory.toLowerCase() === "pharmacy" && item.itemId) {
        if (item.itemId) {
          const medicine = await medicineModal.findById(item.itemId);
          medicine.stockQuantity =
            parseInt(medicine.stockQuantity) + parseInt(item.quantity);
          await medicine.save();
        }
      }
    });

    res.status(200).json({ message: "Bill deleted successfully", bill });
  } catch (error) {
    console.error("Error deleting bill: ", error);
    await slackLogger(
      "Pharmacy Bill Deletion Error",
      error.message,
      error,
      req
    );
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePharmacyBill = async (req, res) => {
  try {
    const { billId } = req.params;
    console.log("updatePharmacyBill: ", req.body);

    // Find the old bill
    const oldBill = await pharmacyBillModal.findById(billId);
    if (!oldBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    // Update the bill
    const updatedBill = await pharmacyBillModal.findByIdAndUpdate(
      billId,
      req.body,
      {
        new: true,
      }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: "Failed to update bill" });
    }

    // Process each item in the updated bill
    await Promise.all(
      updatedBill.item.map(async (item) => {
        // Pharmacy item stock adjustment
        if (item.itemCategory.toLowerCase() === "pharmacy" && item.itemId) {
          const oldItem = oldBill.item.find(
            (itemObj) => itemObj.itemId === item.itemId
          );
          const medicine = await medicineModal.findById(item.itemId);
          if (medicine) {
            medicine.stockQuantity =
              parseInt(medicine.stockQuantity) -
              parseInt(oldItem?.quantity || 0) +
              parseInt(item.quantity || 0);
            await medicine.save();
          }
        } else {
          return res.status(400).json({
            message: "Invalid item category or item ID",
          });
        }
      })
    );

    res
      .status(200)
      .json({ message: "Bill updated successfully", bill: updatedBill });
  } catch (error) {
    console.error("Error updating bill: ", error);
    await slackLogger("Pharmacy Bill Update Error", error.message, error, req);
    res.status(500).json({ message: "Server error" });
  }
};
