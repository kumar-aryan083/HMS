import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import "./styles/IpdBillingPrint.css";
import hospitalImage from "../../assets/hospital.jpg";
import prakashLogo from "../../assets/prakashLogo.jpg";

const IpdBillingPrint = ({
  printRef,
  patientDetails,
  selectedBill,
  isOpd,
  user,
  payments = [],
}) => {
  const { setNotification } = useContext(AppContext);
  const [currentDate, setCurrentDate] = useState("");

  // console.log("selected bill in print--- ", selectedBill);
  useEffect(() => {
    // console.log("patientDetails ", patientDetails);
    console.log("selected bill ",selectedBill)

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
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    return `${day}/${month}/${year}`;
  }
  function formatDateToDDMMYYYY2(dateString) {
    if (!dateString) {
      console.error("Invalid date string provided:", dateString);
      return "Invalid Date";
    }

    const date = new Date(dateString);

    if (isNaN(date)) {
      console.error("Failed to parse date:", dateString);
      return "Invalid Date";
    }

    const day = String(date.getDate()).padStart(2, "0"); // Local day
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Local month
    const year = date.getFullYear(); // Local year

    return `${day}/${month}/${year}`;
  }

  // Calculate totals and dues
  // Calculate the total amount using reduce
  const paidAmount = payments?.reduce(
    (sum, payment) => sum + parseFloat(payment.paymentAmount || 0),
    0
  );
  const remainingDues =
    (selectedBill?.grandTotals?.finalPrice || 0) - paidAmount;

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
          <div className="patient-detail">
            <div className="patient-label">Bill Number:</div>
            <div className="patient-value">
              {selectedBill?.billNumber || "N/A"}
            </div>
          </div>

          <div className="patient-detail">
            <div className="patient-label">Bill Date:</div>
            <div className="patient-value">
              {formatDateToDDMMYYYY2(selectedBill?.date) || "N/A"}
            </div>
          </div>

          <div className="patient-detail">
            <div className="patient-label">Patient Name:</div>
            <div className="patient-value">
              {patientDetails?.name?.toUpperCase() || "N/A"}
            </div>
          </div>

          <div className="patient-detail">
            <div className="patient-label">UHID:</div>
            <div className="patient-value">{patientDetails?.uhid || "N/A"}</div>
          </div>

          <div className="patient-detail">
            <div className="patient-label">Age/Gender:</div>
            <div className="patient-value">{`${
              patientDetails?.age || "N/A"
            } / ${patientDetails?.gender?.toUpperCase() || "N/A"}`}</div>
          </div>

          <div className="patient-detail">
            <div className="patient-label">Mobile:</div>
            <div className="patient-value">
              {patientDetails?.phone || "N/A"}
            </div>
          </div>

          {patientDetails?.tpaCorporate &&
            patientDetails?.tpaCorporate !== "" && (
              <div className="patient-detail">
                <div className="patient-label">TPA/Corporate</div>
                <div className="patient-value">
                  {patientDetails?.tpaCorporate}
                </div>
              </div>
            )}

          {patientDetails?.crnNumber && patientDetails?.crnNumber !== "" && (
            <div className="patient-detail">
              <div className="patient-label">CRN Number</div>
              <div className="patient-value">{patientDetails?.crnNumber}</div>
            </div>
          )}

          {patientDetails?.ummidCard && patientDetails?.ummidCard !== "" && (
            <div className="patient-detail">
              <div className="patient-label">UMMID Number</div>
              <div className="patient-value">{patientDetails?.ummidCard}</div>
            </div>
          )}

          {/* <div className="patient-detail">
            <div className="patient-label">Discounted By:</div>
            <div className="patient-value">
              {selectedBill?.finalDiscountBy || "N/A"}
            </div>
          </div> */}

          {patientDetails?.referenceLetter &&
            patientDetails?.referenceLetter !== "" &&
            !isOpd && (
              <div className="patient-detail">
                <div className="patient-label">Reference letter No.:</div>
                <div className="patient-value">
                  {patientDetails?.referenceLetter}
                </div>
              </div>
            )}

          <div className="patient-detail">
            <div className="patient-label">Doctor:</div>
            <div className="patient-value">
              {patientDetails?.doctorName?.toUpperCase() || "N/A"}
            </div>
          </div>

          {patientDetails?.diagnosis &&
            patientDetails?.diagnosis !== "" &&
            !isOpd && (
              <div className="patient-detail">
                <div className="patient-label">Diagnosis:</div>
                <div className="patient-value">
                  {patientDetails?.diagnosis || "N/A"}
                </div>
              </div>
            )}

          {!isOpd && (
            <div className="patient-detail">
              <div className="patient-label">Admitted Ward:</div>
              <div className="patient-value">{`${
                patientDetails?.wingName?.toUpperCase() || "N/A"
              }`}</div>
            </div>
          )}

          <div className="patient-detail">
            <div className="patient-label">
              {isOpd ? "Appointment Date:" : "Admission Date:"}
            </div>
            <div className="patient-value">
              {isOpd
                ? patientDetails?.appointmentDate
                  ? formatDateToDDMMYYYY(patientDetails?.appointmentDate)
                  : "N/A"
                : patientDetails?.admissionDate
                ? formatDateToDDMMYYYY(patientDetails?.admissionDate)
                : "N/A"}
            </div>
          </div>

          {!isOpd && (
            <div className="patient-detail">
              <div className="patient-label">Discharge Date:</div>
              <div className="patient-value">
                {patientDetails?.dischargeDate
                  ? formatDateToDDMMYYYY(patientDetails?.dischargeDate)
                  : "N/A"}
              </div>
            </div>
          )}
        </div>
      </div>

      <section className="bill-items-section">
        <h2 className="sub-header">Bill Items</h2>
        <table className="bill-items-table">
          <thead style={{ display: "none" }}>
            <tr>
              <th>Item Date</th>
              <th>Item Name</th>
              <th>Code</th>
              <th>Charge</th>
              <th>Quantity</th>
              <th>Total Charge</th>
              <th>Discount</th>
              <th>Discounted Price</th>
            </tr>
          </thead>
          <thead>
            <tr>
              <th>Item Date</th>
              <th>Item Name</th>
              <th>Code</th>
              <th>Charge</th>
              <th>Quantity</th>
              <th>Total Charge</th>
              <th>Discount</th>
              <th>Discounted Price</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(selectedBill?.groupedItems || {})
              .sort(([keyA], [keyB]) => {
                // Define custom order for keys
                const order = {
                  "operations": 1,
                  "ipd rate": 2,
                  "visiting doctor": 3,
                  "service": 4,
                  "lab test": 5,
                  "pharmacy": 6,
                };

                // Get order value for each key, default to a high number for unknown keys
                const orderA = order[keyA.toLowerCase()] || 999;
                const orderB = order[keyB.toLowerCase()] || 999;

                // Sort by custom order (lower numbers come first)
                return orderA - orderB;
              })
              .map(([key, items]) => (
                <React.Fragment key={key}>
                  {!isOpd && (
                    <tr>
                      <th
                        colSpan="8"
                        style={{
                          textAlign: "left",
                          fontWeight: "bold",
                          backgroundColor: "transparent",
                          color: "black",
                        }}
                      >
                        {key.toUpperCase()}
                      </th>
                    </tr>
                  )}
                  {items.map((item, index) => (
                    <tr key={`${key}-${index}`}>
                      <td>{formatDateToDDMMYYYY(item.itemDate)}</td>
                      <td>{item.itemName}</td>
                      <td>{item.railwayCode}</td>
                      <td>₹{item.charge.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>₹{item.total.toFixed(2)}</td>
                      <td>{item.discount}%</td>
                      <td>₹{item.totalCharge.toFixed(2)}</td>
                    </tr>
                  ))}
                  {!isOpd && (
                    <tr>
                      <td colSpan="6"></td>
                      <td
                        colSpan="2"
                        style={{ textAlign: "center", fontWeight: "bold" }}
                      >
                        PRICE: ₹
                        {items
                          ?.reduce((acc, i) => acc + i.totalCharge, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </section>

      <section className="bill-summary-section">
        {!isOpd ? (
          <>
            <div className="summary-info">
              <div className="summary-item">
                <strong>Total Charge:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.totalCharge.toFixed(2)}
                </p>
              </div>
              <div className="summary-item">
                <strong>Total Discount:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.totalDiscount.toFixed(2)}
                </p>
              </div>
              <div className="summary-item">
                <strong>Discounted Price:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.totalDiscounted.toFixed(2)}
                </p>
              </div>
              <div className="summary-item">
                <strong>Final Discount:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.finalDiscount.toFixed(2)}
                </p>
              </div>
              {selectedBill?.finalDiscountBy && (
                <div className="summary-item">
                  <strong>Discounted By:</strong>
                  <p className="bill-total-box">
                    {selectedBill?.finalDiscountBy}
                  </p>
                </div>
              )}
              <div className="summary-item">
                <strong>Final Price:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.finalPrice.toFixed(2)}
                </p>
              </div>
              <div className="summary-item">
                <strong>Paid Amount:</strong>
                <p className="bill-total-box">₹ {paidAmount.toFixed(2)}</p>
              </div>
              <div className="summary-item">
                <strong>Remaining Dues:</strong>
                <p className="bill-total-box">₹ {remainingDues.toFixed(2)}</p>
              </div>
            </div>
            <p style={{ margin: "10px", fontWeight: "bold" }}>
              <strong>Total in Words:</strong>{" "}
              {numberToWords(
                Math.ceil(
                  selectedBill?.grandTotals?.finalPrice -
                    selectedBill?.transactionHistory?.reduce(
                      (sum, obj) => sum + (obj?.paymentAmount || 0),
                      0
                    )
                )
              )}{" "}
              rupees
            </p>
          </>
        ) : (
          <div className="opd-layout">
            <div
              className="space-signature"
              style={{
                width: "70%",
                justifyContent: "space-around",
                alignItems: "end",
              }}
            >
              <div className="signature-section">
                <p style={{ color: "black", textAlign: "center" }}>
                  {user?.name}
                </p>
                <p>
                  <strong style={{ color: "black" }}>
                    Authorized Signatory
                  </strong>
                </p>
              </div>
              <div className="signature-section">
                <p style={{ color: "black" }}></p>
                <p style={{ color: "black", marginTop: "40px" }}>
                  <strong style={{ color: "black" }}>Patient Signature</strong>
                </p>
              </div>
            </div>
            <div className="summary-info">
              <div className="summary-item">
                <strong>Discounted Price:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.totalDiscounted.toFixed(2)}
                </p>
              </div>

              <div className="summary-item">
                <strong>Final Discount:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.finalDiscount.toFixed(2)}
                </p>
              </div>
              {selectedBill?.finalDiscountBy && (
                <div className="summary-item">
                  <strong>Discounted By:</strong>
                  <p className="bill-total-box">
                    {selectedBill?.finalDiscountBy}
                  </p>
                </div>
              )}

              <div className="summary-item">
                <strong>Final Price:</strong>
                <p className="bill-total-box">
                  ₹ {selectedBill?.grandTotals?.finalPrice.toFixed(2)}
                </p>
              </div>
              <div className="summary-item">
                <strong>Paid Amount:</strong>
                <p className="bill-total-box">
                  ₹{" "}
                  {selectedBill?.transactionHistory[0]?.paymentAmount.toFixed(
                    2
                  )}
                </p>
              </div>
              <div className="summary-item">
                <strong>Payment Type:</strong>
                <p className="bill-total-box">
                  {selectedBill?.transactionHistory[0]?.paymentType}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* <section className="bill-summary-section">
        <div className="summary-info">
          {!isOpd && (
            <div className="summary-item">
              <strong>Total Charge:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.totalCharge.toFixed(2)}
              </p>
            </div>
          )}
          {!isOpd && (
            <div className="summary-item">
              <strong>Total Discount:</strong>
              <p className="bill-total-box">
                ₹ {selectedBill?.grandTotals?.totalDiscount.toFixed(2)}
              </p>
            </div>
          )}
          <div className="summary-item">
            <strong>Discounted Price:</strong>
            <p className="bill-total-box">
              ₹ {selectedBill?.grandTotals?.totalDiscounted.toFixed(2)}
            </p>
          </div>

          <div className="summary-item">
            <strong>Final Discount:</strong>
            <p className="bill-total-box">
              ₹ {selectedBill?.grandTotals?.finalDiscount.toFixed(2)}
            </p>
          </div>
          {selectedBill?.finalDiscountBy && (
            <div className="summary-item">
              <strong>Discounted By:</strong>
              <p className="bill-total-box">{selectedBill?.finalDiscountBy}</p>
            </div>
          )}

          <div className="summary-item">
            <strong>Final Price:</strong>
            <p className="bill-total-box">
              ₹ {selectedBill?.grandTotals?.finalPrice.toFixed(2)}
            </p>
          </div>
          <div className="summary-item">
            <strong>Paid Amount:</strong>
            {isOpd ? (
              <p className="bill-total-box">
                ₹{" "}
                {selectedBill?.transactionHistory[0]?.paymentAmount.toFixed(2)}
              </p>
            ) : (
              <p className="bill-total-box">₹ {paidAmount.toFixed(2)}</p>
            )}
          </div>
          {isOpd && (
            <div className="summary-item">
              <strong>Payment Type:</strong>
              <p className="bill-total-box">
                {selectedBill?.transactionHistory[0]?.paymentType}
              </p>
            </div>
          )}
          {!isOpd && (
            <div className="summary-item">
              <strong>Remaining Dues:</strong>
              {<p className="bill-total-box">₹ {remainingDues.toFixed(2)}</p>}
            </div>
          )}
        </div>
        {!isOpd && (
          <p style={{ margin: "10px", fontWeight: "bold" }}>
            <strong>Total in Words:</strong>{" "}
            {numberToWords(
              Math.ceil(
                selectedBill?.grandTotals?.finalPrice -
                  selectedBill?.transactionHistory?.reduce(
                    (sum, obj) => sum + (obj?.paymentAmount || 0),
                    0
                  )
              )
            )}{" "}
            rupees
          </p>
        )}
      </section> */}
      {selectedBill?.item?.some((i) => i.itemType === "all") && (
        <div>
          <section className="total-bill-last">
            <div
              className="bank-details-section"
              style={{ paddingTop: "35px" }}
            >
              <p style={{ color: "black" }}>AGREEMENT (MOU) NO.</p>
              <p style={{ color: "black" }}>2024/Med/184/1/</p>
              <p style={{ color: "black" }}>New Prakash dated</p>
              <p style={{ color: "black" }}>27/06/2024</p>
            </div>
            <div className="bank-details-section">
              <p>
                <strong style={{ color: "black" }}>Bank Details:</strong>
              </p>
              <p style={{ color: "black" }}>
                Account Name: PRAKASH SURGICAL CLINIC
              </p>
              <p style={{ color: "black" }}>Account No: 50200070556658</p>
              <p style={{ color: "black" }}>BANK NAME: HDFC BANK</p>
              <p style={{ color: "black" }}>IFSC CODE: HDFC0000721</p>
            </div>
          </section>
        </div>
      )}
      {!isOpd && (
        <div className="space-signature">
          <div className="signature-section">
            <p style={{ color: "black", textAlign: "center" }}>{user?.name}</p>
            <p>
              <strong style={{ color: "black" }}>Authorized Signatory</strong>
            </p>
          </div>
          <div className="signature-section">
            <p style={{ color: "black" }}></p>
            <p style={{ color: "black", marginTop: "40px" }}>
              <strong style={{ color: "black" }}>Patient Signature</strong>
            </p>
          </div>
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

export default IpdBillingPrint;
