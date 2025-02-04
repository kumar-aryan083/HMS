import React, { useState } from "react";

const IpdCollections = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState({
    patientName: "",
    paymentType: "",
    uhid: "",
    mobileNumber: "",
  });
  const [filteredData, setFilteredData] = useState(data);

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
  const currentItems = [...filteredData].slice(
    indexOfFirstItem,
    indexOfLastItem
  );
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

  const handleFilter = () => {
    const { patientName, paymentType, uhid, mobileNumber } = filters;

    const filtered = data.filter((item) => {
      return (
        (patientName
          ? item.patientName?.toLowerCase().includes(patientName.toLowerCase())
          : true) &&
        (paymentType
          ? item.paymentType?.toLowerCase() === paymentType.toLowerCase()
          : true) &&
        (uhid ? item.uhid?.toString().includes(uhid) : true) &&
        (mobileNumber ? item.mobile?.toString().includes(mobileNumber) : true)
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilter = () => {
    setFilters({
      patientName: "",
      paymentType: "",
      uhid: "",
      mobileNumber: "",
    });
  };

  const totalAmount = currentItems.reduce(
    (sum, obj) => sum + (obj.amount || 0),
    0
  );

  const totalCashAmount = currentItems
    .filter((obj) => obj.paymentType?.toLowerCase() === "cash")
    .reduce((sum, obj) => sum + (obj.amount || 0), 0);

  const totalOnlineAmount = currentItems
    .filter((obj) => obj.paymentType?.toLowerCase() !== "cash")
    .reduce((sum, obj) => sum + (obj.amount || 0), 0);

  return (
    <div className="ipd-collections-container">
      {/* <h3 className="ipd-collections-title">IPD Collections</h3> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div className="ipd-filters" style={{ width: "100%" }}>
          <input
            type="text"
            name="patientName"
            placeholder="Filter by Patient Name"
            value={filters.patientName}
            onChange={handleInputChange}
            className="ipd-filter-input"
            style={{ width: "fit-content", height: "fit-content" }}
          />
          <input
            type="text"
            name="uhid"
            placeholder="Filter by UHID"
            value={filters.uhid}
            onChange={handleInputChange}
            className="ipd-filter-input"
            style={{ width: "fit-content", height: "fit-content" }}
          />
          <input
            type="text"
            name="mobileNumber"
            placeholder="Filter by Mobile"
            value={filters.mobileNumber}
            onChange={handleInputChange}
            className="ipd-filter-input"
            style={{ width: "fit-content", height: "fit-content" }}
          />
          <select
            name="paymentType"
            value={filters.paymentType}
            onChange={handleInputChange}
            className="ipd-filter-select"
            style={{ width: "fit-content", height: "fit-content" }}
          >
            <option value="">All Payment Types</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="credit">Credit</option>
          </select>
          <button
            onClick={handleFilter}
            className="ipd-filter-button"
            style={{
              width: "fit-content",
              height: "fit-content",
              marginTop: "6px",
              fontWeight: "500",
              backgroundColor: "var(--base-hover)",
            }}
          >
            Apply
          </button>
          <button
            onClick={clearFilter}
            className="ipd-filter-button"
            style={{
              width: "fit-content",
              height: "fit-content",
              marginTop: "6px",
              fontWeight: "500",
              backgroundColor: "var(--base-hover)",
            }}
          >
            Clear
          </button>
        </div>
      </div>
      <div
        className="ipd-collections-total"
        style={{
          width: "100%",
          margin: "10px 0",
          display: "flex",
          gap: "10px",
          fontSize: "16px",
          alignItems: "center",
        }}
      >
        <strong>Total:</strong> {totalAmount.toFixed(2)} |
        <strong> Cash:</strong> {totalCashAmount.toFixed(2)} |
        <strong> Online:</strong> {totalOnlineAmount.toFixed(2)}
      </div>
      <table className="ipd-collections-table">
        <thead>
          <tr>
            <th className="ipd-table-header">#</th>
            <th className="ipd-table-header">Date</th>
            <th className="ipd-table-header">Patient Name</th>
            <th className="ipd-table-header">Payment Type</th>
            <th className="ipd-table-header">Amount</th>
          </tr>
        </thead>
        <tbody>
          {currentItems?.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={index} className="ipd-table-row">
                <td className="ipd-table-cell">{index + 1}</td>
                <td className="ipd-table-cell">{item.date}</td>
                <td className="ipd-table-cell">{item.patientName}</td>
                <td className="ipd-table-cell">
                  {item.paymentType.toUpperCase()}
                </td>
                <td className="ipd-table-cell">{item.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="ipd-table-cell" colSpan="5">
                No data available
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

export default IpdCollections;
