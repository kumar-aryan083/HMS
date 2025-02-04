import { slackLogger } from "../middleware/webHook.js";
import storeCategoryModal from "../models/store/storeCategory.modal.js";
import storeItemModel from "../models/store/storeItem.model.js";
import storePurchaseModal from "../models/store/storePurchase.modal.js";
import storeReceiverModal from "../models/store/storeReceiver.modal.js";
import storeSupplyModal from "../models/store/storeSupply.modal.js";
import storeVendorModal from "../models/store/storeVendor.modal.js";
import storeVendorBillModal from "../models/store/storeVendorBill.modal.js";

export const addCategory = async (req, res) => {
  try {
    // console.log(req.body);
    const existingCategory = await storeCategoryModal.findOne({
      name: req.body.name,
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists.",
      });
    }
    const newCategory = new storeCategoryModal(req.body);
    await newCategory.save();
    return res.status(200).json({
      success: true,
      message: "New category added.",
      newCategory,
    });
  } catch (error) {
    console.log("Error adding category:", error);
    await slackLogger("Error adding category:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    // console.log(req.body);
    const categories = await storeCategoryModal.find().sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched.",
      categories,
    });
  } catch (error) {
    console.log("Error fetching categories:", error);
    await slackLogger("Error fetching categories:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const editCategory = async (req, res) => {
  try {
    // console.log(req.body);
    const { cId } = req.params;

    const udpatedCategory = await storeCategoryModal.findByIdAndUpdate(
      cId,
      req.body,
      {
        new: true,
      }
    );

    if (!udpatedCategory) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated.",
      udpatedCategory,
    });
  } catch (error) {
    console.log("Error editing category:", error);
    await slackLogger("Error editing category:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    // console.log(req.body);
    const { cId } = req.params;
    const deleted = await storeCategoryModal.findByIdAndDelete(cId);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Category deleted.",
        deleted,
      });
    }
  } catch (error) {
    console.log("Error deleting category:", error);
    await slackLogger("Error deleting category:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addReceiver = async (req, res) => {
  try {
    // Check for an existing receiver with the same name or phone
    const existingReceiver = await storeReceiverModal.findOne({
      phone: req.body.phone,
      name: req.body.name,
    });

    if (existingReceiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver with this name or phone already exists.",
      });
    }

    // Create and save the new receiver
    const newReceiver = new storeReceiverModal(req.body);
    await newReceiver.save();

    // Populate the department field
    const populatedReceiver = await storeReceiverModal
      .findById(newReceiver._id)
      .populate("department");

    return res.status(200).json({
      success: true,
      message: "New receiver added.",
      receiver: populatedReceiver,
    });
  } catch (error) {
    console.error("Error adding receiver:", error);
    await slackLogger("Error adding receiver:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getReceivers = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await storeReceiverModal.countDocuments();
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
    const receivers = await storeReceiverModal
      .find()
      .populate("department")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Receivers fetched.",
      items: receivers,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error fetching receivers:", error);
    await slackLogger("Error fetching receivers:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const editReceiver = async (req, res) => {
  try {
    // console.log(req.body);
    const { rId } = req.params;

    const udpatedReceiver = await storeReceiverModal
      .findByIdAndUpdate(rId, req.body, {
        new: true,
      })
      .populate("department");

    if (!udpatedReceiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Receiver updated.",
      udpatedReceiver,
    });
  } catch (error) {
    console.log("Error editing receiver:", error);
    await slackLogger("Error editing receiver:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteReceiver = async (req, res) => {
  try {
    // console.log(req.body);
    const { rId } = req.params;
    const deleted = await storeReceiverModal.findByIdAndDelete(rId);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Receiver not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Receiver deleted.",
        deleted,
      });
    }
  } catch (error) {
    console.log("Error deleting receiver:", error);
    await slackLogger("Error deleting receiver:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addVendor = async (req, res) => {
  try {
    const existingVendor = await storeVendorModal.findOne({
      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson,
    });
    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor with this name already exists.",
      });
    } else {
      const newVendor = new storeVendorModal(req.body);
      await newVendor.save();
      return res.status(200).json({
        success: true,
        message: "New vendor added.",
        newVendor,
      });
    }
  } catch (error) {
    console.log("Error adding vendor:", error);
    await slackLogger("Error adding vendor:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getVendors = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await storeVendorModal.countDocuments();
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
    const vendors = await storeVendorModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Vendors fetched.",
      items: vendors,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error fetching vendors:", error);
    await slackLogger("Error fetching vendors:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const searchVendors = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }
    const regex = new RegExp(search, "i");
    const vendors = await storeVendorModal.find({
      $or: [
        { companyName: { $regex: regex } },
        { contactPerson: { $regex: regex } },
        { contactNo1: { $regex: regex } },
      ],
    });
    return res.status(200).json({
      success: true,
      message: "Vendors fetched.",
      vendors,
    });
  } catch (error) {
    console.log("Error searching vendors:", error);
    await slackLogger("Error searching vendors:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const editVendor = async (req, res) => {
  try {
    const { vId } = req.params;
    const udpatedVendor = await storeVendorModal.findByIdAndUpdate(
      vId,
      req.body,
      {
        new: true,
      }
    );
    if (!udpatedVendor) {
      return res.status(400).json({
        success: false,
        message: "Vendor not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Vendor updated.",
        udpatedVendor,
      });
    }
  } catch (error) {
    console.log("Error editing vendor:", error);
    await slackLogger("Error editing vendor:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteVendor = async (req, res) => {
  try {
    const { vId } = req.params;
    const deleted = await storeVendorModal.findByIdAndDelete(vId);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Vendor not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Vendor deleted.",
        deleted,
      });
    }
  } catch (error) {
    console.log("Error deleting vendor:", error);
    await slackLogger("Error deleting vendor:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addStoreItem = async (req, res) => {
  try {
    // console.log(req.body);
    const existingStoreItem = await storeItemModel.findOne({
      name: req.body.name,
    });
    if (existingStoreItem) {
      return res.status(400).json({
        success: false,
        message: "Store item with this name already exists.",
      });
    }
    const newStoreItem = new storeItemModel(req.body);
    await newStoreItem.save();

    return res.status(200).json({
      success: true,
      message: "New Store Item added.",
      newStoreItem,
    });
  } catch (error) {
    console.log("Error adding store item:", error);
    await slackLogger("Error adding store item:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getStoreItems = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await storeItemModel.countDocuments();
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
    const storeItems = await storeItemModel
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Store Items fetched.",
      storeItems,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error fetching store items:", error);
    await slackLogger("Error fetching store items:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const editStoreItem = async (req, res) => {
  try {
    // console.log(req.body);
    const { sId } = req.params;

    const udpatedStoreItem = await storeItemModel.findByIdAndUpdate(
      sId,
      req.body,
      {
        new: true,
      }
    );

    if (!udpatedStoreItem) {
      return res.status(400).json({
        success: false,
        message: "Store item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store Item updated.",
      udpatedStoreItem,
    });
  } catch (error) {
    console.log("Error editing store item:", error);
    await slackLogger("Error editing store item:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
export const deleteStoreItem = async (req, res) => {
  try {
    // console.log(req.body);
    const { sId } = req.params;

    const storeItem = await storeItemModel.findById(sId);

    if (!storeItem) {
      return res.status(400).json({
        success: false,
        message: "Store item not found",
      });
    }

    await storeItemModel.findByIdAndDelete(sId);

    return res.status(200).json({
      success: true,
      message: "Store Item deleted.",
      storeItem,
    });
  } catch (error) {
    console.log("Error deleting store item:", error);
    await slackLogger("Error deleting store item:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const searchStoreItems = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Search query is required.",
      });
    }
    const regex = new RegExp(search, "i");
    const storeItems = await storeItemModel.find({
      $or: [{ name: { $regex: regex } }, { code: { $regex: regex } }],
    });
    return res.status(200).json({
      success: true,
      message: "Store Items fetched.",
      storeItems,
    });
  } catch (error) {
    console.log("Error searching store items:", error);
    await slackLogger(
      "Error searching store items:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

async function generateSixDigitVoucher() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingReport = await storeSupplyModal.findOne({
      voucherNo: randomNumber,
    });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const addSupply = async (req, res) => {
  try {
    const { items } = req.body;

    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided.",
      });
    }

    // Extract item IDs
    const itemIds = items.map((item) => item.itemId);

    // Find all items in a single query
    const existingItems = await storeItemModel.find({ _id: { $in: itemIds } });

    // Validate all items exist
    if (existingItems.length !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more items not found.",
      });
    }

    // Create a map for quick access to existing items
    const itemMap = existingItems.reduce((map, item) => {
      map[item._id.toString()] = item;
      return map;
    }, {});

    // Validate stock and update quantities
    for (const item of items) {
      const itemFound = itemMap[item.itemId];

      if (!itemFound) {
        return res.status(400).json({
          success: false,
          message: `Item not found. ID: ${item.itemId}`,
        });
      }

      if (parseInt(itemFound.stockQuantity) < parseInt(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Quantity exceeds available stock. Name: ${itemFound.name}`,
        });
      }

      // Update stock quantity
      itemFound.stockQuantity = (
        parseInt(itemFound.stockQuantity) - parseInt(item.quantity)
      ).toString();
    }

    // Save updated items in bulk
    await Promise.all(existingItems.map((item) => item.save()));

    // Generate voucher number
    req.body.voucherNo = await generateSixDigitVoucher();

    // Create and save the new supply
    const newSupply = new storeSupplyModal(req.body);
    await newSupply.save();

    const populatedSupply = await storeSupplyModal
      .findById(newSupply._id)
      .populate("receiverId");

    return res.status(200).json({
      success: true,
      message: "New supply added.",
      newSupply: populatedSupply,
    });
  } catch (error) {
    console.error("Error adding supply:", error);
    await slackLogger("Error adding supply:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateSupply = async (req, res) => {
  try {
    const supplyId = req.params.sId;
    const { items } = req.body;
    // Validate supplyId
    if (!supplyId) {
      return res.status(400).json({
        success: false,
        message: "Supply ID is required.",
      });
    }
    // Validate items array
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No items provided.",
      });
    }
    // Find the existing supply record
    const existingSupply = await storeSupplyModal
      .findById(supplyId)
      .populate("receiverId");
    if (!existingSupply) {
      return res.status(404).json({
        success: false,
        message: "Supply record not found.",
      });
    }
    // Extract current item IDs and new item IDs
    const currentItemsMap = new Map(
      existingSupply.items.map((item) => [
        item.itemId.toString(),
        item.quantity,
      ])
    );
    const newItemsMap = new Map(
      items.map((item) => [item.itemId.toString(), item.quantity])
    );
    // Get all item IDs involved (current and new)
    const allItemIds = [
      ...new Set([...currentItemsMap.keys(), ...newItemsMap.keys()]),
    ];

    // Fetch all items involved from the database
    const allItems = await storeItemModel.find({ _id: { $in: allItemIds } });

    // Create a map for quick access to items
    const itemMap = allItems.reduce((map, item) => {
      map[item._id.toString()] = item;
      return map;
    }, {});
    // Ensure all item IDs exist in the database
    for (const itemId of allItemIds) {
      if (!itemMap[itemId]) {
        return res.status(400).json({
          success: false,
          message: `Item with ID ${itemId} not found.`,
        });
      }
    }
    // Revert stock for removed items
    for (const [itemId, quantity] of currentItemsMap) {
      if (!newItemsMap.has(itemId)) {
        const item = itemMap[itemId];
        item.stockQuantity = (
          parseInt(item.stockQuantity) + parseInt(quantity)
        ).toString();
      }
    }
    // Validate and update stock for new and existing items
    for (const [itemId, quantity] of newItemsMap) {
      const item = itemMap[itemId];
      const currentQuantity = currentItemsMap.get(itemId) || 0;
      // Adjust stock based on the difference
      const stockDifference = parseInt(currentQuantity) - parseInt(quantity);
      if (stockDifference > 0) {
        // Increase stock if quantity is reduced
        item.stockQuantity = (
          parseInt(item.stockQuantity) + stockDifference
        ).toString();
      } else if (stockDifference < 0) {
        // Validate and decrease stock if quantity is increased
        if (parseInt(item.stockQuantity) < Math.abs(stockDifference)) {
          return res.status(400).json({
            success: false,
            message: `Quantity exceeds available stock for item: ${item.name}`,
          });
        }
        item.stockQuantity = (
          parseInt(item.stockQuantity) + stockDifference
        ).toString();
      }
    }
    // Save updated item stocks in bulk
    await Promise.all(allItems.map((item) => item.save()));
    // Update the supply record
    existingSupply.items = items;
    existingSupply.status = req.body.status || existingSupply.status;
    existingSupply.receiverId =
      req.body.receiverId || existingSupply.receiverId;
    existingSupply.department =
      req.body.department || existingSupply.department;
    existingSupply.departmentName =
      req.body.departmentName || existingSupply.departmentName;
    existingSupply.phone = req.body.phone || existingSupply.phone;
    await existingSupply.save();

    const existingSupply2 = await storeSupplyModal
      .findById(supplyId)
      .populate("receiverId");

    return res.status(200).json({
      success: true,
      message: "Supply updated successfully.",
      updatedSupply: existingSupply2,
    });
  } catch (error) {
    console.error("Error updating supply:", error);
    await slackLogger("Error updating supply:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getSupplies = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await storeSupplyModal.countDocuments();
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
    const supplies = await storeSupplyModal
      .find()
      .populate("receiverId")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Supplies fetched.",
      supplies,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error fetching supplies:", error);
    await slackLogger("Error fetching supplies:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteSupply = async (req, res) => {
  try {
    const { sId } = req.params;

    // Fetch the supply to be deleted
    const existingSupply = await storeSupplyModal.findById(sId);

    // Check if the supply exists
    if (!existingSupply) {
      return res.status(404).json({
        success: false,
        message: "Supply not found.",
      });
    }

    // Extract items from the supply
    const { items } = existingSupply;

    if (items && items.length > 0) {
      // Map item IDs to update stock quantities in bulk
      const itemIds = items.map((item) => item.itemId);

      // Find all items associated with the supply
      const existingItems = await storeItemModel.find({
        _id: { $in: itemIds },
      });

      // Create a map for quick access
      const itemMap = existingItems.reduce((map, item) => {
        map[item._id.toString()] = item;
        return map;
      }, {});

      // Increment stock quantities
      for (const supplyItem of items) {
        const item = itemMap[supplyItem.itemId];

        if (item) {
          item.stockQuantity = (
            parseInt(item.stockQuantity) + parseInt(supplyItem.quantity)
          ).toString();
          await item.save();
        }
      }
    }

    // Delete the supply
    const deleted = await storeSupplyModal.findByIdAndDelete(sId);

    return res.status(200).json({
      success: true,
      message: "Supply deleted successfully, and stock quantities updated.",
      deleted,
    });
  } catch (error) {
    console.error("Error deleting supply:", error);
    await slackLogger("Error deleting supply:", error.message, error, req);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getSuppliesByDate = async (req, res) => {
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

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

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

    const supplies = await storeSupplyModal.find({
      createdAt: {
        $gte: start,
        $lt: end,
      },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Supplies fetched.",
      supplies,
    });
  } catch (error) {
    console.error("Error fetching supplies by date:", error);
    await slackLogger(
      "Error fetching supplies by date:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

async function generateSixDigitPurchase() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingReport = await storePurchaseModal.findOne({
      purchaseNo: randomNumber,
    });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const addPurchaseOrder = async (req, res) => {
  try {
    req.body.purchaseNo = await generateSixDigitPurchase();
    const body = req.body;
    const newItem = new storePurchaseModal(body);
    await newItem.save();
    return res.status(200).json({
      success: true,
      message: "New purchase order added.",
      newItem,
    });
  } catch (error) {
    console.error("Error adding purchase order:", error);
    await slackLogger(
      "Error adding purchase order:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getPurchaseOrders = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await storePurchaseModal.countDocuments();
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
    const purchaseOrders = await storePurchaseModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Purchase orders fetched.",
      items: purchaseOrders,
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.error("Error fetching purchase orders:", error);
    await slackLogger(
      "Error fetching purchase orders:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const editPurchaseOrder = async (req, res) => {
  try {
    const { pId } = req.params;
    const udpatedPurchaseOrder = await storePurchaseModal.findByIdAndUpdate(
      pId,
      req.body,
      {
        new: true,
      }
    );

    if (!udpatedPurchaseOrder) {
      return res.status(400).json({
        success: false,
        message: "Purchase order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase order updated.",
      udpatedPurchaseOrder,
    });
  } catch (error) {
    console.error("Error editing purchase order:", error);
    await slackLogger(
      "Error editing purchase order:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const { pId } = req.params;
    const deleted = await storePurchaseModal.findByIdAndDelete(pId);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Purchase order not found",
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "Purchase order deleted.",
        deleted,
      });
    }
  } catch (error) {
    console.error("Error deleting purchase order:", error);
    await slackLogger(
      "Error deleting purchase order:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addStoreVendorBill = async (req, res) => {
  try {
    const body = req.body;
    const newItem = new storeVendorBillModal(body);

    const existingPurchaseOrder = await storePurchaseModal.findOne({
      purchaseNo: body.purchaseOrderNumber,
    });

    if (!existingPurchaseOrder) {
      return res.status(400).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    for (const item of body.items) {
      const storeItem = await storeItemModel.findById(item.itemId);
      if (!storeItem) {
        return res.status(400).json({
          success: false,
          message: `Item not found. ID: ${item.itemId}`,
        });
      }
      storeItem.stockQuantity = (
        parseInt(storeItem.stockQuantity) + parseInt(item.quantity)
      ).toString();
      await storeItem.save();
    }
    await newItem.save();
    return res.status(200).json({
      success: true,
      message: "New store vendor bill added.",
      newItem,
    });
  } catch (error) {
    console.error("Error adding store vendor bill:", error);
    await slackLogger(
      "Error adding store vendor bill:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteStoreVendorBill = async (req, res) => {
  try {
    const { sId } = req.params;
    const deleted = await storeVendorBillModal.findByIdAndDelete(sId);
    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: "Store vendor bill not found",
      });
    } else {
      for (const item of deleted.items) {
        const storeItem = await storeItemModel.findById(item.itemId);
        if (storeItem) {
          storeItem.stockQuantity = (
            parseInt(storeItem.stockQuantity) - parseInt(item.quantity)
          ).toString();
          await storeItem.save();
        }
      }
      return res.status(200).json({
        success: true,
        message: "Store vendor bill deleted.",
        deleted,
      });
    }
  } catch (error) {
    console.error("Error deleting store vendor bill:", error);
    await slackLogger(
      "Error deleting store vendor bill:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getStoreVendorBills = async (req, res) => {
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
    let countDocuments = await storeVendorBillModal.countDocuments(query);
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
    const totalAmount = (await storeVendorBillModal.find()).reduce(
      (acc, curr) => acc + parseFloat(curr.paymentInfo.paymentAmount),
      0
    );
    console.log(totalAmount);
    const storeVendorBills = await storeVendorBillModal
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json({
      success: true,
      message: "Store vendor bills fetched.",
      storeVendorBills,
      totalPages,
      totalItems: countDocuments,
      totalAmount,
    });
  } catch (error) {
    console.error("Error fetching store vendor bills:", error);
    await slackLogger(
      "Error fetching store vendor bills:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateStoreVendorBill = async (req, res) => {
  try {
    const { sId } = req.params;
    const body = req.body;

    const existingPurchaseOrder = await storePurchaseModal.findOne({
      purchaseNo: body.purchaseOrderNumber,
    });

    if (!existingPurchaseOrder) {
      return res.status(400).json({
        success: false,
        message: "Purchase order not found.",
      });
    }

    // Validate the existence of the bill
    const existingBill = await storeVendorBillModal.findById(sId);
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: `Store vendor bill not found. ID: ${sId}`,
      });
    }

    // Revert stock quantities for items in the existing bill
    for (const item of existingBill.items) {
      const storeItem = await storeItemModel.findById(item.itemId);
      if (!storeItem) {
        return res.status(400).json({
          success: false,
          message: `Item not found. ID: ${item.itemId}`,
        });
      }
      storeItem.stockQuantity = (
        parseInt(storeItem.stockQuantity) - parseInt(item.quantity)
      ).toString();
      await storeItem.save();
    }

    // Apply stock changes for updated items
    for (const item of body.items) {
      const storeItem = await storeItemModel.findById(item.itemId);
      if (!storeItem) {
        return res.status(400).json({
          success: false,
          message: `Item not found. ID: ${item.itemId}`,
        });
      }
      storeItem.stockQuantity = (
        parseInt(storeItem.stockQuantity) + parseInt(item.quantity)
      ).toString();
      await storeItem.save();
    }

    // Update the bill with the new data
    existingBill.vendorId = body.vendorId || existingBill.vendorId;
    existingBill.vendorName = body.vendorName || existingBill.vendorName;
    existingBill.date = body.date || existingBill.date;
    existingBill.purchaseOrderNumber =
      body.purchaseOrderNumber || existingBill.purchaseOrderNumber;
    existingBill.purchaseOrderId =
      body.purchaseOrderId || existingBill.purchaseOrderId;
    existingBill.date = body.date || existingBill.date;
    existingBill.items = body.items; // Overwrite the items array
    existingBill.paymentInfo = body.paymentInfo || existingBill.paymentInfo;
    await existingBill.save();

    return res.status(200).json({
      success: true,
      message: "Store vendor bill updated successfully.",
      updatedBill: existingBill,
    });
  } catch (error) {
    console.error("Error updating store vendor bill:", error);
    await slackLogger(
      "Error updating store vendor bill:",
      error.message,
      error,
      req
    );
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
