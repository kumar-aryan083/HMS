export function getCurrentDateFormatted() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = now.getFullYear();
  return `${year}-${month}-${day}`;
}

export function capitalize(str) {
  if (typeof str !== "string") {
    return ""; // Return an empty string if not a string
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDate(inputDate) {
  // Parse the input date string (yyyy-mm-dd)
  const date = new Date(inputDate);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format. Expected yyyy-mm-dd.");
  }

  // Format the date to dd-MMM-yyyy
  const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
  const month = date.toLocaleString('en-US', { month: 'short' }); // Get short month
  const year = date.getFullYear(); // Get the full year

  return `${day}-${month}-${year}`;
}

// Map itemType to corresponding model
// const itemTypeToModelMap = {
//   "opd consultation": opdRateModel,
//   "ipd rate": ipdRateModel,
//   // "lab test": labTestModel,
//   package: packagesModel,
//   service: servicesModel,
//   nursing: nursingModel,
//   "visiting doctor": visitingDoctorModel,
//   pharmacy: medicineModal,
//   "lab test": newLabTestModal,
// };

// Function to check if the name exists in a collection
const checkNameInCollection = async (model, name) => {
  try {
    console.log(`Checking name "${name}" in model ${model.modelName}`);
    const exists = await model.findOne({ name: name });
    if (exists) {
      console.log(`Name "${name}" found in model ${model.modelName}`);
    } else {
      console.log(`Name "${name}" not found in model ${model.modelName}`);
    }
    return !!exists;
  } catch (error) {
    console.error(
      `Error checking name "${name}" in model ${model.modelName}:`,
      error
    );
    return false;
  }
};

const insertJsonToMongoDB = async (jsonFilePath) => {
  try {
    // Read and parse JSON file
    const data = fs.readFileSync(jsonFilePath, "utf-8");
    const jsonData = JSON.parse(data);

    // Ensure the data is an array
    if (!Array.isArray(jsonData)) {
      throw new Error("JSON data must be an array of objects");
    }

    for (const item of jsonData) {
      const exist = await checkNameInCollection(
        servicesModel,
        `${item.name.trim()}`
      );
      console.log(exist);
      // Validate required fields
      if (item.name && item.Column4 && item.Column6 && !exist) {
        const newModal = new servicesModel({
          name: `${item.name.trim()}`, // Trim to ensure no leading/trailing spaces
          nabhPrice: parseFloat(item.Column4), // Parse to ensure correct data type
          nonNabhPrice: parseFloat(item.Column6),
          railwayCode: "",
          patientTypes: [
            {
              patientType: "67713e983e4fdec6858d87e5",
              patientTypeName: "Railway",
            },
          ],
        });

        await newModal.save();
        console.log(`Data inserted successfully for: ${item.name}`);
      } else {
        console.warn(
          `Skipping item due to missing fields: ${JSON.stringify(item)}`
        );
      }
    }

    console.log("Data insertion completed successfully.");
  } catch (error) {
    console.error("Error inserting JSON to MongoDB:", error.message);
  }
};

const jsonFilePath = "./data/8BOOK8.json"; // Path to your JSON file

// insertJsonToMongoDB(jsonFilePath);

function renameFieldInJsonFile(filePath, oldFieldName, newFieldName) {
  // Read the JSON file
  const rawData = fs.readFileSync(filePath, "utf8");
  const dataArray = JSON.parse(rawData);

  // Process the data
  const updatedData = dataArray.map((obj) => {
    if (obj.hasOwnProperty(oldFieldName)) {
      obj[newFieldName] = obj[oldFieldName]; // Add new field
      delete obj[oldFieldName]; // Remove old field
    }
    return obj; // Return updated object
  });

  // Write the updated data back to the file
  fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2), "utf8");
  console.log("Field renamed successfully in the JSON file.");
}

// renameFieldInJsonFile('./stock.json', 'Rack No.', 'rackNo');

