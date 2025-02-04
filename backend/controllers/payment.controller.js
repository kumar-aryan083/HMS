import paymentModel from "../models/payment.model.js";

// Controller function to fetch all payments
export const getAllPayments = async (req, res) => {
  try {
    // Fetch all payments and populate necessary fields
    const payments = await paymentModel
      .find()
      .populate({
        path: "opdId", // Populate OPD details
        populate: {
          path: "appointment.doctor", // Populate doctor inside the appointment field
          select: "name specialization", // Only select specific fields for the doctor (name, specialization)
        },
      }) // Populate the OPD details
      .populate("patientId", "name mobile"); // Populate patient details (e.g., name, mobile)

    // If no payments found, send a 404 response
    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payments found.",
      });
    }

    // Return the populated payments
    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payments:", error.message);
    await slackLogger("Error fetching payments:", error.message, error, req);
    res.status(500).json({
      success: false,
      message: "Error fetching payments.",
      error: error.message,
    });
  }
};
