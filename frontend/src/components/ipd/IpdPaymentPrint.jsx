import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import "./styles/IpdBillingPrint.css";
import hospitalImage from "../../assets/hospital.jpg";
import prakashLogo from "../../assets/prakashLogo.jpg";

const IpdPaymentPrint = ({ printRef, patientDetails, selectedBill, user }) => {
  const { setNotification } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState("");

  // console.log("selected bill in payment print - ", selectedBill);
  useEffect(() => {
    // Set the current date when the component loads
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  // Helper function to calculate total paid amount
  const calculateTotalPaid = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions.reduce((acc, amt) => acc + (amt.paymentAmount || 0), 0);
  };

  // Calculate totals and dues
  const totalPaid = calculateTotalPaid(selectedBill?.transactionHistory);
  const remainingDues =
    (selectedBill?.grandTotals?.totalDiscounted || 0) - totalPaid;

  function formatDateToDDMMYYYY(dateString) {
    try {
      // Parse the date string
      const date = new Date(dateString);

      // Check for invalid date
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }

      // Extract day, month, and year
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();

      // Return the formatted date
      return `${day}/${month}/${year}`;
    } catch (error) {
      // Log and return a placeholder for invalid dates
      console.error(error.message);
      return "Invalid Date";
    }
  }

  return (
    <div ref={printRef} className="ipd-bill-layout print-content print-only">
      {/* <div className="bill-image-container">
        <img src={hospitalImage} alt="Hospital" className="hospital-image" />
      </div> */}
      {/* Custom Header */}
      <div className="custom-header">
        <img src={prakashLogo} alt="Hospital Logo" className="hospital-logo" />
        <div className="header-text">
          <h2 className="hospital-name" style={{ marginBottom: "0" }}>
            New Prakash Surgical Clinic
          </h2>
          <p className="hospital-address">
            38 C Circular Road, Opp. Kauwa Bagh Police Station, Gorakhpur
            (273012) UP
          </p>
        </div>
        <img src={prakashLogo} alt="Hospital Logo" className="hospital-logoo" />
      </div>
      <hr />

      {/* Patient Details */}
      {/* <h2 className="ib-print">Patient Details</h2>
      <div className="patient-details">
        <p>
          <strong>Name:</strong> {patientDetails?.name}
        </p>
        <p>
          <strong>UHID:</strong> {patientDetails?.uhid}
        </p>
        <p>
          <strong>Email:</strong> {patientDetails?.email}
        </p>
        <p>
          <strong>Phone:</strong> {patientDetails?.phone}
        </p>
        <p>
          <strong>Age:</strong> {patientDetails?.age} years
        </p>
        <p>
          <strong>Height:</strong> {patientDetails?.height} cm
        </p>
        <p>
          <strong>Weight:</strong> {patientDetails?.weight} kg
        </p>
        <p>
          <strong>Blood Group:</strong> {patientDetails?.bloodGroup}
        </p>
        <p>
          <strong>Admission Date:</strong>{" "}
          {new Date(patientDetails?.admissionDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <p>
          <strong>Date:</strong> {currentDate}
        </p>
      </div>
      <p style={{
        position: "absolute",
        top: "20%",
        right: "1rem",
        fontSize: "1rem",
      }}>
        <strong>Bill No:</strong> {selectedBill?.billNumber}
      </p> */}

      <div className="bill-head">
        <h3 className="sub-header">Patient Details</h3>
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            {
              label: "Payment Number",
              value: selectedBill?.paymentNumber || "N/A",
            },
            {
              label: "Payment Date",
              value: formatDateToDDMMYYYY(selectedBill?.date || "") || "N/A",
            },
            {
              label: "Patient Name",
              value: patientDetails?.name?.toUpperCase() || "N/A",
            },
            {
              label: "UHID",
              value: patientDetails?.uhid || "N/A",
            },
            {
              label: "Age/Gender",
              value:
                patientDetails?.age && patientDetails?.gender
                  ? `${
                      patientDetails?.age
                    } / ${patientDetails?.gender?.toUpperCase()}`
                  : "N/A",
            },
            {
              label: "Mobile",
              value: patientDetails?.phone || "N/A",
            },
            patientDetails?.tpaCorporate?.trim()
              ? {
                  label: "TPA/Corporate",
                  value: patientDetails?.tpaCorporate,
                }
              : null,
            patientDetails?.crnNumber?.trim()
              ? {
                  label: "CR Number",
                  value: patientDetails?.crnNumber,
                }
              : null,
            patientDetails?.ummidCard?.trim()
              ? {
                  label: "UMMID Number",
                  value: patientDetails?.ummidCard,
                }
              : null,
            patientDetails?.referenceLetter?.trim()
              ? {
                  label: "Reference letter No.",
                  value: patientDetails?.referenceLetter,
                }
              : null,
            patientDetails?.diagnosis?.trim()
              ? {
                  label: "Diagnosis",
                  value: patientDetails?.diagnosis,
                }
              : null,
            {
              label: "Doctor",
              value: patientDetails?.doctorName?.toUpperCase() || "N/A",
            },
            {
              label: "Admitted Ward",
              value: patientDetails?.wingName
                ? patientDetails?.wingName?.toUpperCase()
                : "N/A",
            },
            {
              label: "Admission Date",
              value: patientDetails?.admissionDate
                ? formatDateToDDMMYYYY(patientDetails?.admissionDate)
                : "N/A",
            },
            {
              label: "Discharge Date",
              value: patientDetails?.dischargeDate
                ? formatDateToDDMMYYYY(patientDetails?.dischargeDate)
                : "N/A",
            },
          ]
            .filter((detail) => detail !== null) // Exclude null fields
            .map((detail, index) => (
              <div key={index} className="patient-detail">
                <div className="patient-label">{detail.label}:</div>
                <div className="patient-value">{detail.value}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Billing Details */}
      <section className="bill-items-section">
        <h2 className="sub-header">Payment Ledger</h2>
        {selectedBill ? (
          <table className="bill-items-table">
            <thead>
              <tr>
                <th>Payment Number</th>
                <th>Payment Amount</th>
                <th>Payment Type</th>
                <th>Transaction ID</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{selectedBill.paymentNumber || "N/A"}</td>
                <td>₹ {selectedBill.paymentAmount || "0"}</td>
                <td>{selectedBill.paymentType || "N/A"}</td>
                <td>{selectedBill.transactionId || "N/A"}</td>
                <td>{selectedBill.remarks || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>No payment details available.</p>
        )}

        {/* <div className="bill-summary-section">
          <div className="summary-info">
            <div className="summary-item">
              <strong>Total Charges:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.totalCharge || 0}
              </p>
            </div>
            <div className="summary-item">
              <strong>Total Discount:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.totalDiscount || 0}
              </p>
            </div>
            <div className="summary-item">
              <strong>Final Amount:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.totalDiscounted || 0}
              </p>
            </div>
            <div className="summary-item">
              <strong>Final Discount:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.finalDiscount || 0}
              </p>
            </div>
            <div className="summary-item">
              <strong>Payable Price:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.finalPrice || 0}
              </p>
            </div>
            <div className="summary-item">
              <strong>Amount Paid:</strong>
              <p className="bill-total-box">
                ₹{" "}
                {selectedBill?.transactionHistory
                  ?.reduce((acc, amt) => acc + (amt.paymentAmount || 0), 0)
                  ?.toFixed(2)}
              </p>
            </div>
            {selectedBill?.item?.some(
              (i) =>
                i.itemType === "all" ||
                i.itemType === "ipd" ||
                i.itemType === "opd"
            ) && (
              <div className="summary-item">
                <strong>Remaining Dues:</strong>
                <p className="bill-total-box">
                  ₹{" "}
                  {(
                    (selectedBill?.grandTotals?.finalPrice || 0) -
                    selectedBill?.transactionHistory?.reduce(
                      (acc, amt) => acc + (amt.paymentAmount || 0),
                      0
                    )
                  )?.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div> */}
      </section>

      <div
        className="space-signature"
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <div className="signature-section">
          <p style={{ color: "black", textAlign: "center" }}>{user?.name}</p>
          <p>
            <strong style={{ color: "black" }}>Authorized Signatory</strong>
          </p>
        </div>
        <div className="signature-section">
          <p></p>
          <p style={{ color: "black", marginTop: "40px" }}>
            <strong>Patient/Attendant Signatory</strong>
          </p>
        </div>
      </div>

      <hr />

      {/* Footer */}
      <div className="footer">
        <p>Thank you for choosing our hospital. Wishing you good health!</p>
      </div>
    </div>
  );
};

export default IpdPaymentPrint;