async function insertDocuments() {
  try {
    for (const item of final1) {
      // const itemTypeToModelMap = {
      //   opd: opdRateModel,
      //   ipdRate: ipdRateModel,
      //   test: labTestModel,
      //   packages: packagesModel,
      //   services: servicesModel,
      //   nursing: nursingModel,
      //   visitingdoctor: visitingDoctorModel,
      // };

      if (
        item.Column2 &&
        item.name
        // typeof item.Column4 === "number" &&
        // typeof item.Column6 === "number" &&
        // item.Column7
      ) {
        // const model = itemTypeToModelMap[item.Column7.toLowerCase()];
        // const model = stockModal;
        // if (!model) {
        //   console.error("Invalid model type:", item.Column7);
        //   continue;
        // }

        const newModal = new otherServicesModel({
          // name: item.Column2,
          // railwayCode: item.railwayCode,
          // nabhPrice: item.Column6,
          // nonNabhPrice: item.Column4,
          // patientTypes: [
          //   {
          //     patientTypeName: 'Railway',
          //     patientType: '67713e983e4fdec6858d87e5',
          //     generalFees: ''
          //   }
          // ]
          name: `${item.name} (General Ward)`,
          pricePerUnit: item.Column2,
        });
        await newModal.save();
        console.log(
          `Data inserted successfully for: ${item.name} - ${item.Column2}`
        );
      }
      // }
    }
    console.log("All data inserted successfully.");
  } catch (err) {
    console.error("Error while inserting data:", err.message);
  }
}

// insertDocuments();

async function addFieldToDocuments() {
  try {
    const models = [
      opdRateModel,
      ipdRateModel,
      labTestModel,
      packagesModel,
      servicesModel,
      nursingModel,
      visitingDoctorModel,
    ];

    const fieldName = "patientType";
    const fieldValue = "6763ee1c62a667bd17387645";
    for (const model of models) {
      // Update all documents to include the new field with the fixed value
      const result = await model.updateMany(
        {}, // No filter, applies to all documents
        { $set: { [fieldName]: fieldValue } } // Set the new field with the fixed value
      );
      console.log(`${result.modifiedCount} documents updated successfully!`);
    }

    console.log("All documents updated successfully.");
  } catch (error) {
    console.error("Error while updating documents:", error.message);
  }
}

// addFieldToDocuments();

async function medicine() {
  try {
    const stockModalItems = await stockModal.find();
    for (const item of stockModalItems) {
      const foundItem = await medicineModal.findOne({ name: item.productName });
      if (foundItem) {
        const updateItem = await medicineModal.updateOne(
          { name: item.productName },
          {
            $set: {
              expiryDate: item.exp,
              pricePerUnit: item.mrp,
            },
          }
        );
        if (updateItem) {
          console.log("Medicine updated successfully.");
        }
      } else {
        console.log("Medicine not found:", item.productName);
      }

      // const newMedicine = new medicineModal({
      //   name: item.productName || "",
      //   stockQuantity: item.currentStock || 0,
      //   batchNumber: item.batch || "",
      //   companyName: item.company || "",
      //   itemType: "500 MG",
      //   itemTypeId: "6766e06fcc347b1f16a6cdb7",
      //   uom: "PICS",
      //   uomId: "6766e233c0fdae15bf49bd0c",
      //   category: "6766ca318cc4425ccdc2bb1b",
      //   categoryName: "Fever",
      // });
      // await newMedicine.save();
    }
    console.log("All medicines updated successfully.");
  } catch (error) {
    console.error("Error while updating medicines:", error.message);
  }
}

// medicine();

