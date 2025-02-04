import React, { useContext, useEffect, useRef, useState } from "react";
import hospitalImage from "../../assets/hospital.jpg";
import "./styles/PharmacyBillingPrint.css";
import { AppContext } from "../../context/AppContext";
import prakashLogo from "../../assets/prakashLogo.jpg";

const PharmacyBillingPrint = ({
  printRef,
  patientDetails,
  selectedBill,
  isAddtional = false,
}) => {
  const { setNotification, user } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState("");

  // console.log("selected bill in print--- ", selectedBill);
  useEffect(() => {
    // console.log("patientDetails ", patientDetails);
    // console.log("selected bill ",selectedBill)

    // Set the current date when the component loads
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  const numberToWords = (num) => {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    const convert = (n) => {
      if (n < 20) return ones[n];
      if (n < 100)
        return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      if (n < 1000)
        return (
          ones[Math.floor(n / 100)] +
          " hundred" +
          (n % 100 ? " and " + convert(n % 100) : "")
        );
      if (n < 1000000)
        return (
          convert(Math.floor(n / 1000)) +
          " thousand" +
          (n % 1000 ? " " + convert(n % 1000) : "")
        );
      return "";
    };

    return num ? convert(num) : "zero";
  };

  // Helper function to calculate total paid amount
  const calculateTotalPaid = (transactions) => {
    if (!transactions || !Array.isArray(transactions)) return 0;
    return transactions.reduce((acc, amt) => acc + (amt.paymentAmount || 0), 0);
  };

  function formatDateToDDMMYYYY(dateString) {
    if (!dateString) {
      console.error("Invalid date string provided:", dateString);
      return "Invalid Date";
    }

    const date = new Date(dateString);

    if (isNaN(date)) {
      console.error("Failed to parse date:", dateString);
      return "Invalid Date";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  // Calculate totals and dues
  const totalPaid = calculateTotalPaid(selectedBill?.transactionHistory);
  const remainingDues =
    (selectedBill?.grandTotals?.totalDiscounted || 0) - totalPaid;

  return (
    <div className="ipd-bill-layout print-content print-only" ref={printRef}>
      {/* <div className="total-bill-image-container">
        <img src={hospitalImage} alt="Hospital" className="ds-hospital-image" />
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

      <div className="bill-head">
        <h3 className="sub-header">Patient Details</h3>
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            {
              label: "Bill Number",
              value: selectedBill?.billNumber || "N/A",
            },
            {
              label: "Bill Date",
              value: formatDateToDDMMYYYY(selectedBill?.date || "") || "N/A",
            },
            {
              label: "Patient Name",
              value: patientDetails?.patientName?.toUpperCase() || "N/A",
            },
            {
              label: "UHID",
              value: patientDetails?.uhid || "N/A",
            },
            {
              label: "Mobile",
              value: patientDetails?.mobile || "N/A",
            },
            patientDetails?.crnNumber?.trim() !== "" &&
            patientDetails?.crnNumber
              ? {
                  label: "CR Number",
                  value: patientDetails?.crnNumber || "N/A",
                }
              : null,
            patientDetails?.ummidCard?.trim() !== "" &&
            patientDetails?.ummidCard
              ? {
                  label: "UMMID Number",
                  value: patientDetails?.ummidCard || "N/A",
                }
              : null,
            {
              label: "Prescribed By",
              value: selectedBill?.prescribedByName || "N/A",
            },
          ]
            .filter((detail) => detail !== null) // Remove null entries
            .map((detail, index) => (
              <div key={index} className="patient-detail">
                <div className="patient-label">{detail.label}:</div>
                <div className="patient-value">{detail.value}</div>
              </div>
            ))}
        </div>
      </div>

      <section className="bill-items-section">
        <h2 className="sub-header">Bill Items</h2>
        <table className="bill-items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Charge</th>
              <th>Quantity</th>
              <th>Total Charge</th>
              <th>Discount</th>
              <th>Discounted Price</th>
            </tr>
          </thead>
          <tbody>
            {(selectedBill?.item || []).map((item, index) => (
              <tr key={item._id || index}>
                <td>{index + 1}</td>
                <td>{item.itemName}</td>
                <td>₹{item.charge.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>₹{item.totalCharge.toFixed(2)}</td>
                <td>{item.discount}%</td>
                <td>₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section
        className="pharmacy-bill-summary-section"
        style={{ justifyContent: "space-between" }}
      >
        <div
        className="space-signature"
        style={{ display: "flex", justifyContent: "space-around", width: "70%",alignItems:"end" }}
      >
        <div className="signature-section">
          <p style={{ color: "black", textAlign: "center" }}>{user?.name}</p>
          <p>
            <strong style={{ color: "black" }}>Authorized Signatory</strong>
          </p>
        </div>
        <div className="signature-section">
          <p style={{ color: "black" }}></p>
          <p style={{ color: "black", marginTop:"40px" }}>
            <strong style={{ color: "black" }}>
              Patient Signature
            </strong>
          </p>
        </div>
      </div>
        <div className="pharmacy-summary-info">
          {/* <div className="pharmacy-summary-item">
            <strong>Total Charge:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹ {selectedBill?.grandTotals?.totalCharge.toFixed(2)}
            </p>
          </div>
          <div className="pharmacy-summary-item">
            <strong>Total Discount:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹ {selectedBill?.grandTotals?.totalDiscount.toFixed(2)}
            </p>
          </div> */}
          <div className="pharmacy-summary-item">
            <strong>Discounted Price:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹ {selectedBill?.grandTotals?.totalDiscounted.toFixed(2)}
            </p>
          </div>
          <div className="pharmacy-summary-item">
            <strong>Final Discount:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹ {selectedBill?.grandTotals?.finalDiscount.toFixed(2)}
            </p>
          </div>
          {selectedBill?.finalDiscountBy && (
            <div className="pharmacy-summary-item">
              <strong>Discounted By:</strong>
              <p className="bill-total-box" style={{ color: "black" }}>
                {selectedBill?.finalDiscountBy}
              </p>
            </div>
          )}
          <div className="pharmacy-summary-item">
            <strong>Payable Amount:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹ {selectedBill?.grandTotals?.finalPrice.toFixed(2)}
            </p>
          </div>
          <div className="pharmacy-summary-item">
            <strong>Paid Amount:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹ {selectedBill.paymentInfo?.paymentAmount.toFixed(2)}
            </p>
          </div>
          <div className="pharmacy-summary-item">
            <strong>Payment Type:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              {selectedBill.paymentInfo?.paymentType}
            </p>
          </div>
          <div className="pharmacy-summary-item">
            <strong>Remaining Dues:</strong>
            <p className="bill-total-box" style={{ color: "black" }}>
              ₹{" "}
              {(
                parseInt(selectedBill?.grandTotals?.finalPrice) -
                parseInt(selectedBill.paymentInfo?.paymentAmount)
              ).toFixed(2)}
            </p>
          </div>
        </div>
      </section>
      {selectedBill?.item?.some((i) => i.itemType === "all") && (
        <div>
          <section className="total-bill-last">
            <div
              className="bank-details-section"
              style={{ paddingTop: "35px" }}
            >
              <p style={{ color: "black" }}>MOU NO 2024/MED/25/1/PRAKASH</p>
              <p style={{ color: "black" }}>Dated 24-07-2024</p>
              <p style={{ color: "black" }}>Opp. Kauwa Bagh Police Station,</p>
            </div>
            <div className="bank-details-section">
              <p>
                <strong style={{ color: "black" }}>Bank Details:</strong>
              </p>
              <p style={{ color: "black" }}>Account Name: PRAKASH HOSPITAL</p>
              <p style={{ color: "black" }}>A/C No: 36539319519</p>
              <p style={{ color: "black" }}>IFSC: SBIN0018366</p>
              <p style={{ color: "black" }}>MICR Code: 273002053</p>
            </div>
          </section>
        </div>
      )}
      

      {/* <section className="bill-transaction-section">
            <h2>Transaction History</h2>
            <table className="transaction-history-table">
              <thead>
                <tr>
                  <th>Payment Type</th>
                  <th>Transaction ID</th>
                  <th>Payment Amount</th>
                  <th>Remaining Dues</th>
                </tr>
              </thead>
              <tbody>
                {bill?.length > 0 &&
                  bill.map(
                    (it, indexs) =>
                      it.transactionHistory.length > 0 &&
                      it.transactionHistory.map((item, index) => (
                        <tr key={`${indexs}-${index}`}>
                          <td>{item.paymentType}</td>
                          <td>{item.transactionId || "N/A"}</td>
                          <td>₹{item.paymentAmount}</td>
                          <td>{item.remainingDues}</td>
                        </tr>
                      ))
                  )}
              </tbody>
            </table>
          </section> */}
    </div>
  );
};

export default PharmacyBillingPrint;
