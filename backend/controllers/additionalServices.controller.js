import { slackLogger } from "../middleware/webHook.js";
import additionalServiceBillModal from "../models/additionalServiceBill.modal.js";
import additionalServicesModal from "../models/additionalServices.modal.js";

export const addAdditionalService = async (req, res) => {
  try {
    const newAdditionalService = new additionalServicesModal(req.body);
    await newAdditionalService.save();
    return res.status(200).json({
      message: "Additional service added successfully",
      data: newAdditionalService,
    });
  } catch (error) {
    console.log("Error while adding additional service", error);
    await slackLogger(
      "Error while adding additional service",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAdditionalService = async (req, res) => {
  try {
    const additionalService = await additionalServicesModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!additionalService) {
      return res.status(404).json({
        message: "Additional service not found",
        data: additionalService,
      });
    } else {
      return res.status(200).json({
        message: "Additional service updated successfully",
        data: additionalService,
      });
    }
  } catch (error) {
    console.log("Error while updating additional service", error);
    await slackLogger(
      "Error while updating additional service",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAdditionalService = async (req, res) => {
  try {
    const additionalService = await additionalServicesModal.findByIdAndDelete(
      req.params.id
    );
    if (!additionalService) {
      return res.status(404).json({
        message: "Additional service not found",
        data: additionalService,
      });
    } else {
      return res.status(200).json({
        message: "Additional service deleted successfully",
        data: additionalService,
      });
    }
  } catch (error) {
    console.log("Error while deleting additional service", error);
    await slackLogger(
      "Error while deleting additional service",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdditionalServices = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await additionalServicesModal.countDocuments();
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
    const bills = await additionalServicesModal
      .find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    return res.status(200).json({
      message: "Additional Items Fetched Successfully!",
      items: bills, // Processed bills with grouped items
      totalPages,
      totalItems: countDocuments,
    });
  } catch (error) {
    console.log("Error while fetching additional services", error);
    await slackLogger(
      "Error while fetching additional services",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchAdditionalServices = async (req, res) => {
  try {
    const { search } = req.query;
    const regex = new RegExp(search, "i");
    const additionalServices = await additionalServicesModal.find({
      name: { $regex: regex },
    });
    return res.status(200).json({
      message: "Additional Services Fetched Successfully!",
      items: additionalServices,
    });
  } catch (error) {
    console.log("Error while searching additional services", error);
    await slackLogger(
      "Error while searching additional services",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function generateSixDigitAdditionalServiceBill() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await additionalServiceBillModal.findOne({
      billNumber: randomNumber,
    });
    if (!existingBill) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const addAdditionalServiceBill = async (req, res) => {
  try {
    console.log("additional service bill data received:", req.body);
    const date = new Date();
    const time = date.toLocaleTimeString();
    console.log("Time:", time);
    req.body.time = time;

    const newBill = new additionalServiceBillModal(req.body);

    // Generate and assign a unique bill number
    newBill.billNumber = await generateSixDigitAdditionalServiceBill();

    // Validate pharmacy items and update stock
    for (const item of newBill.item) {
      if (item.itemId) {
        const additionalService = await additionalServicesModal.findById(
          item.itemId
        );
        if (!additionalService) {
          return res.status(404).json({
            message: `Additional Services with ID ${item.itemId} not found.`,
          });
        }
      } else {
        return res.status(400).json({
          message: "Item ID is required for all items.",
        });
      }
    }

    // Save the pharmacy bill
    await newBill.save();

    res.status(200).json({
      message: "additional service bill submitted successfully.",
      bill: newBill,
    });
    console.log("additional service bill submitted successfully.");
  } catch (error) {
    console.log("Error while adding additional service bill", error);
    await slackLogger(
      "Error while adding additional service bill",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAdditionalServiceBill = async (req, res) => {
  try {
    const additionalServiceBill =
      await additionalServiceBillModal.findByIdAndDelete(req.params.id);
    if (!additionalServiceBill) {
      return res.status(404).json({
        message: "Additional service bill not found",
        data: additionalServiceBill,
      });
    } else {
      return res.status(200).json({
        message: "Additional service bill deleted successfully",
        data: additionalServiceBill,
      });
    }
  } catch (error) {
    console.log("Error while deleting additional service bill", error);
    await slackLogger(
      "Error while deleting additional service bill",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const editAdditionalServiceBill = async (req, res) => {
  try {
    const additionalServiceBill =
      await additionalServiceBillModal.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    for (const item of additionalServiceBill.item) {
      if (item.itemId) {
        const additionalService = await additionalServicesModal.findById(
          item.itemId
        );
        if (!additionalService) {
          return res.status(404).json({
            message: `Additional Services with ID ${item.itemId} not found.`,
          });
        }
      } else {
        return res.status(400).json({
          message: "Item ID is required for all items.",
        });
      }
    }

    if (!additionalServiceBill) {
      return res.status(404).json({
        message: "Additional service bill not found",
        data: additionalServiceBill,
      });
    } else {
      return res.status(200).json({
        message: "Additional service bill edited successfully",
        data: additionalServiceBill,
      });
    }
  } catch (error) {
    console.log("Error while editing additional service bill", error);
    await slackLogger(
      "Error while editing additional service bill",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAdditionalServiceBills = async (req, res) => {
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
    let countDocuments = await additionalServiceBillModal.countDocuments(query);
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
    const bills = await additionalServiceBillModal
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
    console.log("Error while fetching additional service bills", error);
    await slackLogger(
      "Error while fetching additional service bills",
      error.message,
      error,
      req
    );
    return res.status(500).json({ message: "Internal server error" });
  }
};
