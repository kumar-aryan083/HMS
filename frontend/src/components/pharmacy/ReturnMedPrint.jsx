import React, { useContext, useEffect, useRef, useState } from "react";
import hospitalImage from "../../assets/hospital.jpg";
import { AppContext } from "../../context/AppContext";

const ReturnMedPrint = ({ printRef, selectedBill }) => {
  const { setNotification } = useContext(AppContext);
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
  
    if (num === null || num === undefined) return "zero";
  
    const [integerPart, decimalPart] = num.toString().split(".");
  
    let words = convert(parseInt(integerPart)) + " rupees";
    if (decimalPart) {
      const decimalNumber = parseInt(decimalPart);
      if (decimalNumber > 0) {
        words +=
          " and " + convert(decimalNumber) + " paise";
      }
    }
  
    return words;
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

   // Calculate medicine totals
   const totalAmount = selectedBill?.medicines?.reduce(
    (acc, med) => acc + (med.amount || 0),
    0
  );

  return (
    <div className="ipd-bill-layout print-content print-only" ref={printRef}>
      <div className="total-bill-image-container">
        <img src={hospitalImage} alt="Hospital" className="ds-hospital-image" />
      </div>

      <hr />

        <h3>Returned Medicine Bill</h3>
      <div className="bill-head">
        <h3 className="sub-header">Patient Details</h3>
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            { label: "Patient Name", value: selectedBill?.patientName },
            {
              label: "Return Date",
              value: formatDateToDDMMYYYY(selectedBill.returnDate || ""),
            },
          ].map((detail, index) => (
            <div key={index} className="patient-detail">
              <div className="patient-label">{detail.label}:</div>
              <div className="patient-value">{detail.value}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="bill-items-section">
        <h2 className="sub-header">Medicine Details</h2>
        <table className="bill-items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicine Name</th>
              <th>Batch Number</th>
              <th>Expiry</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {selectedBill?.medicines?.map((medicine, index) => (
              <tr key={medicine._id}>
                <td>{index + 1}</td>
                <td>{medicine.name}</td>
                <td>{medicine.batchNumber}</td>
                <td>{medicine.expiry}</td>
                <td>{medicine.quantity}</td>
                <td>₹{medicine.sellPrice.toFixed(2)}</td>
                <td>₹{medicine.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="pharmacy-bill-summary-section" style={{marginTop: "20px"}}>
        <div className="pharmacy-bill-words">
          <p style={{ fontWeight: "bold" }}>
            <strong>Total in Words:</strong> {numberToWords(totalAmount)}
            only
          </p>
        </div>
        <div className="pharmacy-summary-info">
          <div className="pharmacy-summary-item" style={{justifyContent: "center"}}>
            <strong>Total Amount:</strong>
            <p className="bill-total-box">₹{totalAmount?.toFixed(2)}</p>
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
              <p>MOU NO 2024/MED/25/1/PRAKASH</p>
              <p>Dated 24-07-2024</p>
              <p>Opp. Kauwa Bagh Police Station,</p>
            </div>
            <div className="bank-details-section">
              <p>
                <strong>Bank Details:</strong>
              </p>
              <p>Account Name: PRAKASH HOSPITAL</p>
              <p>A/C No: 36539319519</p>
              <p>IFSC: SBIN0018366</p>
              <p>MICR Code: 273002053</p>
            </div>
          </section>
        </div>
      )}
      <div className="space-signature" style={{display: "flex",justifyContent: "end"}}>
        <div className="signature-section" >
          <p>________________________</p>
          <p>
            <strong>Authorized Signatory</strong>
          </p>
        </div>
        {/* <div className="signature-section">
          <p>__________________________________</p>
          <p>
            <strong>Patient/Attendant Signatory</strong>
          </p>
        </div> */}
      </div>

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

export default ReturnMedPrint;
