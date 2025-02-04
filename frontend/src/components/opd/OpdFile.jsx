import React, { useContext, useEffect, useState } from "react";
import "./styles/OpdFile.css";
import { useNavigate } from "react-router-dom";
import EditOpdModal from "./EditOpdModal.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import Loader from "../Loader.jsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFilePdf,
  faFileCsv,
  faTrashAlt,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";

const OpdFile = () => {
  const { setNotification, user } = useContext(AppContext);
  const nav = useNavigate();
  const [opds, setOpds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [opdsPerPage] = useState(20);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filteredOpds, setFilteredOpds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOpd, setCurrentOpd] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "OPD Records | HMS";
    if (
      !user ||
      (user.role !== "admin" &&
        user.role !== "counter" &&
        user.role !== "nurse")
    ) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchOpdDetails();
  }, []);

  const fetchOpdDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/opd/opds-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setOpds(data.opdDetails);
        setFilteredOpds(data.opdDetails);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = opds.filter((opd) => {
      const matchesPhone = phoneNumber
        ? opd.patientId?.mobile?.includes(phoneNumber)
        : true;

      const matchesDoctor = doctorName
        ? opd.appointment?.doctor?.name
            .toLowerCase()
            .includes(doctorName.toLowerCase())
        : true;

      const opdDate = opd.appointment?.date.split("T")[0]; // Extract date
      const matchesDateRange =
        (!fromDate || new Date(opdDate) >= new Date(fromDate)) &&
        (!toDate || new Date(opdDate) <= new Date(toDate));

      return matchesPhone && matchesDoctor && matchesDateRange;
    });
    setFilteredOpds(filtered);
    setCurrentPage(1);
  };

  const handleUpdateOpd = async (updatedOpd) => {
    try {
      setOpds((prevOpds) =>
        prevOpds.map((opd) => (opd._id === updatedOpd._id ? updatedOpd : opd))
      );
      setFilteredOpds((prevFilteredOpds) =>
        prevFilteredOpds.map((opd) =>
          opd._id === updatedOpd._id ? updatedOpd : opd
        )
      );
      setNotification("OPD updated successfully!");
    } catch (error) {
      console.error("Error fetching updated OPD:", error);
    }
  };

  const handleEdit = (opd) => {
    setCurrentOpd(opd); // Set the current OPD data
    setIsModalOpen(true); // Open the modal
  };

  const handleClearFilter = () => {
    setFromDate("");
    setToDate("0");
    setDoctorName("");
    setPhoneNumber("");
    setFilteredOpds(opds);
  };

  const indexOfLastOpd = currentPage * opdsPerPage;
  const indexOfFirstOpd = indexOfLastOpd - opdsPerPage;

  // Use filteredOpds if there are any; otherwise use opds
  const currentOpds = filteredOpds?.slice(indexOfFirstOpd, indexOfLastOpd);
  const totalPages = Math.ceil(
    (filteredOpds?.length > 0 ? filteredOpds?.length : opds?.length) /
      opdsPerPage
  );

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

  const exportToExcel = () => {
    if (filteredOpds.length === 0) {
      setNotification("No OPD data available to export.");
      return;
    }

    // Convert OPD data to a simple JSON format for Excel
    const worksheetData = filteredOpds.map((opd) => ({
      UHID: opd.patientId?.uhid || "",
      "Patient Name": opd.patientId?.patientName || "",
      "Consulting Doctor": opd.appointment.doctor?.name || "",
      "Date of Consultation": opd.createdAt ? opd.createdAt.split("T")[0] : "",
      Department: opd.appointment?.department.name || "-",
      "Consultation Type": opd.appointment.consultationType || "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_OPDs");

    // Adjust column width automatically
    worksheet["!cols"] = Object.keys(worksheetData[0]).map((key) => ({
      wch: key.length + 10, // Adjust width based on header length
    }));

    // Save file as 'All_OPDs.xlsx'
    XLSX.writeFile(workbook, "All_OPDs.xlsx");
  };

  const exportToCsv = () => {
    if (filteredOpds.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredOpds.map((opd) => ({
      UHID: opd.patientId?.uhid || "",
      "Patient Name": opd.patientId?.patientName || "",
      "Consulting Doctor": opd.appointment.doctor?.name || "",
      "Date of Consultation": opd.createdAt ? opd.createdAt.split("T")[0] : "",
      Department: opd.appointment?.department.name || "-",
      "Consultation Type": opd.appointment.consultationType || "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_OPDs");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "All_OPDs.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredOpds.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = filteredOpds.map((opd) => [
      opd.patientId?.uhid || "",
      opd.patientId?.patientName || "",
      opd.appointment.doctor?.name || "",
      opd.createdAt ? opd.createdAt.split("T")[0] : "",
      opd.appointment?.department.name || "-",
      opd.appointment.consultationType || "-",
    ]);

    pdf.autoTable({
      head: [
        [
          "UHID",
          "Patient Name",
          "Consulting Doctor",
          "Date",
          "Department",
          "Consultation Type",
        ],
      ],
      body: tableData,
    });

    pdf.save("All_OPDs.pdf");
  };

  return (
    <div className="opd-file-container">
      <h2 className="opd-file-heading">OPD Records</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div className="opd-search-container">
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Search Phone"
            className="opd-search-input"
            style={{ height: "42px", margin: "auto 0" }}
          />
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="Search Doctor"
            className="opd-search-input"
            style={{ height: "42px", margin: "auto 0" }}
          />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From Date"
            className="opd-search-input"
            style={{ margin: "auto 0" }}
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To Date"
            className="opd-search-input"
            style={{ margin: "auto 0" }}
          />

          <button
            onClick={handleSearch}
            className="opd-search-btn"
            style={{ margin: "auto 0", width: "fit-content" }}
          >
            Search
          </button>
          <button
            onClick={handleClearFilter}
            className="opd-search-btn"
            style={{ margin: "auto 0", width: "fit-content" }}
          >
            Clear
          </button>
        </div>
        <div style={{ display: "flex", gap: "10px", paddingLeft: "44px" }}>
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
              marginRight: "80px",
              fontWeight: "500",
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} /> PDF
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <table className="opd-file-table">
          <thead>
            <tr className="opd-file-header">
              <th className="header-item name-item">Patient Name</th>
              <th className="header-item name-item">UHID</th>
              <th className="header-item doctor-item">Doctor</th>
              <th className="header-item dept-item">Department</th>
              <th className="header-item dept-item">Phone</th>
              <th className="header-item date-item">Date</th>
              <th className="header-item actions-item">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOpds?.map((opd) => (
              <tr key={opd._id} className="opd-file-row">
                <td className="row-item name-item">{opd.patientName}</td>
                <td className="row-item name-item">{opd.patientId?.uhid}</td>
                <td className="row-item doctor-item">
                  {opd.appointment.doctor.name}
                </td>
                <td className="row-item dept-item">
                  {opd.appointment.department.name}
                </td>
                <td className="row-item phone-item">{opd.patientId?.mobile}</td>
                <td className="row-item date-item">
                  {formatDateToDDMMYYYY(opd.appointment.date)}
                </td>
                <td
                  className="row-item actions-item"
                  style={{ gap: "10px", justifyContent: "center" }}
                >
                  <FontAwesomeIcon
                    icon={faEdit}
                    onClick={() => handleEdit(opd)}
                    title="Edit"
                    className="icon"
                    style={{ margin: "auto 0" }}
                  />
                  {user?.role === "admin" && (
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ margin: "auto 0" }}
                      onClick={async () => {
                        const res = await fetch(
                          `${environment.url}/api/opd/delete-opd/${opd._id}`,
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
                      title="Delete"
                      className="icon"
                    />
                  )}

                  <button
                    className="opd-rx-btn"
                    onClick={() => {
                      nav(`/opd/${opd.opdId}`);
                    }}
                    style={{
                      width: "fit-content",
                      padding: "2px 3px",
                      margin: "auto 0",
                      fontStyle: "italic",
                    }}
                  >
                    Rx
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
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
        onUpdateOpd={handleUpdateOpd}
      />
    </div>
  );
};

export default OpdFile;
