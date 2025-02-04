import { slackLogger } from "../middleware/webHook.js";
import inventoryModal from "../models/inventory/inventory.modal.js";
import ipdBillModal from "../models/inventory/ipdBill.modal.js";
import supplierBillModal from "../models/inventory/supplierBill.modal.js";
// import supplierPaymentModal from "../models/inventory/supplierPayment.modal.js";
import medicineModal from "../models/pharmacy/medicine.modal.js";
import supplierModel from "../models/pharmacy/supplier.model.js";
import inventoryModel from "../models/roles/inventory.model.js";
import { getCurrentDateFormatted } from "../utils/utilFunctions.js";

async function generateSixDigitNumber() {
  let isUnique = false;
  let randomNumber;

  while (!isUnique) {
    randomNumber = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit number
    const existingBill = await supplierBillModal.findOne({
      billNumber: randomNumber,
    });
    if (!existingBill) {
      isUnique = true;
    }
  }

  return randomNumber;
}

export const addSupplierBill = async (req, res) => {
  try {
    console.log("addSupplierBill", req.body);
    // Check if the bill already exists
    const supplierBill = await supplierBillModal.findOne({
      billNumber: req.body.billNumber,
    });
    if (supplierBill) {
      return res.status(400).send("Bill already exists");
    }

    // Create a new supplier bill
    const newSupplierBill = new supplierBillModal(req.body);
    newSupplierBill.date = getCurrentDateFormatted();

    if (req.body.payment) {
      req.body.payment.date = getCurrentDateFormatted();
      newSupplierBill.payments = [];
      newSupplierBill.payments.push(req.body.payment);
      if (parseInt(req.body.payment.remainingDue) > 0) {
        newSupplierBill.status = "due";
      } else if (parseInt(req.body.payment.remainingDue) === 0) {
        newSupplierBill.status = "paid";
      }
      newSupplierBill.grandRemainingDue = req.body.payment.remainingDue;
    }

    newSupplierBill.billNumber = await generateSixDigitNumber();
    newSupplierBill.grandRemainingDue = req.body.payment.totalDue;
    await newSupplierBill.save();

    // Update medicine stock quantities
    // for (const medicine of newSupplierBill.medicines) {
    //   const medicineDetails = await medicineModal.findById(medicine.medicineId);
    //   if (medicineDetails) {
    //     medicineDetails.stockQuantity =
    //       parseInt(medicineDetails.stockQuantity) + parseInt(medicine.quantity);
    //     await medicineDetails.save();
    //   }
    // }

    for (const medicine of newSupplierBill.medicines) {
      const medicineName = medicine.name.split("(")[0];
      const companyName = medicine.name.split("(")[1].split(")")[0];
      const medicineL = await medicineModal.findOne({
        name: medicineName,
        companyName: companyName,
      });
      console.log(
        "medicineName: ",
        medicineName,
        " companyName: ",
        companyName,
        " medicineBatch: ",
        medicine.batchNumber
      );
      const existingMedicine = await medicineModal.findOne({
        name: medicineName,
        companyName: companyName,
        batchNumber: medicine.batchNumber,
      });

      if (existingMedicine) {
        // Update stock quantity and other fields
        console.log("Current stockQuantity:", existingMedicine.stockQuantity);
        console.log("New quantity to add:", medicine.quantity);
        existingMedicine.stockQuantity =
          parseInt(
            existingMedicine.stockQuantity < 0
              ? 0
              : existingMedicine.stockQuantity
          ) + parseInt(medicine.quantity);

        console.log("Stock QUantity: ", existingMedicine.stockQuantity);

        existingMedicine.expiryDate =
          medicine.expiry || existingMedicine.expiryDate;
        existingMedicine.pricePerUnit =
          medicine.sellPrice || existingMedicine.pricePerUnit;

        await existingMedicine.save();
      } else {
        // Create a new medicine entry
        console.log("Creating new medicine entry: ", medicine);
        const newMedicine = new medicineModal({
          name: medicineL?.name,
          // medicineId: medicine.medicineId,
          batchNumber: medicine.batchNumber,
          expiryDate: medicine.expiry,
          pricePerUnit: medicine.sellPrice, // Use sellPrice for pricePerUnit
          stockQuantity: medicine.quantity,
          supplierID: req.body.supplierID,
          supplierName: req.body.supplierName,
          companyName: medicineL?.companyName,
          category: medicineL?.category,
          categoryName: medicineL?.categoryName,
        });

        await newMedicine.save();
      }
    }

    console.log("Supplier bill added successfully!");
    // Send the created supplier bill
    res
      .status(200)
      .json({ message: "Bill added successfully!", newSupplierBill });
  } catch (error) {
    console.error("Error in Add Supplier Bill: ", error);
    await slackLogger("Add Supplier Bill Error", error.message, error, req);
    res.status(500).send(error);
  }
};

