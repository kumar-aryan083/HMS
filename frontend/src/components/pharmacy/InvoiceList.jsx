import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/SuppliesrList.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faPrint,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import AddSupplier from "./AddSupplier";
import AddMedicine from "./AddMedicine";
import { useReactToPrint } from "react-to-print";
import IpdBillingPrint from "../ipd/IpdBillingPrint";
import Loader from "../Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const InVoiceList = ({ admissionId }) => {
  const { setNotification } = useContext(AppContext);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [patientDetails, setPatientDetails] = useState({ uhid: "" });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const documentRef = useRef(null);

  const printBill = useReactToPrint({
    contentRef: documentRef,
  });

  const toggleConsumablesPopup = () => {
    setIsAddSupplierOpen(!isAddSupplierOpen);
    fetchSuppliers();
  };

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
      const res = await fetch(`${environment.url}/api/pharmacy/get-all-bills`, {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setAssignedMedicines(data.item);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...assignedMedicines]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(assignedMedicines.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const exportToExcel = () => {
    if (assignedMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = assignedMedicines.map((med, index) => ({
      "#": index + 1,
      "Bill No": med.billNumber || "-",
      Type: med.admissionId ? "IPD" : "OPD" || "-",
      "Total Items": med.item?.length ?? "-",
      "Total Price": med.item
        ?.reduce((acc, item) => acc + item.totalCharge, 0)
        .toFixed(2) ||"-",
      "Total Discount": med.item
        ?.reduce((acc, item) => acc + (item.totalCharge - item.total), 0)
        .toFixed(2) ||"-",
      "Discounted Price": med.item
        ?.reduce((acc, item) => acc + item.total, 0)
        .toFixed(2) ||"-",
      "Paid Amount": med.transactionHistory
        ?.reduce((acc, item) => acc + item.paymentAmount, 0)
        .toFixed(2) ||"-",
      "Remaining Price": (
        med.item?.reduce((acc, item) => acc + item.total, 0) -
        med.transactionHistory?.reduce(
          (acc, item) => acc + item.paymentAmount,
          0
        )
      ).toFixed(2) ||"-",
      Status: med.status ?? "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rendered Invoices");
    XLSX.writeFile(workbook, "Rendered_Invoices.xlsx");
  };

  const exportToCsv = () => {
    if (assignedMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      assignedMedicines.map((med, index) => ({
        "#": index + 1,
        "Bill No": med.billNumber || "-",
        Type: med.admissionId ? "IPD" : "OPD" || "-",
        "Total Items": med.item?.length ?? "-",
        "Total Price": med.item
          ?.reduce((acc, item) => acc + item.totalCharge, 0)
          .toFixed(2) ||"-",
        "Total Discount": med.item
          ?.reduce((acc, item) => acc + (item.totalCharge - item.total), 0)
          .toFixed(2) ||"-",
        "Discounted Price": med.item
          ?.reduce((acc, item) => acc + item.total, 0)
          .toFixed(2) ||"-",
        "Paid Amount": med.transactionHistory
          ?.reduce((acc, item) => acc + item.paymentAmount, 0)
          .toFixed(2) ||"-",
        "Remaining Price": (
          med.item?.reduce((acc, item) => acc + item.total, 0) -
          med.transactionHistory?.reduce(
            (acc, item) => acc + item.paymentAmount,
            0
          )
        ).toFixed(2)  ||"-",
        Status: med.status ?? "-",
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Rendered Invoices");
    XLSX.writeFile(workbook, "Rendered_Invoices.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (assignedMedicines.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = assignedMedicines.map((med, index) => [
      index + 1,
      med.billNumber || "-",
      med.admissionId ? "IPD" : "OPD" || "-",
      med.item?.length ?? "-",
      med.item?.reduce((acc, item) => acc + item.totalCharge, 0).toFixed(2) ||"-",
      med.item
        ?.reduce((acc, item) => acc + (item.totalCharge - item.total), 0)
        .toFixed(2) ||"-",
      med.item?.reduce((acc, item) => acc + item.total, 0).toFixed(2) ||"-",
      med.transactionHistory
        ?.reduce((acc, item) => acc + item.paymentAmount, 0)
        .toFixed(2) ||"-",
      (
        med.item?.reduce((acc, item) => acc + item.total, 0) -
        med.transactionHistory?.reduce(
          (acc, item) => acc + item.paymentAmount,
          0
        )
      ).toFixed(2) ||"-",
      med.status ?? "-",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Bill No",
          "Type",
          "Total Items",
          "Total Price",
          "Total Discount",
          "Discounted Price",
          "Paid Amount",
          "Remaining Price",
          "Status",
        ],
      ],
      body: tableData,
    });

    pdf.save("Rendered_Invoices.pdf");
  };

  return (
    <div className="pharmacy-list">
      <h2>Invoices</h2>
      {/* <div className="am-head">
        <button onClick={toggleConsumablesPopup} className="add-consumable-btn">
          Add Medicine
        </button>
      </div> */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={exportToExcel}
          className="export-btn"
          style={{
            width: "fit-content",
            height: "fit-content",
            margin: "auto 0",
            // marginRight: "80px",
            fontWeight: "500",
          }}
        >
          <FontAwesomeIcon icon={faFileExcel} /> Excel
        </button>
        <button
          onClick={exportToCsv}
          style={{
            width: "fit-content",
            height: "fit-content",
            margin: "auto 0",
            // marginRight: "80px",
            fontWeight: "500",
          }}
        >
          <FontAwesomeIcon icon={faFileCsv} /> CSV
        </button>
        <button
          onClick={exportToPdf}
          style={{
            width: "fit-content",
            height: "fit-content",
            margin: "auto 0",
            // marginRight: "80px",
            fontWeight: "500",
          }}
        >
          <FontAwesomeIcon icon={faFilePdf} /> PDF
        </button>
      </div>
      <hr className="am-h-line" style={{ marginTop: "10px" }} />
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
            {currentItems && currentItems.length > 0 ? (
              currentItems.map((med, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{med.billNumber || "N/A"}</td>
                  <td>{med.admissionId ? "IPD" : "OPD" || "N/A"}</td>
                  <td>{med.item?.length ?? "N/A"}</td>
                  <td>
                    {med.item
                      ?.reduce((acc, item) => acc + item.totalCharge, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    {med.item
                      ?.reduce(
                        (acc, item) => acc + (item.totalCharge - item.total),
                        0
                      )
                      .toFixed(2)}
                  </td>
                  <td>
                    {med.item
                      ?.reduce((acc, item) => acc + item.total, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    {med.transactionHistory
                      ?.reduce((acc, item) => acc + item.paymentAmount, 0)
                      .toFixed(2)}
                  </td>
                  <td>
                    {(
                      med.item?.reduce((acc, item) => acc + item.total, 0) -
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
                  No medicine assigned yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <div className="pagination-controls">
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Prev
        </button>
        <span style={{ margin: "0 15px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
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
              X
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
                  {/* <th>Payment Type</th> */}
                  <th>Transaction Id</th>
                  <th>Payment Amount</th>
                  <th>Remaining Dues</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.transactionHistory.map((txn, index) => (
                  <tr key={index}>
                    {/* <td>{txn.paymentType}</td> */}
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

export default InVoiceList;
