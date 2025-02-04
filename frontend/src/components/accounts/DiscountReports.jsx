import React, { useContext, useEffect, useState } from "react";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";
import "./styles/DiscountReports.css";
import * as XLSX from "xlsx"; // For Excel and CSV
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // Plugin for tables in PDF

const DiscountReports = () => {
  const { setNotification } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/common/get-final-discount-report?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setReports(data.totalItems);
        setFilteredReports(data.totalItems);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  function formatDateToDDMMYYYY(dateString) {
    const date = new Date(dateString);

    if (isNaN(date)) {
      throw new Error("Invalid date");
    }

    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  }

  const getExportData = () => {
    return filteredReports.map((item) => ({
      Date: formatDateToDDMMYYYY(item.date),
      Category: item.category,
      Operator: item.user,
      "Operator Role": item.userRole,
      "Discount By": item.finalDiscountBy,
      "Final Discount": item.grandTotals.finalDiscount,
    }));
  };

  // Export as Excel
  const exportExcel = () => {
    const exportData = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DiscountReports");
    XLSX.writeFile(workbook, `DiscountReports_${startDate}_to_${endDate}.xlsx`);
  };

  // Export as CSV
  const exportCSV = () => {
    const exportData = getExportData();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `DiscountReports_${startDate}_to_${endDate}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export as PDF
  const exportPDF = () => {
    const exportData = getExportData();
    const doc = new jsPDF();
    const tableColumn = Object.keys(exportData[0]); // Get column headers from the first row
    const tableRows = exportData.map((item) => Object.values(item)); // Convert objects to arrays
  
    doc.text("Discount Reports", 14, 15);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save(`DiscountReports_${startDate}_to_${endDate}.pdf`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...filteredReports]
    .slice(indexOfFirstItem, indexOfLastItem);
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

  const totalFinalDiscount = filteredReports.reduce(
    (sum, item) => sum + (item.grandTotals.finalDiscount || 0),
    0
  );

  const handleFilter = () => {
    const filteredData = reports.filter((item) =>
      searchName
        ? item.finalDiscountBy.toLowerCase().includes(searchName.toLowerCase())
        : true
    );
    setFilteredReports(filteredData);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  return (
    <div className="pharmacy-list">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className="discount-reports-header">Discount Reports</h2>
        <div
          className="export-buttons"
          style={{ display: "flex", gap: "10px" }}
        >
          <button onClick={exportExcel}>Excel</button>
          <button onClick={exportCSV}>CSV</button>
          <button onClick={exportPDF}>PDF</button>
        </div>
      </div>
      <hr className="am-h-line" style={{margin: "0"}}/>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div className="date-filters" style={{ gap: "10px" }}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
            style={{ width: "fit-content" }}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
            style={{ width: "fit-content" }}
          />
          <button
            onClick={handleSearch}
            className="search-button"
            style={{
              height: "fit-content",
              width: "fit-content",
              marginTop: "4px",
            }}
          >
            Search
          </button>
        </div>
        <div
          className="filter-section"
          style={{ display: "flex", gap: "10px", alignItems: "center" }}
        >
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by Discount By"
            className="filter-input"
          />
          <button
            onClick={handleFilter}
            className="filter-button"
            style={{
              height: "fit-content",
              width: "fit-content",
              marginTop: "10px",
            }}
          >
            Filter
          </button>
        </div>
        <div className="total-final-discount" style={{ margin: "auto 0" }}>
          <h4>Total Discount: ₹{totalFinalDiscount}</h4>
        </div>
      </div>
      <table className="pharmacy-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Discount By</th>
            <th>Category</th>
            <th>Operator</th>
            <th>Operator Role</th>
            <th>Final Discount</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item._id}>
                <td>{formatDateToDDMMYYYY(item.date)}</td>
                <td>{item.finalDiscountBy}</td>
                <td>{item.category}</td>
                <td>{item.user}</td>
                <td>{item.userRole}</td>
                <td>{item.grandTotals.finalDiscount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className="no-data">
                No discount reports available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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

export default DiscountReports;
