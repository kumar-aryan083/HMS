import React, { useContext, useEffect, useState } from "react";
import "./styles/PatientList.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { environment } from "../../utlis/environment.js";
import Loader from "./Loader.jsx";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import EditPatient from "./EditPatient.jsx";
const PatientList = () => {
  const { setNotification } = useContext(AppContext);
  const nav = useNavigate();
  const [patients, setPatients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uhid, setUhid] = useState("");

  useEffect(() => {
    document.title = "Patients List | HMS";
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/patients-list?name=${searchTerm}&fromDate=${fromDate}&toDate=${toDate}`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setPatients(data.patientDetails);
        setFilteredPatients(data.patientDetails);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    let matchedPatients = patients;

    // Filter by name or phone number
    if (searchTerm.trim() !== "") {
      matchedPatients = matchedPatients.filter(
        (patient) =>
          patient.patientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          patient.mobile.includes(searchTerm) // Check if phone number matches the search term
      );
    }

    // Filter by date range if selected
    if (fromDate && toDate) {
      matchedPatients = matchedPatients.filter((patient) => {
        const registrationDate = new Date(patient.createdAt)
          .toISOString()
          .split("T")[0]; // Extract date in YYYY-MM-DD format
        return registrationDate >= fromDate && registrationDate <= toDate;
      });
    }

    setFilteredPatients(matchedPatients);
    setCurrentPage(1); // Reset to the first page of filtered results
  };

  // Get current patients based on the search results
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  const clearFilter = ()=>{
    setFromDate("");
    setToDate("");
    setSearchTerm("");
  }

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

  // Calculate total pages based on filtered or total patients
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const exportToExcel = () => {
    if (filteredPatients.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredPatients.map((patient, index) => ({
      "#": index + 1,
      UHID: patient.uhid || "-",
      Name: patient.patientName || "-",
      Email: patient.email || "-",
      Phone: patient.mobile || "-",
      Gender: patient.gender || "-",
      Aadhar: patient.aadhar || "-",
      Birthday: formatDateToDDMMYYYY(patient.birthday) || "-",
      Age: patient.age || "-",
      Height: patient.height || "-",
      Weight: patient.weight || "-",
      "Blood Group": patient.bloodGroup || "-",
      "Payment Type": patient.paymentType || "-",
      "Railway Type": patient.railwayType || "-",
      "UMMID No.": patient.ummidCard || "-",
      "CR No.": patient.crnNumber || "-",
      "Emergency Contact": patient.crnNumber || "-",
      Address: patient.firstAddress || "-",
      Pincode: patient.pincode || "-",
      District: patient.district || "-",
      State: patient.state || "-",
      Country: patient.country || "-",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Auto-adjust column widths
    // const columnWidths = Object.keys(worksheetData[0]).map((key) => ({
    //   wch: Math.max(
    //     ...worksheetData.map((row) => row[key]?.toString().length + 5),
    //     key.length + 5
    //   ),
    // }));
    // worksheet["!cols"] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ALL_Patients");

    // Save file
    XLSX.writeFile(workbook, "ALL_Patients.xlsx");
  };

  const exportToCsv = () => {
    if (filteredPatients.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredPatients.map((patient, index) => ({
      "#": index + 1,
      UHID: patient.uhid || "-",
      Name: patient.patientName || "-",
      Email: patient.email || "-",
      Phone: patient.mobile || "-",
      Gender: patient.gender || "-",
      Aadhar: patient.aadhar || "-",
      Birthday: formatDateToDDMMYYYY(patient.birthday) || "-",
      Age: patient.age || "-",
      Height: patient.height || "-",
      Weight: patient.weight || "-",
      "Blood Group": patient.bloodGroup || "-",
      "Payment Type": patient.paymentType || "-",
      "Railway Type": patient.railwayType || "-",
      "UMMID No.": patient.ummidCard || "-",
      "CR No.": patient.crnNumber || "-",
      "Emergency Contact": patient.crnNumber || "-",
      Address: patient.firstAddress || "-",
      Pincode: patient.pincode || "-",
      District: patient.district || "-",
      State: patient.state || "-",
      Country: patient.country || "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ALL_Patients");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "ALL_Patients.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredPatients.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = filteredPatients.map((patient, index) => [
      patient.uhid || "-",
      patient.patientName || "-",
      patient.email || "-",
      patient.paymentType || "-",
      patient.railwayType || "-",
      patient.ummidCard || "-",
      patient.crnNumber || "-",
    ]);

    pdf.autoTable({
      head: [
        [
          "UHID",
          "Name",
          "Email",
          "Payment Type",
          "Railway Type",
          "UMMID No.",
          "CR No.",
        ],
      ],
      body: tableData,
    });

    pdf.save("ALL_Patients.pdf");
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleEditing = (patient) => {
    setUhid(patient.uhid)
    setIsModalOpen(true);
  };
  const handleEditSubmit = () => {
    fetchDetails();
  };

  return (
    <>
      <div className="patient-list-container">
        <h2 className="patient-list-heading">Patients List</h2>
        {/* Search Input */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="search-container">
            <div className="search-inpts">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Patient Name / Mobile No."
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">
                Search
              </button>
            </div>
            <div className="search-inpts">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="date-input"
                placeholder="From Date"
              />
              <span className="si-span">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="date-input"
                placeholder="To Date"
              />
              <button onClick={handleSearch} className="search-btn">
                Search
              </button>
              <button onClick={clearFilter} className="search-btn">Clear</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={exportToExcel}
              className="export-btn"
            >
              <FontAwesomeIcon icon={faFileExcel} /> Excel
            </button>
            <button
              onClick={exportToCsv}
              className="export-btn"
            >
              <FontAwesomeIcon icon={faFileCsv} /> CSV
            </button>
            <button
              onClick={exportToPdf}
              className="export-btn"
            >
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </button>
          </div>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div>
            <table className="patient-list-table">
              <thead>
                <tr className="patient-list-header">
                  <th className="header-item uhid-item">UHID</th>
                  <th className="header-item name-item">Patient Name</th>
                  <th className="header-item age-item">Age/Sex</th>
                  <th className="header-item address-item">Address</th>
                  <th className="header-item phone-item">Phone</th>
                  <th className="header-item">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPatients.map((patient) => (
                  <tr key={patient._id} className="patient-list-row">
                    <td className="row-item uhid-item" style={{padding: "5px"}}>{patient.uhid}</td>
                    <td className="row-item name-item" style={{padding: "5px"}}>
                      {patient.patientName}
                    </td>
                    <td className="row-item age-item" style={{padding: "5px"}}>
                      {patient.age}/{patient.gender.charAt(0).toUpperCase()}
                    </td>
                    <td className="row-item address-item" style={{padding: "5px"}}>
                      {patient.firstAddress}
                    </td>
                    <td className="row-item phone-item" style={{padding: "5px"}}>{patient.mobile}</td>
                    <td className="row-item t-btn" style={{display: "flex", gap: "15px", justifyContent:"center"}} >
                      <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => handleEditing(patient)}
                        title="Edit"
                        className="icon"
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        onClick={async () => {
                          const res = await fetch(
                            `${environment.url}/api/patient/delete-patient/${patient._id}`,
                            {
                              method: "DELETE",
                              headers: {
                                "x-tenant-id": environment.tenantId,
                                "Content-Type": "application/json",
                                token: localStorage.getItem("token"),
                              },
                            }
                          );
                          const data = await res.json();
                          if (res.ok) {
                            setPatients((prevPatients) =>
                              prevPatients.filter(
                                (patient) => patient._id !== data.deleted._id
                              )
                            );
                            setFilteredPatients((prevPatients) =>
                              prevPatients.filter(
                                (patient) => patient._id !== data.deleted._id
                              )
                            );
                            setNotification(data.message);
                          }
                        }}
                        title="Delete"
                        className="icon"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`pagination-btn ${
                currentPage === index + 1 ? "active" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="patient-modal-overlay">
          <div className="patient-modal-content">
            <button className="patient-modal-close-btn" onClick={handleModalClose}>
              X
            </button>
            <EditPatient onClose={handleModalClose} uhid={uhid} onEditPatient={handleEditSubmit} />
          </div>
        </div>
      )}

    </>
  );
};

export default PatientList;
