import React, { useContext, useEffect, useRef, useState } from "react";
import "../pharmacy/styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faPrint,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useReactToPrint } from "react-to-print";
import IpdBillingPrint from "../ipd/IpdBillingPrint";
import Loader from "../Loader";
// import Consumables from "./Consumables";
// import EditConsumablePopup from "./EditConsumablePopup";

const LabInvoiceList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [patientDetails, setPatientDetails] = useState({ uhid: "" });
  const [loading, setLoading] = useState(false);
  const documentRef = useRef(null);

  const printBill = useReactToPrint({
    contentRef: documentRef,
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (patientDetails.uhid) {
      // console.log("Bill Printing");
      printBill();
    }
  }, [patientDetails]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/lab/get-lab-bills`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (id, status) => {
    try {
      if (status === "IPD") {
        const res = await fetch(
          `${environment.url}/api/patient/get-patient-from-admission-id?admissionId=${id}`,
          {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          // console.log(data);
          setPatientDetails(data.patient);
        }
      } else {
        const res = await fetch(
          `${environment.url}/api/opd/${id}/get-patient-opdId`,
          {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              "Content-Type": "application/json",
              token: localStorage.getItem("token"),
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setPatientDetails(data.ptientObject);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="pharmacy-list">
      <h2>Invoices</h2>
      {/* <div className="am-head">
        <button onClick={toggleConsumablesPopup} className="add-consumable-btn">
          Add Medicine
        </button>
      </div> */}
      <hr className="am-h-line" />

      {/* Render the medications in a professional table */}
      {loading ? (
        <Loader />
      ) : (
        <table className="pharmacy-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Bill No</th>
              <th>Type</th>
              <th>Total Items</th>
              <th>Total Price</th>
              <th>Total Discount</th>
              <th>Discounted Price</th>
              <th>Paid Amount</th>
              <th>Remaining Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignedMedicines && assignedMedicines.length > 0 ? (
              assignedMedicines.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{med.billNumber || "N/A"}</td>
                  <td>{med.admissionId ? "IPD" : "OPD" || "N/A"}</td>
                  <td>{med.item?.length ?? "N/A"}</td>
                  <td>
                    {med.item
                      ?.reduce((acc, item) => acc + item.total, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    {med.item
                      ?.reduce(
                        (acc, item) => acc + (item.total - item.totalCharge),
                        0
                      )
                      .toFixed(2)}
                  </td>
                  <td>
                    {med.item
                      ?.reduce((acc, item) => acc + item.totalCharge, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    {med.transactionHistory
                      ?.reduce((acc, item) => acc + item.paymentAmount, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    {(
                      med.item?.reduce((acc, item) => acc + item.totalCharge, 0) -
                      med.transactionHistory?.reduce(
                        (acc, item) => acc + item.paymentAmount,
                        0
                      )
                    ).toFixed(2)}
                  </td>
                  <td>{med.status ?? "N/A"}</td>
                  <td className="ipd-consumable-icons" style={{display: "flex", gap: "10px"}}>
                    <FontAwesomeIcon
                      icon={faEye}
                      onClick={() => {
                        setSelectedBill(med);
                        setIsViewModalOpen(true);
                      }}
                      title="view"
                      className="icon"
                    />
                    <FontAwesomeIcon
                      icon={faPrint}
                      onClick={() => {
                        setSelectedBill(med);
                        fetchPatientDetails(
                          med.admissionId || med.opdId,
                          med.admissionId ? "IPD" : "OPD"
                        );
                      }}
                      title="print"
                      className="icon"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No Lab Test assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {isViewModalOpen && selectedBill && (
        <div className="ipd-bill-modal-overlay">
          <div className="ipd-bill-modal-content">
            <button
              type="button"
              onClick={() => {
                setSelectedBill(null);
                setIsViewModalOpen(false);
              }}
              className="opd-closeBtn"
            >
              &times;
            </button>
            <h3>Bill Details</h3>
            <div className="bill-details">
              <p>
                <strong>Bill Number:</strong> {selectedBill.billNumber}
              </p>
              <p>
                <strong>Status:</strong> {selectedBill.status}
              </p>
              <p>
                <strong>Total Charge:</strong> ₹
                {selectedBill?.grandTotals?.totalCharge}
              </p>
              <p>
                <strong>Total Discount:</strong> ₹
                {selectedBill?.grandTotals?.totalDiscount}
              </p>
              <p>
                <strong>Total After Discount:</strong> ₹
                {selectedBill?.grandTotals?.totalDiscounted}
              </p>
              <p>
                <strong>Remaining Dues:</strong> ₹
                {selectedBill.grandRemainingDues}
              </p>
            </div>
            <h4>Items</h4>
            <table className="bill-table">
              <thead>
                <tr>
                  <th>Item Type</th>
                  <th>Item Name</th>
                  <th>Charge</th>
                  <th>Quantity</th>
                  <th>Total Charge</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.item.map((it, index) => (
                  <tr key={index}>
                    <td>{it.itemType}</td>
                    <td>{it.itemName}</td>
                    <td>₹{it.charge}</td>
                    <td>{it.quantity}</td>
                    <td>₹{it.totalCharge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4>Transaction History</h4>
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Payment Type</th>
                  <th>Transaction Id</th>
                  <th>Payment Amount</th>
                  <th>Remaining Dues</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.transactionHistory.map((txn, index) => (
                  <tr key={index}>
                    <td>{txn.paymentType}</td>
                    <td>{txn.transactionId || "N/A"}</td>
                    <td>₹{txn.paymentAmount}</td>
                    <td>₹{txn.remainingDues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedBill && patientDetails && (
        <IpdBillingPrint
          patientDetails={patientDetails}
          selectedBill={selectedBill}
          printRef={documentRef}
        />
      )}
    </div>
  );
};

export default LabInvoiceList;
