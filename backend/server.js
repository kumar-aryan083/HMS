import express from "express";
import mongoose from "mongoose";
import chalk from "chalk";
import env from "dotenv";
import cors from "cors";
import employeeRouter from "./routers/employee.routes.js";
import patientRouter from "./routers/patient.routes.js";
import adminRouter from "./routers/admin.routes.js";
import opdRouter from "./routers/opd.routes.js";
import testRouter from "./routers/tests.routes.js";
import paymentRouter from "./routers/payments.routes.js";
import ipdRouter from "./routers/ipd.routes.js";
import commonRouter from "./routers/common.routes.js";
import pharmacyRouter from "./routers/pharmacy.routes.js";
import storeRouter from "./routers/store.routes.js";
import labRouter from "./routers/lab.routes.js";
import inventoryRouter from "./routers/inventory.routes.js";
import { tenantId } from "./config/config.js";
import Role from "./models/roles/role.modal.js";
import opdRateModel from "./models/opdRate.model.js";
import ipdRateModel from "./models/ipdRate.model.js";
import labTestModel from "./models/lab/labTest.model.js";
import packagesModel from "./models/packages.model.js";
import servicesModel from "./models/services.model.js";
import nursingModel from "./models/nursing.model.js";
import visitingDoctorModel from "./models/visitingDoctor.model.js";
import medicineModal from "./models/pharmacy/medicine.modal.js";
import newLabTestModal from "./models/lab/newLabTest.modal.js";
import ipdBillModal from "./models/inventory/ipdBill.modal.js";
import accountRouter from "./routers/account.routes.js";
import additionalServices from "./routers/additionalServices.routes.js";
import otherServicesModel from "./models/otherServices.model.js";
import fs from "fs";

env.config();

const app = express();

const dbConnection = () => {
  // const tenantId = req.headers["x-tenant-id"]; // Frontend passes this
  // const tenantId = 'hms';

  mongoose
    .connect(
      `mongodb+srv://wayugpl:M5jKj3GBJZeMsXUn@cluster0.dxsqwiv.mongodb.net/${tenantId}`
    )
    .then(() => {
      console.log(chalk.inverse.bold.green("DB is connected..."));
    })
    .catch((err) => {
      console.log(chalk.inverse.bold.red("unable to connect db"));
    });
};

const corsAllow = {
  origin: "http://localhost:5173",
  method: "POST, GET, PUT, PATCH, HEAD",
  credential: true,
};

app.use(express.json());
app.use(cors());
app.use("/api/employee", employeeRouter);
app.use("/api/patient", patientRouter);
app.use("/api/admin", adminRouter);
app.use("/api/opd", opdRouter);
app.use("/api/tests", testRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/ipd", ipdRouter);
app.use("/api/common", commonRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/lab", labRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/store", storeRouter);
app.use("/api/account", accountRouter);
app.use("/api/additional-services", additionalServices);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Something on Server is working fine....",
    tenantId,
  });
});

Role.countDocuments()
  .then((count) => {
    if (count === 0) {
      new Role({
        name: "admin",
      })
        .save()
        .then(() => console.log("added 'admin' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "nurse",
      })
        .save()
        .then(() => console.log("added 'nurse' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "pharmacy",
      })
        .save()
        .then(() => console.log("added 'pharmacy' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "store",
      })
        .save()
        .then(() => console.log("added 'store' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "laboratory",
      })
        .save()
        .then(() => console.log("added 'laboratory' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "doctor",
      })
        .save()
        .then(() => console.log("added 'doctor' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "counter",
      })
        .save()
        .then(() => console.log("added 'counter' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "hr",
      })
        .save()
        .then(() => console.log("added 'hr' to roles collection"))
        .catch((err) => console.log("error", err));

      new Role({
        name: "inventory",
      })
        .save()
        .then(() => console.log("added 'inventory' to roles collection"))
        .catch((err) => console.log("error", err));
    }
  })
  .catch((err) => {
    console.error("Error during countDocuments:", err);
  });

// const changeDocumentId = async () => {
//   try {
//     const item = await labTestModel.findOne({ name: 'Procalcitonin' });
//     if (!item) {
//       console.log('Item not found');
//       return;
//     }

//     console.log(item); // Check if the document is found

//     // Create a new document with the desired _id
//     const newItem = {
//       ...item.toObject(), // Get all fields as an object
//       _id: '67718de39e1fcf3e8ff8e38d', // New _id
//     };
//     await labTestModel.deleteOne({ _id: item._id });

//     // Insert the new document
//     await labTestModel.create(newItem);

//     // Delete the old document

//     console.log('Document _id updated successfully');
//   } catch (error) {
//     console.error('Error updating _id:', error);
//   }
// };

// changeDocumentId();

app.listen(3012, (err) => {
  if (!err) {
    console.log(chalk.inverse.bold.yellow("Server is live..."));
    dbConnection();
  } else {
    console.log(
      chalk.inverse.red("something went wrong while listening the server.")
    );
  }
});
