import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faEye,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import Loader from "../Loader.jsx";
import "./styles/PharmacyStatistics.css";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const PharmacyStatistics = () => {
  const { setNotification } = useContext(AppContext);
  const [stats, setStats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [grandTotal, setGrandTotal] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedStat, setSelectedStat] = useState(null); // Store selected stat
  const [detailedStats, setDetailedStats] = useState(null); // Store detailed stats for modal

  const editRef = useRef();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    if (!startDate || !endDate) {
      setNotification({
        message: "Please select start and end dates",
        type: "error",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/pharmacy/get-med-stats?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("All statistics: ", data);
        setStats(data.stats);
        setGrandTotal(data.grandTotal);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleFetch = () => {
    // console.log("start date", startDate);
    // console.log("end date", endDate);
    setCurrentPage(1);
    fetchStatistics();
    // setStartDate("");
    // setEndDate("");
  };

  const handleViewClick = async (stat) => {
    setSelectedStat(stat);
    setShowModal(true); // Show the modal when "view" is clicked
    // console.log(stat);
    try {
      // Fetch additional details for the selected stat using its id
      const res = await fetch(
        `${environment.url}/api/pharmacy/get-med-stats-by-id/${stat.itemId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("details:", data);
        setDetailedStats(data.stats); // Set the detailed stats
      }
    } catch (error) {
      console.log("Error fetching details:", error);
    }
  };

  const closeModal = () => {
    setShowModal(false); // Close the modal
    setDetailedStats(null); // Clear the detailed stats
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...stats]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(stats.length / itemsPerPage);

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
    if (stats.length === 0) {
      setNotification("No data available to export.");
      return;
    }
  
    const worksheetData = stats.map((stat, index) => ({
      "#": index + 1,
      "Name": stat.name || "-",
      "Expiry Date": stat.expiryDate || "-",
      "Stock Quantity": stat.stockQuantity || "-",
      "Buy Price": stat.buyPrice || "-",
      "Sell Price": stat.price || "-",
      "Sold": stat.quantity || "-",
      "Total Price": stat.totalPrice || "-",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pharmacy Statistics");
    XLSX.writeFile(workbook, "Pharmacy_Statistics.xlsx");
  };
  
  const exportToCsv = () => {
    if (stats.length === 0) {
      setNotification("No data available to export.");
      return;
    }
  
    const worksheetData = stats.map((stat, index) => ({
      "#": index + 1,
      "Name": stat.name || "-",
      "Expiry Date": stat.expiryDate || "-",
      "Stock Quantity": stat.stockQuantity || "-",
      "Buy Price": stat.buyPrice || "-",
      "Sell Price": stat.price || "-",
      "Sold": stat.quantity || "-",
      "Total Price": stat.totalPrice || "-",
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pharmacy Statistics");
    XLSX.writeFile(workbook, "Pharmacy_Statistics.csv", { bookType: "csv" });
  };
  
  const exportToPdf = () => {
    if (stats.length === 0) {
      setNotification("No data available to export.");
      return;
    }
  
    const pdf = new jsPDF();
    pdf.text("Pharmacy Statistics", 14, 10);
  
    const tableData = stats.map((stat, index) => [
      index + 1,
      stat.name || "-",
      stat.expiryDate || "-",
      stat.stockQuantity || "-",
      stat.buyPrice || "-",
      stat.price || "-",
      stat.quantity || "-",
      stat.totalPrice || "-",
    ]);
  
    pdf.autoTable({
      head: [["#", "Name", "Expiry Date", "Stock Quantity", "Buy Price", "Sell Price", "Sold", "Total Price"]],
      body: tableData,
    });
  
    pdf.save("Pharmacy_Statistics.pdf");
  };
  

  return (
    <>
      <div style={{ margin: "30px" }}>
        <div className="upper-wing">
          <h2>Statistics</h2>
          {/* <button onClick={() => setIsModalOpen(true)}>Add Nursing</button> */}
        </div>
        <div className="top-bar-stats">
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
            <button className="statistics-search" onClick={handleFetch}>
              Show
            </button>
          </div>
          <div style={{ display: "flex", gap: "10px", paddingTop: "20px" }}>
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
          <div className="stats-gt">
            <strong>GrandTotal: </strong>
            <p>{grandTotal ? grandTotal : "N/A"}</p>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="lower-wing">
            <table className="wing-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Expiry Date</th>
                  <th>Stock Quantity</th>
                  <th>Buy Price</th>
                  <th>Sell Price</th>
                  <th>Sold</th>
                  <th>Total Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((stat) => (
                    <tr key={stat._id}>
                      <td>{stat.name}</td>
                      <td>{stat.expiryDate}</td>
                      <td>{stat.stockQuantity}</td>
                      <td>{stat.buyPrice}</td>
                      <td>{stat.price}</td>
                      <td>{stat.quantity}</td>
                      <td>{stat.totalPrice}</td>
                      <td>
                        <FontAwesomeIcon
                          icon={faEye}
                          title="open"
                          className="all-ipds-icon"
                          onClick={() => handleViewClick(stat)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No Stats item Available to Show
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-controls">
          <button onClick={handlePrevPage} disabled={currentPage === 1}>
            Prev
          </button>
          <span style={{ margin: "0 15px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal for detailed stat view */}
      {showModal && selectedStat && (
        <div className="pharmacy-modal-overlay">
          <div className="pharmacy-modal-content">
            <h3>Detailed Information</h3>
            <div className="top-border">
              <div className="patient-details-container">
                {[
                  {
                    label: "Name",
                    value: selectedStat.name,
                  },
                  {
                    label: "Expiry",
                    value: selectedStat.expiryDate,
                  },
                  {
                    label: "Stock Quantity",
                    value: selectedStat.stockQuantity,
                  },
                  { label: "Buy Price", value: selectedStat.buyPrice },
                  { label: "Sell Price", value: selectedStat.price },
                  { label: "Sold", value: selectedStat.quantity },
                  {
                    label: "Total Price",
                    value: selectedStat.totalPrice,
                  },
                ].map((detail, index) => (
                  <div key={index} className="patient-detail">
                    <div className="patient-label">{detail.label}:</div>
                    <div className="patient-value">{detail.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <h3>Item Details</h3>
            <table className="detailed-stats-table">
              <thead>
                <tr>
                  {/* <th>Item Name</th> */}
                  <th>Bill Number</th>
                  <th>Bill Type</th>
                  <th>Charge</th>
                  <th>Quantity</th>
                  <th>Total Charge</th>
                  <th>Discount</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detailedStats && detailedStats.length > 0 ? (
                  detailedStats.map((detail, index) => (
                    <tr key={index}>
                      {/* <td>{detail.itemName}</td> */}
                      <td>{detail.billNumber}</td>
                      <td>{detail.billType}</td>
                      <td>{detail.charge}</td>
                      <td>{detail.quantity}</td>
                      <td>{detail.totalCharge}</td>
                      <td>{detail.discount}</td>
                      <td>{detail.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No details available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <button className="opd-closeBtn" onClick={closeModal}>
              X
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PharmacyStatistics;
