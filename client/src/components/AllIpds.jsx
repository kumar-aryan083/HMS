import React, { useContext, useEffect, useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import './styles/AllIpds.css';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

const AllIpds = () => {
  const {user} = useContext(AppContext);
  const [ipds, setIpds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredIpds, setFilteredIpds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;

  const nav = useNavigate();

  useEffect(() => {
    fetchIpds();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, ipds]);

  useEffect(()=>{
    document.title = "All IPDs | HMS";
    if(!user){
      nav('/emp-login')
    }
  },[user])

  const handleSearch = ()=>{
    if (searchQuery.trim() === "") {
      setFilteredIpds(ipds);
    } else {
      const filtered = ipds.filter((ipd) => {
        const uhid = ipd.patientId?.uhid?.toString() || ""; 
        const patientName = ipd.patientId?.patientName?.toLowerCase() || ""; 
        return (
          uhid.includes(searchQuery.toLowerCase()) || 
          patientName.includes(searchQuery.toLowerCase()) 
        );
      });
      setFilteredIpds(filtered);
    }
    setCurrentPage(1);
  }

  const fetchIpds = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/ipd/all-ipds", {
        method: "GET",
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setIpds(data.ipds);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredIpds.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredIpds.length/ entriesPerPage);

  const handlePreviousPage = ()=>{
    if(currentPage > 1){
      setCurrentPage(currentPage-1);
    }
  }
  const handleNextPage = ()=>{
    if(currentPage<totalPages){
      setCurrentPage(currentPage+1);
    }
  }
  const handlePageClick = (page)=>{
    setCurrentPage(page);
  }

  return (
    <>
      <div className="all-ipds-header">
        <h1>All IPDs</h1>
      </div>

      <div className="all-ipds-search">
        <input
          type="text"
          placeholder="Search by UHID or Patient Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="all-ipds-search-input"
        />
      </div>

      <div className="all-ipds-table-container">
        <table className="all-ipds-table">
          <thead>
            <tr>
              <th>UHID</th>
              <th>Patient Name</th>
              <th>Supervising Doctor</th>
              <th>Date of Admission</th>
              <th>Date of Discharge</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.length > 0 ? (
              currentEntries.map((ipd) => (
                <tr key={ipd._id}>
                  <td>{ipd.patientId.uhid}</td>
                  <td>{ipd.patientId.patientName}</td>
                  <td>{ipd.doctorId.name}</td>
                  <td>{ipd.admissionDate.split('T')[0]}</td>
                  <td>{ipd.dischargeDate ? ipd.dischargeDate : "-"}</td>
                  <td className="all-ipds-actions">
                    <FontAwesomeIcon
                      icon={faEye}
                      onClick={() => nav(`/ipds/ipd-file/${ipd._id}`)}
                      title="open"
                      className="all-ipds-icon"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No IPDs Available to Show
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
          <button
            className="pagination-btn"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
              onClick={() => handlePageClick(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
    </>
  );
};

export default AllIpds;
