import React from "react";
import hospitalImage from "../../assets/hospital.jpg";
import prakashLogo from "../../assets/prakashLogo.jpg";

const PrintablePayments = ({ payments, printRef, patientDetails }) => {
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

  // Calculate the total amount using reduce
  const totalAmount = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.paymentAmount || 0),
    0
  );

  return (
    <div
      style={{ padding: "20px" }}
      ref={printRef}
      className="ipd-bill-layout print-only"
    >
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
      <div className="bill-head">
        <h3 className="sub-header">Patient Details</h3>
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
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
              value: `${patientDetails?.age || "N/A"} / ${
                patientDetails?.gender?.toUpperCase() || "N/A"
              }`,
            },
            {
              label: "Mobile",
              value: patientDetails?.phone || "N/A",
            },
            patientDetails?.tpaCorporate?.trim() !== "" &&
            patientDetails?.tpaCorporate
              ? {
                  label: "TPA/Corporate",
                  value: patientDetails?.tpaCorporate || "N/A",
                }
              : null,
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
              value: patientDetails?.wingName?.toUpperCase() || "N/A",
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
            .filter((detail) => detail !== null) // Filter out null values (fields that are not shown)
            .map((detail, index) => (
              <div key={index} className="patient-detail">
                <div className="patient-label">{detail.label}:</div>
                <div className="patient-value">{detail.value}</div>
              </div>
            ))}
        </div>
      </div>
      <h2 style={{ textAlign: "center" }}>All Payments</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid rgba(0, 0, 0, 0.463)",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Date
            </th>
            <th
              style={{
                border: "1px solid rgba(0, 0, 0, 0.463)",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Payment ID
            </th>

            <th
              style={{
                border: "1px solid rgba(0, 0, 0, 0.463)",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Payment Type
            </th>
            <th
              style={{
                border: "1px solid rgba(0, 0, 0, 0.463)",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Transaction ID
            </th>
            <th
              style={{
                border: "1px solid rgba(0, 0, 0, 0.463)",
                padding: "8px",
                textAlign: "left",
              }}
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index}>
              <td
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.463)",
                  padding: "8px",
                }}
              >
                {formatDateToDDMMYYYY(payment.date)}
              </td>
              <td
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.463)",
                  padding: "8px",
                }}
              >
                {payment.paymentNumber}
              </td>

              <td
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.463)",
                  padding: "8px",
                }}
              >
                {payment.paymentType}
              </td>
              <td
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.463)",
                  padding: "8px",
                }}
              >
                {payment.transactionId || "N/A"}
              </td>
              <td
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.463)",
                  padding: "8px",
                }}
              >
                ₹{payment.paymentAmount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Displaying the total amount in a box, aligned with the last column */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Total Paid Amount: ₹{totalAmount.toFixed(2)}
        </div>
      </div>
      <div
        className="space-signature"
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <div className="signature-section">
          {/* <p style={{color: "black"}}>{user?.name}</p> */}
          {/* <p style={{ color: "black" }}>________________________</p> */}
          <p style={{ color: "black", marginTop: "40px" }}>
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
    </div>
  );
};

export default PrintablePayments;
