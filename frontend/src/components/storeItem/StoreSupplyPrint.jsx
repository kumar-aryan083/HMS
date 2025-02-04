import React from "react";
import hospitalImage from "../../assets/hospital.jpg";
import './styles/StoreSupplyPrint.css'

const StoreSupplyPrint = ({ printSupplyRef, storeSupply, user }) => {
  function formatDateToDDMMYYYY(dateString) {
    const datePart = dateString?.split("T")[0];
  const date = new Date(datePart);

  if (isNaN(date)) {
    throw new Error("Invalid date");
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
  }

  return (
    <div
      ref={printSupplyRef}
      className="ipd-bill-layout print-content print-only"
    >
      <div className="total-bill-image-container">
        <img src={hospitalImage} alt="Hospital" className="ds-hospital-image" />
      </div>

      <hr />
      <div className="supply-print-heading">
        <h3>Stock Supply Receipt</h3>
      </div>

      <div className="bill-head">
        {/* <h3 className="sub-header">Patient Details</h3> */}
      </div>
      <div className="top-border">
        <div className="patient-details-container">
          {[
            { label: "Receiver Name", value: storeSupply?.receiverId?.name },
            {
              label: "Supply Voucher No",
              value: storeSupply?.voucherNo,
            },
            {
              label: "Department Name",
              value: storeSupply?.departmentName,
            },
            {
                label: "Date",
                value: storeSupply?.createdAt ? formatDateToDDMMYYYY(storeSupply?.createdAt) : "N/A",
            },
            { label: "Contact No.", value: storeSupply?.phone },
            { label: "Comp. Operator", value: user?.name },
          ].map((detail, index) => (
            <div key={index} className="patient-detail">
              <div className="patient-label">{detail.label}:</div>
              <div className="patient-value">{detail.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div >
        <table className="print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item Name</th>
              <th>Code</th>
              <th>Category</th>
              <th>Quantity</th>
              {/* <th>Rate</th>
              <th>GST</th>
              <th>MRP</th> */}
            </tr>
          </thead>
          <tbody>
            {storeSupply?.items?.map((item, index) => (
              <tr key={item._id}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.code}</td>
                <td>{item.categoryName}</td>
                <td>{item.quantity}</td>
                {/* <td>{item.rate}</td>
                <td>{item.gst}%</td>
                <td>{item.mrp}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-signature">
        <div className="signature-section">
          <p>________________________</p>
          <p>
            <strong>Receiver Signature</strong>
          </p>
        </div>
        <div className="signature-section">
          <p>__________________________________</p>
          <p>
            <strong>Authorised Signatory</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreSupplyPrint;
