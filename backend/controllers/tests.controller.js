import { slackLogger } from "../middleware/webHook.js";
import testModel from "../models/test.model.js";

export const getAllTests = async (req, res) => {
  try {
    const tests = await testModel.find({});
    res.status(200).json(tests);
  } catch (error) {
    console.log("Error fetching tests:", error.message);
    await slackLogger("Error fetching tests:", error.message, error, req);
    res.status(500).json({ message: "Error fetching tests", error });
  }
};

export const addTestOption = async (req, res) => {
  const { name, code, description, price } = req.body;

  try {
    const newTest = new testModel({
      name,
      code,
      description,
      price,
    });

    await newTest.save();
    res.status(201).json({ message: "Test added successfully", test: newTest });
  } catch (error) {
    console.log("Error adding test:", error.message);
    await slackLogger("Error adding test:", error.message, error, req);
    res.status(500).json({ message: "Error adding test", error });
  }
};
