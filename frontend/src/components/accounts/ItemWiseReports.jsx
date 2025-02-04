import React, { useState, useEffect } from "react";
import { environment } from "../../../utlis/environment";
import "./styles/ItemWiseReports.css";
import Loader from "../Loader";
import {
  exportItemWiseToCSV,
  exportItemWiseToExcel,
  exportItemWiseToPDF,
} from "../../../utlis/exportItemWiseReport";

const ItemWiseReports = () => {
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("2024-11-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [itemNameFilter, setItemNameFilter] = useState("");
  const [patientNameFilter, setPatientNameFilter] = useState("");
  const [uhidFilter, setUhidFilter] = useState(""); // New UHID Filter
  const [mobileFilter, setMobileFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchData = async () => {
    // console.log("fetchData");
    fetchReport();
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-item-wise-collection?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log("data from backend", data);
        setReportData(data.items);
        setActiveTab(Object.keys(data.items)[0]);
      }
    } catch (error) {
      console.error("Error fetching item-wise report:", error);
    } finally {
      setLoading(false);
    }
  };
  const getFilteredItems = (items) => {
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(itemNameFilter.toLowerCase()) &&
        item.patientName
          .toLowerCase()
          .includes(patientNameFilter.toLowerCase()) &&
        (!uhidFilter || item.uhid.toString().includes(uhidFilter)) && // UHID filter
        (!mobileFilter || item.mobile.toString().includes(mobileFilter)) // Mobile filter
    );
  };

  const getPaginatedItems = (items) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const handleNextPage = (filteredItems) => {
    if (currentPage < Math.ceil(filteredItems.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderTable = (items) => {
    const filteredItems = getFilteredItems(items);
    const paginatedItems = getPaginatedItems(filteredItems);

    return (
      <>
        <table className="income-table">
          <thead>
            <tr>
              <th>Bill Number</th>
              <th>Type</th>
              {/* <th>Item Date</th> */}
              <th>Patient Name</th>
              <th>Item Name</th>
              <th>Charge</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Discount(%)</th>
              <th>Total Charge</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((item) => (
              <tr key={item._id}>
                <td>{item.billNumber}</td>
                <td>{item.billType}</td>
                {/* <td>{formatDateToDDMMYYYY(item.itemDate)}</td> */}
                <td>{item.patientName}</td>
                <td>{item.itemName}</td>
                <td>{item.charge}</td>
                <td>{item.quantity}</td>
                <td>{item.total}</td>
                <td>{item.discount}</td>
                <td>{item.totalCharge}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="7"></td>
              <td colSpan="7" style={{ textAlign: "center" }}>
                <strong>Total:</strong>{" "}
                {filteredItems.reduce((sum, item) => sum + item.totalCharge, 0)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of{" "}
            {Math.ceil(filteredItems.length / itemsPerPage)}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handleNextPage(filteredItems)}
            disabled={
              currentPage === Math.ceil(filteredItems.length / itemsPerPage)
            }
          >
            Next
          </button>
        </div>
      </>
    );
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="report-container" style={{margin: "10px 25px"}}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 style={{ height: "fit-content", margin: "auto 0" }}>Item Wise Reports</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <div
            className="export-buttons"
            style={{ display: "flex", gap: "10px" }}
          >
            <button
              className="export-btn"
              onClick={() =>
                exportItemWiseToExcel(
                  reportData[activeTab].items.filter(
                    (item) =>
                      item.itemName
                        .toLowerCase()
                        .includes(itemNameFilter.toLowerCase()) &&
                      item.patientName
                        .toLowerCase()
                        .includes(patientNameFilter.toLowerCase())
                  ),
                  activeTab
                )
              }
            >
              Excel
            </button>
            <button
              className="export-btn"
              onClick={() =>
                exportItemWiseToCSV(
                  reportData[activeTab].items.filter(
                    (item) =>
                      item.itemName
                        .toLowerCase()
                        .includes(itemNameFilter.toLowerCase()) &&
                      item.patientName
                        .toLowerCase()
                        .includes(patientNameFilter.toLowerCase())
                  ),
                  activeTab
                )
              }
            >
              CSV
            </button>
            <button
              className="export-btn"
              onClick={() =>
                exportItemWiseToPDF(
                  reportData[activeTab].items.filter(
                    (item) =>
                      item.itemName
                        .toLowerCase()
                        .includes(itemNameFilter.toLowerCase()) &&
                      item.patientName
                        .toLowerCase()
                        .includes(patientNameFilter.toLowerCase())
                  ),
                  activeTab
                )
              }
            >
              PDF
            </button>
          </div>
          
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
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
          </div>
      </div>
      <hr className="am-h-line" style={{margin:"0"}} />
      <div className="accounts-date" style={{ display: "flex", gap: "10px" }}>
        <div style={{ margin: "auto 0" }}>
          <label>Filter by Item Name:</label>
          <input
            type="text"
            value={itemNameFilter}
            onChange={(e) => setItemNameFilter(e.target.value)}
            placeholder="Enter item name"
          />
        </div>
        <div style={{ margin: "auto 0" }}>
          <label>Filter by Patient Name:</label>
          <input
            type="text"
            value={patientNameFilter}
            onChange={(e) => setPatientNameFilter(e.target.value)}
            placeholder="Enter patient name"
          />
        </div>
        <div>
          <label>UHID:</label>
          <input
            type="text"
            value={uhidFilter}
            onChange={(e) => setUhidFilter(e.target.value)}
            placeholder="Search by UHID"
          />
        </div>
        <div>
          <label>Mobile Number:</label>
          <input
            type="text"
            value={mobileFilter}
            onChange={(e) => setMobileFilter(e.target.value)}
            placeholder="Search by mobile"
          />
        </div>
        <div style={{ margin: "auto 0" }}>
          <button
            style={{ marginTop: "35px", fontWeight: "500" }}
            onClick={() => {
              setItemNameFilter("");
              setPatientNameFilter("");
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div className="accounts-tabs">
        {reportData &&
          Object.keys(reportData).map((tab) => (
            <button
              key={tab}
              className={`single-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()} ({reportData[tab].count})
            </button>
          ))}
      </div>
      <div className="table-container">
        {activeTab &&
          reportData[activeTab] &&
          renderTable(reportData[activeTab].items)}
      </div>
    </div>
  );
};

export default ItemWiseReports;
