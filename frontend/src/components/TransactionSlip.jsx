import React from "react";
import "./styles/TransactionSlip.css";
import hospitalImage from "../assets/hospital.jpg";

const TransactionSlip = ({ payRef, selectedBill, patientDetails }) => {
  // const transaction = {
  //     paymentType: 'cash',
  //     paymentAmount: 100,
  //     remainingDues: '0.00',
  //     transactionId: 'TRX987654321'
  //   };

  const billNumber = 1;

  return (
    <div ref={payRef} className="ipd-billing-print print-only">
      {/* Header */}
      <div className="bill-image-container">
        <img src={hospitalImage} alt="Hospital" className="hospital-image" />
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
      <div className="patient-details-container">
        {[
          { label: "Bill Number", value: selectedBill?.billNumber },
          {
            label: "Bill Date",
            value: new Date(selectedBill?.date)?.toLocaleDateString(),
          },
          { label: "Patient Name", value: patientDetails?.name },
          { label: "UHID", value: patientDetails?.uhid },
          { label: "Email", value: patientDetails?.email },
          { label: "Gender", value: patientDetails?.gender },
          { label: "Mobile", value: patientDetails?.phone },
          { label: "Height", value: `${patientDetails?.height} cm` },
          { label: "Weight", value: `${patientDetails?.weight} kg` },
          { label: "Blood Group", value: patientDetails?.bloodGroup },
          { label: "Age", value: `${patientDetails?.age} years` },
          { label: "Aadhar Number", value: patientDetails?.aadhar },
          {
            label: "Admission Date",
            value: patientDetails?.admissionDate
              ? new Date(patientDetails.admissionDate).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )
              : "N/A",
          },
          { label: "CRN Number", value: patientDetails?.crnNumber },
          { label: "UMMID Number", value: patientDetails?.ummidCard },
          {
            label: "Reference letter No.",
            value: patientDetails?.referenceLetter,
          },
        ].map((detail, index) => (
          <div key={index} className="patient-detail">
            <div className="patient-label">{detail.label}:</div>
            <div className="patient-value">{detail.value}</div>
          </div>
        ))}
      </div>

      {/* Billing Details */}
      <section className="bill-items-section">
        <h2 className="sub-header">Payment Ledger</h2>
        {selectedBill && selectedBill.item ? (
          <table className="bill-items-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Payment Type</th>
                <th>Payment Amount</th>
                <th>Transaction Id</th>
                <th>Remaining Due</th>
              </tr>
            </thead>
            <tbody>
              {/* {selectedBill.transactionHistory.map((item, index) => ( */}
              <tr key={0}>
                <td>
                  {new Date(
                    selectedBill?.transactionHistory[
                      selectedBill?.transactionHistory?.length - 1 || 0
                    ]?.date
                  ).toLocaleDateString()}
                </td>
                <td>
                  {selectedBill?.transactionHistory[
                    selectedBill?.transactionHistory?.length - 1 || 0
                  ]?.paymentType || "N/A"}
                </td>
                <td>
                  {selectedBill?.transactionHistory[
                    selectedBill?.transactionHistory?.length - 1 || 0
                  ]?.paymentAmount || "0"}
                </td>
                <td>
                  {selectedBill?.transactionHistory[
                    selectedBill?.transactionHistory?.length - 1 || 0
                  ]?.transactionId || "N/A"}
                </td>
                <td>
                  ₹
                  {parseFloat(
                    selectedBill?.transactionHistory[
                      selectedBill?.transactionHistory?.length - 1 || 0
                    ]?.remainingDues
                  )?.toFixed(2) || "0"}
                </td>
              </tr>
              {/* ))} */}
            </tbody>
          </table>
        ) : (
          <p>No billing details available.</p>
        )}

        <div className="bill-summary-section">
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
        </div>
      </section>

      <hr />

      {/* Footer */}
      <div className="footer">
        <p>Thank you for choosing our hospital. Wishing you good health!</p>
      </div>
    </div>
  );
};

export default TransactionSlip;
