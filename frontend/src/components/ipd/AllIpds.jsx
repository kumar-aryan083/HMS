import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEdit,
  faTrashAlt,
  faFileExcel,
  faFilePdf,
  faFileCsv,
} from "@fortawesome/free-solid-svg-icons";
import "./styles/AllIpds.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import Loader from "../Loader.jsx";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables

const AllIpds = () => {
  const { user, setNotification } = useContext(AppContext);
  const [ipds, setIpds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredIpds, setFilteredIpds] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(false);
  const [supervisingDoctor, setSupervisingDoctor] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [admissionDate, setAdmissionDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const entriesPerPage = 20;

  const [form, setForm] = useState({
    doctorId: "",
    doctorName: "",
    admissionDate: "",
    timeOfAdmission: "",
    dischargeDate: "",
    dischargeTime: "",
    referenceLetter: "",
    referenceDoctor: "",
    referredBy: "",
    referredById: "",
  });

  const editRef = useRef();

  const nav = useNavigate();

  useEffect(() => {
    document.title = "All IPDs | HMS";
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
    fetchIpds();
    fetchAgents();
    fetchDoctors();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [ipds]);

  const handleSearch = () => {
    let filtered = ipds;

    // Filter by UHID or Patient Name
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((ipd) => {
        const uhid = ipd.patientId?.uhid?.toString() || "";
        const patientName = ipd.patientId?.patientName?.toLowerCase() || "";
        return (
          uhid.includes(searchQuery.toLowerCase()) ||
          patientName.includes(searchQuery.toLowerCase())
        );
      });
    }

    // Filter by Supervising Doctor
    if (supervisingDoctor.trim() !== "") {
      filtered = filtered.filter((ipd) => {
        const doctorName = ipd.doctorId?.name?.toLowerCase() || "";
        return doctorName.includes(supervisingDoctor.toLowerCase());
      });
    }

    // Filter by Date Range
    if (fromDate || toDate) {
      filtered = filtered.filter((ipd) => {
        const admissionDate = ipd.admissionDate?.split("T")[0] || "";
        const isAfterFromDate = fromDate
          ? new Date(admissionDate) >= new Date(fromDate)
          : true;
        const isBeforeToDate = toDate
          ? new Date(admissionDate) <= new Date(toDate)
          : true;
        return isAfterFromDate && isBeforeToDate;
      });
    }

    setFilteredIpds(filtered);
    setCurrentPage(1);
  };

  const fetchIpds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/ipd/all-ipds`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.ipds);
        setIpds(data.ipds);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/employee/get-doctors`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.ipds);
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/admin/get-agent-staff`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          token: localStorage.getItem("token"),
          "ngrok-skip-browser-warning": "true",
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data.allItems);
        setAgents(data.allItems);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      referredBy: value,
    }));

    if (value.length >= 3) {
      const filtered = agents.filter((agent) =>
        agent.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAgents(filtered);
    } else {
      setFilteredAgents([]);
    }
  };

  const handleAgentSelect = (agent) => {
    setForm((prevData) => ({
      ...prevData,
      referredById: agent._id,
      referredBy: `${agent.name}`,
    }));
    setFilteredAgents([]);
  };
  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      doctorName: value,
    }));
    if (value.length > 2) {
      const filtered = doctors.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setForm((prevData) => ({
      ...prevData,
      doctorId: doctor._id,
      doctorName: doctor.name,
    }));
    setFilteredDoctors([]);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleEditing = (ipd) => {
    // console.log(ipd);
    editRef.current.style.display = "flex";
    setId(ipd._id);
    setForm({
      referredById: ipd.referredById,
      refferedBy: ipd.referredBy,
      referenceLetter: ipd.referenceLetter,
      referenceDoctor: ipd.referenceDoctor,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited ipd", form);
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/new-update-patient-admission?admissionId=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(form),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchIpds();
        setNotification(data.message);
        handleClose();
        setForm({
          doctorId:"",
          doctorName: "",
          admissionDate: "",
          dischargeDate: "",
          referenceLetter: "",
          referenceDoctor: "",
          referredById: "",
          referredBy: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteIpd = async (ipd) => {
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/delete-patient-admission/${ipd._id}`,
        {
          method: "DELETE",
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchIpds();
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
      setNotification("server error");
    }
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredIpds?.slice(
    indexOfFirstEntry,
    indexOfLastEntry
  );

  const totalPages = Math.ceil(filteredIpds?.length / entriesPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setSupervisingDoctor("");
    setSearchQuery("");
  };

  const exportToExcel = () => {
    if (filteredIpds.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredIpds.map((ipd) => ({
      UHID: ipd.patientId?.uhid || "",
      "Patient Name": ipd.patientId?.patientName || "",
      "Supervising Doctor": ipd.doctorId?.name || "",
      "Date of Admission": ipd.admissionDate
        ? ipd.admissionDate.split("T")[0]
        : "",
      "Date of Discharge": ipd.dischargeSummary?.dischargeDate
        ? ipd.dischargeSummary?.dischargeDate.split("T")[0]
        : "-",
      "Reference Letter": ipd.referenceLetter || "-",
      "Reference Doctor": ipd.referenceDoctor || "-",
      "Admitted Ward":
        ipd.wardHistory && ipd.wardHistory.length > 0
          ? ipd.wardHistory[ipd.wardHistory.length - 1]?.wingId?.name || "-"
          : "-",
      "Admitted Room":
        ipd.wardHistory && ipd.wardHistory.length > 0
          ? ipd.wardHistory[ipd.wardHistory.length - 1]?.roomId?.roomNumber ||
            "-"
          : "-",
      "Assigned Bed":
        ipd.wardHistory && ipd.wardHistory.length > 0
          ? ipd.wardHistory[ipd.wardHistory.length - 1]?.bedName || "-"
          : "-",
      "Total Paid Amount":
        ipd.payment && ipd.payment.length > 0
          ? ipd.payment.reduce(
              (total, payment) => total + (payment.paymentAmount || 0),
              0
            )
          : 0,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_IPDs");

    // Save file
    XLSX.writeFile(workbook, "All_IPDs.xlsx");
  };

  const exportToCsv = () => {
    if (filteredIpds.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = filteredIpds.map((ipd) => ({
      UHID: ipd.patientId?.uhid || "",
      "Patient Name": ipd.patientId?.patientName || "",
      "Supervising Doctor": ipd.doctorId?.name || "",
      "Date of Admission": ipd.admissionDate
        ? ipd.admissionDate.split("T")[0]
        : "",
      "Date of Discharge": ipd.dischargeSummary?.dischargeDate
        ? ipd.dischargeSummary?.dischargeDate.split("T")[0]
        : "-",
      "Reference Letter": ipd.referenceLetter || "-",
      "Reference Doctor": ipd.referenceDoctor || "-",
      "Admitted Ward":
        ipd.wardHistory && ipd.wardHistory.length > 0
          ? ipd.wardHistory[ipd.wardHistory.length - 1]?.wingId?.name || "-"
          : "-",
      "Admitted Room":
        ipd.wardHistory && ipd.wardHistory.length > 0
          ? ipd.wardHistory[ipd.wardHistory.length - 1]?.roomId?.roomNumber ||
            "-"
          : "-",
      "Assigned Bed":
        ipd.wardHistory && ipd.wardHistory.length > 0
          ? ipd.wardHistory[ipd.wardHistory.length - 1]?.bedName || "-"
          : "-",
      "Total Paid Amount":
        ipd.payment && ipd.payment.length > 0
          ? ipd.payment.reduce(
              (total, payment) => total + (payment.paymentAmount || 0),
              0
            )
          : 0,
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_IPDs");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "All_IPDs.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (filteredIpds.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = filteredIpds.map((ipd) => [
      ipd.patientId?.uhid || "",
      ipd.patientId?.patientName || "",
      ipd.doctorId?.name || "",
      ipd.admissionDate ? ipd.admissionDate.split("T")[0] : "",
      ipd.dischargeSummary?.dischargeDate
        ? ipd.dischargeSummary?.dischargeDate.split("T")[0]
        : "-",
      ipd.wardHistory && ipd.wardHistory.length > 0
        ? ipd.wardHistory[ipd.wardHistory.length - 1]?.wingId?.name || "-"
        : "-",
      ipd.wardHistory && ipd.wardHistory.length > 0
        ? ipd.wardHistory[ipd.wardHistory.length - 1]?.roomId?.roomNumber || "-"
        : "-",
      ipd.wardHistory && ipd.wardHistory.length > 0
        ? ipd.wardHistory[ipd.wardHistory.length - 1]?.bedName || "-"
        : "-",
      ipd.payment && ipd.payment.length > 0
        ? ipd.payment.reduce(
            (total, payment) => total + (payment.paymentAmount || 0),
            0
          )
        : 0,
    ]);

    pdf.autoTable({
      head: [
        [
          "UHID",
          "Patient Name",
          "Supervising Doctor",
          "Date of Admission",
          "Date of Discharge",
          "Admitted Ward",
          "Admitted Room",
          "Assigned Bed",
          "Total Paid Amount",
        ],
      ],
      body: tableData,
    });

    pdf.save("All_IPDs.pdf");
  };

  return (
    <>
      <div className="full-all-ipd">
        <div className="all-ipds-header" style={{ margin: "15px 0" }}>
          <h1>All IPDs</h1>
        </div>
        <div style={{ display: "flex" }}>
          <div className="all-ipds-search" style={{ width: "900px" }}>
            <input
              type="text"
              placeholder="Search by UHID or Patient Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="all-ipds-search-input"
              style={{ height: "41px" }}
            />
            <input
              type="text"
              placeholder="Supervising Doctor"
              value={supervisingDoctor}
              onChange={(e) => setSupervisingDoctor(e.target.value)}
              className="all-ipds-search-input"
              style={{ height: "41px" }}
            />
            <input
              type="date"
              placeholder="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="all-ipds-search-input"
            />
            <input
              type="date"
              placeholder="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="all-ipds-search-input"
            />
            <button onClick={handleSearch} className="search-btn">
              Search
            </button>
            <button onClick={clearFilter} className="search-btn">
              Clear
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
          <div className="all-ipds-table-container">
            <table className="all-ipds-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Supervising Doctor</th>
                  <th>Date of Admission</th>
                  <th>Admission Time</th>
                  <th>Date of Discharge</th>
                  <th>Discharge Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries?.length > 0 ? (
                  currentEntries.map((ipd, index) => (
                    <tr key={ipd._id}>
                      <td>{index + 1}</td>
                      <td>{ipd.patientId?.uhid}</td>
                      <td>{ipd.patientId?.patientName}</td>
                      <td>{ipd.doctorId?.name}</td>
                      <td>{ipd.admissionDate.split("T")[0]}</td>
                      <td>{ipd.timeOfAdmission}</td>
                      <td>
                        {ipd.dischargeSummary?.dischargeDate
                          ? ipd.dischargeSummary?.dischargeDate.split("T")[0]
                          : "-"}
                      </td>
                      <td>{ipd.dischargeSummary?.dischargeTime}</td>
                      <td className="all-ipds-actions">
                        <FontAwesomeIcon
                          icon={faEye}
                          onClick={() => nav(`/ipds/ipd-file/${ipd._id}`)}
                          title="open"
                          className="all-ipds-icon"
                        />
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(ipd)}
                          title="edit"
                          className="all-ipds-icon"
                        />
                        {user?.role === "admin" && (
                          <FontAwesomeIcon
                            icon={faTrashAlt}
                            onClick={() => handleDeleteIpd(ipd)}
                            title="edit"
                            className="all-ipds-icon"
                          />
                        )}
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
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content" style={{ height: "47%", maxWidth: "900px" }}>
          <button
            type="button"
            onClick={handleClose}
            className="appointment-closeBtn"
          >
            X
          </button>
          <h3>Edit IPD</h3>
          <form className="patient-admission-form" style={{maxWidth: "100%"}} onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <label className="form-label">
                Admission Date:
                <input
                  className="form-input"
                  type="date"
                  name="admissionDate"
                  value={form.admissionDate}
                  onChange={handleInputChange}
                />
              </label>
              <label className="form-label">
                Admission Time:
                <input
                  className="form-input"
                  type="time"
                  name="timeOfAdmission"
                  value={form.timeOfAdmission}
                  onChange={handleInputChange}
                  style={{ height: "43px" }}
                />
              </label>
              <label className="form-label">
                Discharge Date:
                <input
                  className="form-input"
                  type="date"
                  name="dischargeDate"
                  value={form.dischargeDate}
                  onChange={handleInputChange}
                />
              </label>
              <label className="form-label">
                Discharge Time:
                <input
                  className="form-input"
                  type="time"
                  name="dischargeTime"
                  value={form.dischargeTime}
                  onChange={handleInputChange}
                  style={{ height: "43px" }}
                />
              </label>
            </div>

            <div className="form-row fg-group">
              <label className="form-label">
                Reffered By:
                <input
                  className="form-input"
                  type="text"
                  name="referredBy"
                  value={form.referredBy}
                  onChange={handleAgentInput}
                  placeholder="Search Agent Name"
                  autoComplete="off"
                />
                {filteredAgents.length > 0 && (
                  <ul className="ipd-autocomplete-dropdown">
                    {filteredAgents.map((agent) => (
                      <li
                        key={agent._id}
                        onClick={() => handleAgentSelect(agent)}
                        className="ipd-dropdown-item"
                      >
                        {agent.name} ({agent.phone})
                      </li>
                    ))}
                  </ul>
                )}
              </label>
              <label className="form-label">
                Reference Letter:
                <input
                  className="form-input"
                  type="text"
                  name="referenceLetter"
                  value={form.referenceLetter}
                  onChange={handleInputChange}
                />
              </label>
              
              <label className="form-label">
                Doctor Name:
                <input
                  className="form-input"
                  type="text"
                  name="doctorName"
                  value={form.doctorName}
                  onChange={handleDoctorInput}
                  placeholder="Search Doctor Name"
                  autoComplete="off"
                />
                {filteredDoctors.length > 0 && (
                  <ul className="ipd-doctor-autocomplete-dropdown">
                    {filteredDoctors.map((doctor) => (
                      <li
                        key={doctor._id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="ipd-doctor-dropdown-item"
                      >
                        {doctor.name} ({doctor.phone})
                      </li>
                    ))}
                  </ul>
                )}
              </label>
              <label className="form-label">
                Reference Doctor:
                <input
                  className="form-input"
                  type="text"
                  name="referenceDoctor"
                  value={form.referenceDoctor}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <button className="form-submit-button" type="submit">
              Edit Admission
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AllIpds;
