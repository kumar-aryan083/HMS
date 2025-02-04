import React, { useContext, useEffect, useRef, useState } from "react";
import Loader from "../Loader.jsx";
import { environment } from "../../../utlis/environment.js";
import { AppContext } from "../../context/AppContext.jsx";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

const LabBillReports = () => {
  const { setNotification } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [searchBillNumber, setSearchBillNumber] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchUHID, setSearchUHID] = useState(""); // ✅ New UHID Filter
  const [paymentFilter, setPaymentFilter] = useState("All");

  useEffect(() => {
    fetchPharmacyReports();
  }, []);

  const fetchData = async () => {
    // console.log("fetchData");
    fetchPharmacyReports();
  };

  const fetchPharmacyReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/laboratory-report?startDate=${startDate}&endDate=${endDate}`,
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
        // console.log("bills to render for pharmacy", data);
        setReports(data.report);
        setFilteredReports(data.report);
        setTotalAmount(data.totalAmount);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = reports;

    // ✅ Filter by Bill Number
    if (searchBillNumber) {
      filtered = filtered.filter((bill) =>
        bill.billNumber.toString().includes(searchBillNumber)
      );
    }

    // ✅ Filter by UHID
    if (searchUHID) {
      filtered = filtered.filter((bill) =>
        bill.uhid.toString().includes(searchUHID)
      );
    }

    // ✅ Correct Payment Type Filtering
    if (paymentFilter !== "All") {
      filtered = filtered.filter(
        (bill) => bill.paymentType.toLowerCase() === paymentFilter.toLowerCase()
      );
    }

    // Update Filtered Reports
    setFilteredReports(filtered);

    // Recalculate Total Amount for Filtered Results
    const filteredTotal = filtered.reduce(
      (sum, bill) => sum + bill.totalCharge,
      0
    );
    setTotalAmount(filteredTotal);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredReports].slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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
    if (filteredReports.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredReports.map((bill, index) => ({
      "#": index + 1 + (currentPage - 1) * itemsPerPage,
      Date: formatDateToDDMMYYYY(bill.date),
      Category: bill.category || "N/A",
      "Bill Number": bill.billNumber || "N/A",
      "Patient Name": bill.patientName || "N/A",
      UHID: bill.uhid || "N/A",
      "Item Name": bill.itemName || "N/A",
      Charge: bill.charge || "N/A",
      Quantity: bill.quantity || "N/A",
      "Total Charge": bill.totalCharge || "N/A",
      Discount: bill.discount || "N/A",
      "Final Price": bill.total || "N/A",
      "Payment Type": bill.paymentType || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Reports");
    XLSX.writeFile(workbook, "Lab_Reports.xlsx");
  };

  const exportToCsv = () => {
    if (filteredReports.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredReports.map((bill, index) => ({
      "#": index + 1 + (currentPage - 1) * itemsPerPage,
      Date: formatDateToDDMMYYYY(bill.date),
      Category: bill.category || "N/A",
      "Bill Number": bill.billNumber || "N/A",
      "Patient Name": bill.patientName || "N/A",
      UHID: bill.uhid || "N/A",
      "Item Name": bill.itemName || "N/A",
      Charge: bill.charge || "N/A",
      Quantity: bill.quantity || "N/A",
      "Total Charge": bill.totalCharge || "N/A",
      Discount: bill.discount || "N/A",
      "Final Price": bill.total || "N/A",
      "Payment Type": bill.paymentType || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Lab Reports");
    XLSX.writeFile(workbook, "Lab_Reports.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredReports.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text("Laboratory Reports", 14, 10);

    const tableData = filteredReports.map((bill, index) => [
      index + 1 + (currentPage - 1) * itemsPerPage,
      formatDateToDDMMYYYY(bill.date),
      bill.category || "N/A",
      bill.billNumber || "N/A",
      bill.patientName || "N/A",
      bill.uhid || "N/A",
      bill.itemName || "N/A",
      bill.charge || "N/A",
      bill.quantity || "N/A",
      bill.total || "N/A",
      bill.paymentType || "N/A",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Date",
          "Category",
          "Bill Number",
          "Patient Name",
          "UHID",
          "Item Name",
          "Charge",
          "Quantity",
          "Final Price",
          "Payment Type",
        ],
      ],
      body: tableData,
    });

    pdf.save("Laboratory_Reports.pdf");
  };

  return (
    <>
      <div className="upper-wing" style={{margin:"10px 20px"}}>
          <h2>Lab Bill Reports</h2>
          {/* <button onClick={() => setIsModalOpen(true)}>Add Test Report</button> */}
        </div>
      <div className="upper-lab" style={{ padding: "0" }}>
        <div className="accounts-date" style={{ display: "flex" }}>
          <div className="date-filters">
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label style={{ marginLeft: "20px" }}>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <button className="statistics-search" onClick={() => fetchData()}>
              Show
            </button>
          </div>
          <div style={{ display: "flex", margin: "auto 0", gap: "10px" }}>
            <div>
              <label>Bill Number:</label>
              <input
                type="text"
                value={searchBillNumber}
                onChange={(e) => setSearchBillNumber(e.target.value)}
                placeholder="Search by bill number"
              />
            </div>
            <div>
              <label>UHID:</label>
              <input
                type="text"
                value={searchUHID}
                onChange={(e) => setSearchUHID(e.target.value)}
                placeholder="Search by UHID"
              />
            </div>

            <div>
              <label>Payment Method:</label>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                style={{ height: "40px" }}
              >
                <option value="All">All</option>
                <option value="credit">Credit</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          <button
            className="statistics-search"
            style={{
              marginTop: "42px",
              width: "fit-content",
              height: "fit-content   ",
            }}
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
      <div className="lower-lab">
        {loading ? (
          <Loader />
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="total-amount">
                <strong>Total Amount: </strong>
                {totalAmount.toFixed(2)}
              </div>
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
            </div>
            <table className="lab-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Bill Number</th>
                  <th>Patient Name</th>
                  <th>UHID</th>
                  <th>Item Name</th>
                  <th>Charge</th>
                  <th>Quantity</th>
                  <th>Total Charge</th>
                  <th>Discount</th>
                  <th>Final Price</th>
                  <th>Payment Type</th>
                  {/*<th>Payment Type</th>
                   <th>Paid Amount</th>
                  <th>Remaining Price</th>
                  <th>Status</th> */}
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((bill) => (
                    <tr key={bill._id}>
                      <td>{formatDateToDDMMYYYY(bill.date)}</td>
                      <td>{bill.category}</td>
                      <td>{bill.billNumber}</td>
                      <td>{bill.patientName}</td>
                      <td>{bill.uhid}</td>
                      <td>{bill.itemName}</td>
                      <td>{bill.charge}</td>
                      <td>{bill.quantity}</td>
                      <td>{bill.total}</td>
                      <td>{bill.discount}</td>
                      <td>{bill.totalCharge}</td>
                      <td>{bill.paymentType}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" style={{ textAlign: "center" }}>
                      No Bills Available to Show
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </>
  );
};

export default LabBillReports;