export const updateSupplierBill = async (req, res) => {
  try {
    console.log("updateSupplierBill", req.body);
    const oldBill = await supplierBillModal.findById(req.params.id);
    const supplierBill = await supplierBillModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!supplierBill) {
      res.status(404).send("No bill found");
    } else {
      for (const medicine of oldBill.medicines) {
        const medicineName = medicine.name.split("(")[0];
        const companyName = medicine.name.split("(")[1].split(")")[0];
        const medicineL = await medicineModal.findOne({
          name: medicineName,
          companyName: companyName,
        });
        const medicineDetails = await medicineModal.findOne({
          name: medicineName,
          companyName: companyName,
          batchNumber: medicine.batchNumber,
        });
        if (medicineDetails) {
          const oldmedicine = oldBill.medicines.find(
            (m) => m.medicineId == medicine.medicineId
          );
          medicineDetails.stockQuantity =
            parseInt(medicineDetails.stockQuantity) -
            parseInt(oldmedicine.quantity) +
            parseInt(medicine.quantity);
          await medicineDetails.save();
        } else {
          // Create a new medicine entry
          console.log("Creating new medicine entry: ", medicine);
          const newMedicine = new medicineModal({
            name: medicineL?.name,
            // medicineId: medicine.medicineId,
            batchNumber: medicine.batchNumber,
            expiryDate: medicine.expiry,
            pricePerUnit: medicine.sellPrice, // Use sellPrice for pricePerUnit
            stockQuantity: medicine.quantity,
            supplierID: req.body.supplierID,
            supplierName: req.body.supplierName,
            companyName: medicineL?.companyName,
            category: medicineL?.category,
            categoryName: medicineL?.categoryName,
          });

          await newMedicine.save();
        }
      }
    }
    res
      .status(200)
      .json({ message: "Supplier bill updated successfully!", supplierBill });
  } catch (error) {
    res.send("Error in Update supplier bill: ", error);
    console.log("Error in Update supplier bill: ", error);
    await slackLogger("Update Supplier Bill Error", error.message, error, req);
  }
};

export const deleteSupplierBill = async (req, res) => {
  try {
    const supplierBill = await supplierBillModal.findByIdAndDelete(
      req.params.id
    );

    if (!supplierBill) {
      return res.status(404).send("No bill found");
    }

    for (const medicine of supplierBill.medicines) {
      const medicineDetails = await medicineModal.findById(medicine.medicineId);

      if (medicineDetails) {
        medicineDetails.stockQuantity =
          parseInt(medicineDetails.stockQuantity) - parseInt(medicine.quantity);
        await medicineDetails.save();
      }
    }

    res
      .status(200)
      .json({ message: "Supplier bill deleted successfully!", supplierBill });
  } catch (error) {
    console.error("Delete supplier bill: ", error);
    await slackLogger("Delete Supplier Bill Error", error.message, error, req);
    res.status(500).send("Server error");
  }
};

export const addPaymentTpSupplierBill = async (req, res) => {
  try {
    console.log("addPaymentsupplierBill", req.body);
    const supplierBill = await supplierBillModal.findById(req.body.billId);
    console.log("supplierBill", supplierBill);
    if (!supplierBill) {
      console.log("Bill not found");
      return res.status(404).send({ message: "Bill not found" });
    }
    if (supplierBill.status === "paid") {
      return res.status(400).send({ message: "Bill already paid" });
    }
    if (req.body.payment.amount > supplierBill.grandRemainingDue) {
      return res
        .status(400)
        .json({ message: "Payment amount exceeds total amount" });
    }
    if (!supplierBill.payments) {
      supplierBill.payments = [];
    }
    req.body.payment.date = getCurrentDateFormatted();
    supplierBill.payments.push(req.body.payment);
    if (supplierBill.grandRemainingDue) {
      supplierBill.grandRemainingDue =
        parseInt(supplierBill.grandRemainingDue) -
        parseInt(req.body.payment.amount);
    } else {
      supplierBill.grandRemainingDue = req.body.payment.remainingDue;
    }
    if (supplierBill.grandRemainingDue == 0) {
      supplierBill.status = "paid";
    }
    await supplierBill.save();
    console.log("Payment added successfully");
    res.status(200).json({ message: "Payment added successfully" });
  } catch (error) {
    console.log("Error while adding payment", error);
    await slackLogger("Add Payment Error", error.message, error, req);
    res.status(500).send({ message: "Error while adding payment" });
  }
};

export const getSupplierBill = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await supplierBillModal.countDocuments();
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
    const items = await supplierBillModal.find().sort({ billDate: -1 }).skip(skip).limit(pageSize);
    res.send({
      page,
      limit,
      totalPages,
      items,
    });
  } catch (error) {
    console.log("Error while getting supplier bill", error);
    await slackLogger("Get Supplier Bill Error", error.message, error, req);
    res.status(500).send({ message: "Error while getting supplier bill" });
  }
};

