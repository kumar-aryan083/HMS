import React, { useEffect, useState } from "react";
import "./styles/OpdFile.css";
import { useNavigate } from "react-router-dom";
import EditOpdModal from "./EditOpdModal";

const OpdFile = ({ setNotification, user }) => {
  const nav = useNavigate();
  const [opds, setOpds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [opdsPerPage] = useState(5);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [date, setDate] = useState("");
  const [filteredOpds, setFilteredOpds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [currentOpd, setCurrentOpd] = useState({}); // Current OPD data

  useEffect(() => {
    document.title = "OPD Records | HMS";
    if(!user){
      setNotification("Login first to access this page.")
      nav('/emp-login');
    }
    fetchOpdDetails();
  }, []);

  const fetchOpdDetails = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/opd/opds-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        console.log(data);
        setOpds(data.opdDetails);
        setFilteredOpds(data.opdDetails); // Initialize filteredOpds with all OPDs
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearch = () => {
    let currentFilteredOpds = [...opds];

    if (phoneNumber) {
      currentFilteredOpds = currentFilteredOpds.filter((opd) => {
        return (
          opd.patientId.mobile && opd.patientId.mobile.includes(phoneNumber)
        );
      });
    }

    if (date) {
      const selectedDate = new Date(date).toISOString().split("T")[0];
      currentFilteredOpds = currentFilteredOpds.filter((opd) => {
        if (opd.updatedAt) {
          const opdUpdatedDate = new Date(opd.updatedAt)
            .toISOString()
            .split("T")[0];
          return opdUpdatedDate === selectedDate;
        }
        return false;
      });
    }

    setFilteredOpds(currentFilteredOpds);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOpd((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEdit = (opd) => {
    setCurrentOpd(opd); // Set the current OPD data
    setIsModalOpen(true); // Open the modal
  };


  const indexOfLastOpd = currentPage * opdsPerPage;
  const indexOfFirstOpd = indexOfLastOpd - opdsPerPage;

  // Use filteredOpds if there are any; otherwise use opds
  const currentOpds = filteredOpds.slice(indexOfFirstOpd, indexOfLastOpd);
  const totalPages = Math.ceil(
    (filteredOpds.length > 0 ? filteredOpds.length : opds.length) / opdsPerPage
  );

  return (
    <div className="opd-file-container">
      <h2 className="opd-file-heading">OPD Records</h2>
      <div className="opd-search-container">
        <input
          type="text"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Search by Phone Number"
          className="opd-search-input"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="Search by Date"
          className="opd-search-input"
        />
        <button onClick={handleSearch} className="opd-search-btn">
          Search
        </button>
      </div>
      <table className="opd-file-table">
        <thead>
          <tr className="opd-file-header">
            <th className="header-item name-item">Patient Name</th>
            <th className="header-item doctor-item">Doctor</th>
            <th className="header-item dept-item">Department</th>
            <th className="header-item dept-item">Phone</th>
            <th className="header-item date-item">Date</th>
            <th className="header-item actions-item">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentOpds.map((opd) => (
            <tr key={opd._id} className="opd-file-row">
              <td className="row-item name-item">{opd.patientName}</td>
              <td className="row-item doctor-item">
                {opd.appointment.doctor.name}
              </td>
              <td className="row-item dept-item">
                {opd.appointment.department.name}
              </td>
              <td className="row-item phone-item">{opd.patientId.mobile}</td>
              <td className="row-item date-item">
                {new Date(opd.appointment.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </td>
              <td className="row-item actions-item">
                <button className="opd-edit-btn" onClick={()=> handleEdit(opd)}>Edit</button>
                <button
                  className="opd-rx-btn"
                  onClick={() => {
                    nav(`/opd/${opd.opdId}`);
                  }}
                >
                  RX
                </button>
                <button
                  className="opd-delete-btn"
                  onClick={async () => {
                    const res = await fetch(
                      `http://localhost:8000/api/opd/delete-opd/${opd._id}`,
                      {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                          token: localStorage.getItem("token"),
                        },
                      }
                    );
                    const data = await res.json();
                    if (res.ok) {
                      setOpds((prevOpds) =>
                        prevOpds.filter((o) => o._id !== data.deleted._id)
                      );
                      setFilteredOpds((prevFilteredOpds) =>
                        prevFilteredOpds.filter(
                          (o) => o._id !== data.deleted._id
                        )
                      );
                      setNotification(data.message);
                    } else {
                      setNotification(data.message);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="opd-pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`opd-pagination-btn ${
              currentPage === index + 1 ? "active" : ""
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <EditOpdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        opdData={currentOpd}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default OpdFile;
