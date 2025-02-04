import React, { useEffect, useState } from "react";
import "./styles/IpdTotalBillingPrint.css";
import hospitalImage from "../../assets/hospital.jpg";

const IpdTotalBillingPrint = ({
  bill,
  printNRef,
  patientDetails,
  billingItem,
}) => {
  const [currentDate, setCurrentDate] = useState("");
  const [totalInWords, setTotalInWords] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);
  // console.log("bill in total: ", bill);

  useEffect(() => {
    // console.log("patient details", patientDetails);
    // Set the current date when the component loads
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setCurrentDate(formattedDate);
  }, []);

  const calculateTotalPerCategory = (items) => {
    return items?.reduce((sum, item) => sum + (item.totalCharge || 0), 0);
  };
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

  useEffect(() => {
    const totalCharge = bill?.reduce(
      (sum, obj) =>
        sum + obj.item.reduce((acc, amt) => acc + (amt.totalCharge || 0), 0),
      0
    );

    const totalPaid = bill?.reduce(
      (sum, obj) =>
        sum +
        obj.transactionHistory.reduce(
          (acc, amt) => acc + (amt.paymentAmount || 0),
          0
        ),
      0
    );

    setPaidAmount(totalPaid);

    const remainingAmount =
      bill?.reduce(
        (sum, obj) =>
          sum + obj.item.reduce((acc, amt) => acc + (amt.total || 0), 0),
        0
      ) -
      bill?.reduce(
        (sum, obj) =>
          sum +
          obj.transactionHistory.reduce(
            (acc, amt) => acc + (amt.paymentAmount || 0),
            0
          ),
        0
      );
    setTotalInWords(numberToWords(remainingAmount));
  }, [bill]);

  return (
    <div className="ipd-bill-layout print-only" ref={printNRef}>
      <div className="total-bill-image-container">
        <img
          src={hospitalImage}
          alt="Hospital"
          className="total-hospital-image"
        />
      </div>

      <hr />
      
      {/* Patient Details */}
      <h3 className="sub-header">Patient Details</h3>
      <div className="patient-details-container">
        {[
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

      <section className="bill-items-section">
        <h2 className="sub-header">Bill Items</h2>
        <table className="bill-items-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Code</th>
              <th>Charge</th>
              <th>Quantity</th>
              <th>Total Price </th>
              <th>Total Discount</th>
              <th>Payable Price</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(billingItem || {}).map(([key, items]) => (
              <React.Fragment key={key}>
                {/* Render key as a header */}
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
                {/* Render items under the header */}
                {items?.map((item, index) => (
                  <tr key={`${key}-${index}`}>
                    <td>{item.itemName}</td>
                    <td>{item.railwayCode}</td>
                    <td>₹{item.charge}</td>
                    <td>{item.quantity}</td>
                    <td>₹totalBeforeDiscount</td>
                    <td>₹totalDiscount</td>
                    <td>₹totalAfterDiscount</td>
                  </tr>
                ))} 
                {/* Category Total Row */}
                <tr>
                  <td colSpan="5"></td>
                  <td
                    colSpan="2"
                    style={{ textAlign: "left", fontWeight: "bold" }}
                  >
                    Total {key} Charges: ₹{calculateTotalPerCategory(items)}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bill-summary-section">
        <h2 className="sub-header">Summary</h2>
        <div className="summary-info">
          <p>
            <strong>Total Charge:</strong> ₹
            {bill?.reduce(
              (sum, obj) => sum + (obj.grandTotals?.totalCharge || 0),
              0
            )}
          </p>
          <p>
            <strong>Total Discount:</strong> ₹
            {bill?.reduce(
              (sum, obj) => sum + (obj.grandTotals?.totalDiscount || 0),
              0
            )}
          </p>
          <p>
            <strong>Discounted Price:</strong> ₹
            {bill?.reduce(
              (sum, obj) => sum + (obj.grandTotals?.totalDiscount || 0),
              0
            )}
          </p>
          <p>
            <strong>Final Discount:</strong> ₹
            final discount
          </p>
          
          <p>
            <strong>Payable Amount:</strong> ₹
            {bill?.reduce(
              (sum, obj) => sum + (obj.grandTotals?.totalDiscounted || 0),
              0
            )}
          </p>
          <p>
            <strong>Total Paid Amount:</strong> ₹{paidAmount}
          </p>
          <p>
            <strong>Remaining Dues:</strong> ₹
            {bill?.reduce(
              (sum, obj) => sum + (obj.grandTotals?.totalDiscounted || 0),
              0
            ) - paidAmount}
          </p>
        </div>
        <p style={{ margin: "10px" }}>
          <strong>Total in Words:</strong> {totalInWords} rupees
        </p>
      </section>
      <section className="total-bill-last">
        <div className="bank-details-section">
          <p>MOU NO 2024/MED/25/1/FATIMA</p>
          <p>Dated 24-07-2024</p>
          <p>BETWEEN MD RAILWAY HOSPITAL. GKP,</p>
          <p>& DIRECTOR FATIMA HOSPITAL. GKP,</p>
          <p>(8-02-24 TO 07-02-25)</p>
        </div>
        <div className="bank-details-section">
          <p>
            <strong>Bank Details:</strong>
          </p>
          <p>Account Name: FATIMA HOSPITAL</p>
          <p>A/C No: 36539319519</p>
          <p>IFSC: SBIN0018366</p>
          <p>MICR Code: 273002053</p>
        </div>
      </section>

      <div className="space-signature">
        <div className="signature-section">
          <p>________________________</p>
          <p>
            <strong>Authorized Signatory</strong>
          </p>
        </div>
        <div className="signature-section">
          <p>__________________________________</p>
          <p>
            <strong>Patient/Attendant Signatory</strong>
          </p>
        </div>
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

export default IpdTotalBillingPrint;