// export const addSupplierPayment = async (req, res) => {
//   try {
//     const supplierBillNo = req.body.supplierBillNumber;
//     const supplierBill = await supplierBillModal.findOne({
//       supplierBillNumber: supplierBillNo,
//     });
//     if (!supplierBill) {
//       return res.status(404).send({ message: "Bill not found" });
//     }
//     const oldPayment = await supplierPaymentModal.findOne({
//       supplierBillNumber: supplierBillNo,
//     });
//     if (oldPayment) {
//       return res.status(400).send({ message: "Payment already exists" });
//     }
//     const newSupplierPayment = new supplierPaymentModal(req.body);
//     newSupplierPayment.billNumber = await generateSixDigitNumber();
//     await newSupplierPayment.save();
//     res.send(newSupplierPayment);
//   } catch (error) {
//     res.status(500).send({ message: "Error while adding supplier payment" });
//   }
// };

// export const deleteSupplierPayment = async (req, res) => {
//   try {
//     const supplierPayment = await supplierPaymentModal.findByIdAndDelete(
//       req.params.id
//     );
//     if (!supplierPayment) {
//       res.status(404).send("No payment found");
//     }
//     res.send(supplierPayment);
//   } catch (error) {
//     res.send(error);
//   }
// };

// export const updateSupplierPayment = async (req, res) => {
//   try {
//     const supplierPayment = await supplierPaymentModal.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!supplierPayment) {
//       res.status(404).send("No payment found");
//     }
//     res.send(supplierPayment);
//   } catch (error) {
//     res.send(error);
//   }
// };

// export const getSupplierPayment = async (req, res) => {
//   try {
//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;
//     if (page < 1 || limit < 1) {
//       return res.status(400).send({
//         message: "Page number and page size must be positive integers!",
//       });
//     }
//     let skip = (page - 1) * limit;
//     const supplierPaymentCount = await supplierPaymentModal.countDocuments();
//     const supplierPayment = await supplierPaymentModal
//       .find()
//       .skip(skip)
//       .limit(limit);
//     const totalPages = Math.ceil(supplierPaymentCount / limit);
//     res.send({
//       page,
//       limit,
//       totalPages,
//       supplierPayment,
//     });
//   } catch (error) {
//     res.status(500).send({ message: "Error while getting supplier payment" });
//   }
// };

export const addInventory = async (req, res) => {
  try {
    const newInventory = new inventoryModal(req.body);
    await newInventory.save();
    res
      .status(201)
      .json({ message: "Inventory created successfully!", newInventory });
  } catch (error) {
    console.error("Error in addInventory: ", error);
    await slackLogger("Add Inventory Error", error.message, error, req);
    res.status(500).json({ message: "Internal server error!", error });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const inventory = await inventoryModal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!inventory) {
      res.status(404).send("No inventory found");
    }
    res
      .status(200)
      .json({ message: "Inventory updated successfully!", inventory });
  } catch (error) {
    console.log("Error in updateInventory: ", error);
    await slackLogger("Update Inventory Error", error.message, error, req);
    res.status(500).json({ message: "Internal server error!", error });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const inventory = await inventoryModal.findByIdAndDelete(req.params.id);
    if (!inventory) {
      return res.status(404).send("No inventory found");
    }
    res
      .status(200)
      .json({ message: "Inventory deleted successfully!", inventory });
  } catch (error) {
    console.error("Error in deleteInventory: ", error);
    await slackLogger("Delete Inventory Error", error.message, error, req);
    res.status(500).json({ message: "Internal server error!", error });
  }
};

export const getInventory = async (req, res) => {
  try {
    const { page, limit } = req.query;

    // Initialize pagination variables
    let skip = 0;
    let pageSize = 0;
    let countDocuments = await inventoryModal.countDocuments();
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
    const inventory = await inventoryModal.find().skip(skip).limit(pageSize);
    res.send({
      page,
      limit,
      totalPages,
      inventory,
    });
  } catch (error) {
    console.error("Error in getInventory: ", error);
    await slackLogger("Get Inventory Error", error.message, error, req);
    res.status(500).json({ message: "Internal server error!", error });
  }
};

// export const getMedicineStats = async (req, res) => {
//   try {
//     const ipdBillsMed = await ipdBillModal.find({ "item.category": "pharmacy" });
//     ipdBillsMed.forEach((bill) => {

//     });
//   } catch (error) {
//     console.error("Error in getMedicineStats: ", error);
//     await slackLogger("Get Medicine Stats Error", error.message, error, req);
//     res.status(500).json({ message: "Internal server error!", error });
//   }
// }