async function addRandomExpiryDate() {
  try {
    // Generate random expiryDate for each document
    const documents = await medicineModal.find({}).exec(); // Use `.exec()` for mongoose queries

    const updates = documents.map((doc) => {
      // Generate a random expiry date between 1 to 365 days from today
      const randomDays = Math.floor(Math.random() * 365) + 1;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + randomDays);

      // Format the expiry date to YYYY-MM-DD
      const formattedExpiryDate = expiryDate.toISOString().split("T")[0];

      return {
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { expiryDate: formattedExpiryDate } },
        },
      };
    });

    if (updates.length > 0) {
      const result = await medicineModal.bulkWrite(updates);
      console.log(
        `${result.modifiedCount} documents updated with random expiryDate.`
      );
    } else {
      console.log("No documents found to update.");
    }
  } catch (err) {
    console.error("Error updating documents:", err);
  } finally {
    console.log("Operation completed.");
  }
}

// addRandomExpiryDate();

// Script to update values
const updateArrayField = async () => {
  try {
    console.log("Fetching all documents...");
    const documents = await ipdBillModal.find();

    console.log(`Found ${documents.length} documents.`);

    for (const doc of documents) {
      console.log(`Processing document with _id: ${doc._id}`);
      let isModified = false;

      // Ensure items are plain JavaScript objects
      const items = doc.item.map((item) => item.toObject());

      const updatedItems = await Promise.all(
        items.map(async (item) => {
          console.log(`Processing item:`, { itemName: item.itemName });

          for (const [category, model] of Object.entries(itemTypeToModelMap)) {
            const nameExists = await checkNameInCollection(
              model,
              item.itemName
            );
            if (nameExists) {
              console.log(
                `Updating itemCategory of "${item.itemName}" to "${category}"`
              );
              isModified = true;
              return {
                ...item,
                itemCategory: category.toString(),
              };
            }
          }

          console.log(`No update for item:`, item);
          return item; // Return the original item if no update is needed
        })
      );

      console.log(`Updated items:`, updatedItems);

      if (isModified) {
        console.log(`Updating document with _id: ${doc._id}`);
        await ipdBillModal.updateOne(
          { _id: doc._id },
          { $set: { item: updatedItems } }
        );
        console.log(`Document with _id: ${doc._id} updated successfully.`);
      } else {
        console.log(`No updates required for document with _id: ${doc._id}`);
      }
    }

    console.log("Update process completed.");
  } catch (error) {
    console.error("Error updating documents:", error);
  }
};

// updateArrayField();

const updateNewLabTest = async () => {
  try {
    const allTests = await labTestModel.find();
    for (const test of allTests) {
      const existing = await newLabTestModal.findOne({ name: test.name });
      if (!existing) {
        const newTest = new newLabTestModal({
          name: test.name,
          railwayCode: test.railwayCode,
          nabhPrice: test.nabhPrice,
          nonNabhPrice: test.nonNabhPrice,
          patientTypes: [
            {
              patientType: test.patientType,
              patientTypeName: "Railway",
            },
          ],
        });
        await newTest.save();
        console.log(`New lab test added: ${test.name}`);
      } else {
        console.log(`Lab test already exists: ${test.name || "Unknown"}`);
      }
    }
    console.log("All lab tests updated successfully.");
  } catch (error) {
    console.error("Error updating new lab tests:", error);
  }
};

// updateNewLabTest();

// const updateField = async () => {
//   try {
// Step 1: Add or update the patientType field
// const setResult = await otherServicesModel.updateMany(
//   {}, // Match all documents
//   {
//     $set: {
//       patientTypes: [
//         {
//           patientType: "67713e983e4fdec6858d87e5",
//           patientTypeName: "Railway",
//         },
//       ],
//     },
//   }
// );

// console.log("PatientType field updated successfully:", setResult);

//     const documents = await otherServicesModel.find({
//       pricePerUnit: { $exists: true },
//     });
//     console.log("Documents with 'pricePerUnit':", documents);
//     // Step 2: Rename the field
//     const renameResult = await otherServicesModel.updateMany(
//       {}, // Match all documents
//       {
//         $rename: {
//           pricePerUnit: "price", // Replace with actual field names
//         },
//       }
//     );

//     console.log("Field renamed successfully:", renameResult);
//   } catch (error) {
//     console.error("Error while updating documents:", error.message);
//   }
// };

// updateField();
