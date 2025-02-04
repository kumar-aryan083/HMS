import React, { useState, useEffect, useContext } from "react";
import "./styles/IpdReports.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import Loader from "../Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileCsv,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const IpdReports = () => {
  const { user, setNotification } = useContext(AppContext);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({
    doctorName: "",
    wardName: "",
    patientName: "",
    paymentType: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  const nav = useNavigate();

  useEffect(() => {
    document.title = "IPD Reports | HMS";
    if (
      !user ||
      (user.role !== "admin")
    ) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchData = () => {
    fetchReportData();
  };

  // Handle form submission to fetch report data
  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    setLoading(true);
    // Simulate fetching data
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/get-date-wise-payment?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("ipd report data: ", data);
        setReportData(data.payments);
        setFilteredData(data.payments);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filtered = reportData.filter((row) => {
      const matchesDoctor =
        !filters.doctorName ||
        row.doctorName.toLowerCase().includes(filters.doctorName.toLowerCase());
      const matchesWard =
        !filters.wardName ||
        row.wing.name.toLowerCase().includes(filters.wardName.toLowerCase());
      const matchesPatient =
        !filters.patientName ||
        row.patientName
          .toLowerCase()
          .includes(filters.patientName.toLowerCase());
      const matchesPaymentType =
        !filters.paymentType || row.paymentType === filters.paymentType;

      return (
        matchesDoctor && matchesWard && matchesPatient && matchesPaymentType
      );
    });
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({
      doctorName: "",
      wardName: "",
      patientName: "",
      paymentType: "",
    });
    setFilteredData(reportData);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const calculateTotalPaidAmount = () => {
    return filteredData.reduce((total, row) => total + row.paymentAmount, 0);
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredData.map((row, index) => ({
      "#": index + 1,
      Date: formatDateToDDMMYYYY(row.date),
      "Patient Name": row.patientName,
      Doctor: row.doctorName,
      Ward: row.wing.name,
      "Payment Number": row.paymentNumber,
      "Paid Amount": row.paymentAmount,
      "Payment Type": row.paymentType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPD_Report");

    XLSX.writeFile(workbook, "IPD_Report.xlsx");
  };

  const exportToCsv = () => {
    if (filteredData.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredData.map((row, index) => ({
      "#": index + 1,
      Date: formatDateToDDMMYYYY(row.date),
      "Patient Name": row.patientName,
      Doctor: row.doctorName,
      Ward: row.wing.name,
      "Payment Number": row.paymentNumber,
      "Paid Amount": row.paymentAmount,
      "Payment Type": row.paymentType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IPD_Report");

    XLSX.writeFile(workbook, "IPD_Report.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredData.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = filteredData.map((row, index) => [
      index + 1,
      formatDateToDDMMYYYY(row.date),
      row.patientName,
      row.doctorName,
      row.wing.name,
      row.paymentNumber,
      row.paymentAmount,
      row.paymentType,
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Date",
          "Patient Name",
          "Doctor",
          "Ward",
          "Payment Number",
          "Paid Amount",
          "Payment Type",
        ],
      ],
      body: tableData,
    });

    pdf.save("IPD_Report.pdf");
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
  const currentItems = [...filteredData]
    .reverse()
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

  return (
    <div className="ipd-report-container">
      <h2 className="ipd-report-title">IPD Report</h2>
      <div className="ipd-report-exports">
        <div className="ipd-date-filter">
          <label className="ipd-label">
            Start Date:
            <input
              type="date"
              className="ipd-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="ipd-label">
            End Date:
            <input
              type="date"
              className="ipd-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <button className="ipd-fetch-button" onClick={fetchData}>
            Search
          </button>
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
              //   marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </button>
        </div>
      </div>
      <div className="ipd-filters">
        <label className="ipd-label">
          Doctor:
          <input
            type="text"
            name="doctorName"
            className="ipd-input"
            placeholder="Search by doctor"
            value={filters.doctorName}
            onChange={handleFilterChange}
          />
        </label>
        <label className="ipd-label">
          Ward:
          <input
            type="text"
            name="wardName"
            className="ipd-input"
            placeholder="Search by ward"
            value={filters.wardName}
            onChange={handleFilterChange}
          />
        </label>
        <label className="ipd-label">
          Patient Name:
          <input
            type="text"
            name="patientName"
            className="ipd-input"
            placeholder="Search by patient name"
            value={filters.patientName}
            onChange={handleFilterChange}
          />
        </label>
        <label className="ipd-label">
          Payment Type:
          <select
            name="paymentType"
            className="ipd-input"
            value={filters.paymentType}
            onChange={handleFilterChange}
          >
            <option value="">All</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>
        </label>
        <button className="ipd-fetch-button" onClick={applyFilters}>
          Apply Filters
        </button>
        <button className="ipd-fetch-button" onClick={clearFilters}>
          Clear Filters
        </button>
      </div>
      <hr />
      <div className="ipd-report-total-amount">
        <strong>Total Paid Amount: ₹{calculateTotalPaidAmount()}</strong>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <table className="ipd-report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Patient Name</th>
              <th>Doctor</th>
              <th>Ward</th>
              <th>Payment Number</th>
              <th>Paid Amount</th>
              <th>Payment Type</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{formatDateToDDMMYYYY(row.date)}</td>
                  <td>{row.patientName}</td>
                  <td>{row.doctorName}</td>
                  <td>{row.wing.name}</td>
                  <td>{row.paymentNumber}</td>
                  <td>{row.paymentAmount}</td>
                  <td>{row.paymentType}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="ipd-no-data">
                  No data available for the selected date range.
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
    </div>
  );
};

export default IpdReports;
