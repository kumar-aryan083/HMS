import React, { useContext, useEffect, useState } from "react";
import "./styles/ReferralReport.css"; // Import the CSS file
import { AppContext } from "../../context/AppContext";
import { environment } from "../../../utlis/environment";

const ReferralReport = () => {
  const { setNotification } = useContext(AppContext);
  const [referalReport, setReferalReport] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [referralBy, setReferralBy] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${environment.url}/api/account/get-ipd-referral-report`,
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
        setReferalReport(data.items);
        setFilteredData(data.items);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("Internal server error");
    }
  };

  const applyFilters = () => {
    let filtered = [...referalReport];

    if (referralBy.trim()) {
      filtered = filtered.filter((item) =>
        item.referralBy.toLowerCase().includes(referralBy.toLowerCase().trim())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (item) => item.admissionDate === formatDate(selectedDate)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset pagination on filter apply
  };

  const clearFilter = ()=>{
    setReferralBy("");
    setSelectedDate("");
  }

  // Format date to match backend format (DD-MMM-YYYY)
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString)
      .toLocaleDateString("en-GB", options)
      .replace(/ /g, "-");
  };

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

  return (
    <div className="referral-report-container">
      <div className="referral-report-header">
        <h2 className="referral-report-title" style={{margin: "0"}}>Referral Report</h2>

        <div className="report-filters-container">
          <input
            type="text"
            placeholder="Search Referral By"
            value={referralBy}
            onChange={(e) => setReferralBy(e.target.value)}
            style={{padding: "5px 10px", height:"40px", width:"fit-content", margin: "auto 0"}}
          />

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{padding: "5px 10px", height:"40px", width:"fit-content", margin: "auto 0"}}
          />

          <button onClick={applyFilters} style={{width: "fit-content", height:"40px", margin:"auto 0"}}>Apply</button>
          <button onClick={clearFilter} style={{width: "fit-content", height:"40px", margin:"auto 0"}}>Clear</button>
        </div>
      </div>
      <table className="referral-report-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Referral By</th>
            {/* <th>Referred By ID</th> */}
            <th>Admission Date</th>
          </tr>
        </thead>
        <tbody>
          {currentItems?.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.patientName}</td>
                <td>{item.uhid}</td>
                <td>{item.referralBy}</td>
                {/* <td>{item.referredById !== "Unknown" ? item.referredById : "-"}</td> */}
                <td>{item.admissionDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="referral-report-no-data">
                No referrals found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* <p className="referral-report-total">
        Total Referrals: <strong>{data.totalItems}</strong>
      </p> */}

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

export default ReferralReport;
