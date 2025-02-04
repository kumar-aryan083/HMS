import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext.jsx";
import { environment } from "../../utlis/environment.js";
import "./styles/DoctorsList.css";
import Loader from "./Loader.jsx";
import * as XLSX from "xlsx";
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { useNavigate } from "react-router-dom";
import AddDoctor from "./AddDoctor.jsx";

const DoctorsList = () => {
  const { setNotification, user } = useContext(AppContext);
  const [doctors, setDoctors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualifications: "",
    experienceYears: "",
    department: "",
    fees: "",
    availableDays: [],
    availableTime: { from: "", to: "" },
    adhaarNumber: "",
    panNumber: "",
    dateOfBirth: "",
    accNumber: "",
    ifscCode: "",
    accHolderName: "",
    salary: "",
  });
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();
  // const editRef = useRef();

  useEffect(() => {
    document.title = "Doctors List | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchDoctor();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/admin/get-departments`,
        {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await response.json();
      setDepartments(data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/admin/get-doctor-list`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,

          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log("All doctors: ", data);
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    // console.log(doctorId);
    try {
      const res = await fetch(
        `${environment.url}/api/admin/delete-doctor/${doctorId}`,
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
        setNotification(data.message);
        setDoctors((prevDoctors) =>
          prevDoctors.filter((doctor) => doctor._id !== data.deletedDoctor._id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const handleClose = () => {
  //   editRef.current.style.display = "none";
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };
  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setForm((prevData) => ({
      ...prevData,
      department: selectedDepartment,
    }));
  };
  const handleAvailableDaysChange = (e) => {
    const { value, checked } = e.target;
    setForm((prevData) => ({
      ...prevData,
      availableDays: checked
        ? [...prevData.availableDays, value]
        : prevData.availableDays.filter((day) => day !== value),
    }));
  };

  const handleEditing = (doctor) => {
    // console.log(doctor);
    // editRef.current.style.display = "flex";
    setId(doctor._id);
    setForm({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialization: doctor.specialization,
      qualifications: doctor.qualifications.join(", "),
      experienceYears: doctor.experienceYears,
      department: doctor.department,
      fees: doctor.fees,
      availableDays: doctor.availableDays,
      availableTime: doctor.availableTime || { from: "", to: "" },
      adhaarNumber: doctor.adhaarNumber,
      panNumber: doctor.panNumber,
      dateOfBirth: doctor.dateOfBirth
        ? new Date(doctor.dateOfBirth).toISOString().split("T")[0]
        : "",
      accNumber: doctor.accNumber,
      ifscCode: doctor.ifscCode,
      accHolderName: doctor.accHolderName,
      salary: doctor.salary,
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited doctor", form);
    const {
      name,
      email,
      phone,
      specialization,
      qualifications,
      experienceYears,
      department,
      availableDays,
      availableTime,
      fees,
      adhaarNumber,
      panNumber,
      dateOfBirth,
      accNumber,
      ifscCode,
      accHolderName,
      salary,
    } = form;

    const requestBody = {
      name,
      email,
      phone,
      specialization,
      qualifications: qualifications.split(",").map((qual) => qual.trim()),
      experienceYears,
      department,
      fees,
      availableDays,
      availableTime,
      adhaarNumber,
      panNumber,
      dateOfBirth,
      accNumber,
      ifscCode,
      accHolderName,
      salary,
    };
    // console.log(requestBody)
    try {
      const res = await fetch(
        `${environment.url}/api/admin/edit-doctor/${id}`,
        {
          method: "PUT",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchDoctor();
        setNotification(data.message);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...doctors]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(doctors.length / itemsPerPage);

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

  const exportToExcel = () => {
    if (doctors.length === 0) {
      setNotification("No doctor data available to export.");
      return;
    }

    // Convert doctor data to a simple JSON format for Excel
    const worksheetData = doctors.map((doctor, index) => ({
      "#": index + 1,
      "Doctor Name": doctor.name,
      Email: doctor.email,
      Phone: doctor.phone || "N/A",
      Fees: doctor.fees || "N/A",
      "Experience (Years)": doctor.experienceYears || "N/A",
      Specialization: doctor.specialization || "N/A",
      Qualifications: doctor.qualifications?.join(", ") || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doctors_List");

    // Adjust column width automatically
    worksheet["!cols"] = Object.keys(worksheetData[0]).map((key) => ({
      wch: key.length + 10, // Adjust width based on header length
    }));

    // Save file as 'Doctors_List.xlsx'
    XLSX.writeFile(workbook, "Doctors_List.xlsx");
  };
  const exportToCsv = () => {
    if (doctors.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = doctors.map((doctor, index) => ({
      "#": index + 1,
      "Doctor Name": doctor.name,
      Email: doctor.email,
      Phone: doctor.phone || "N/A",
      Fees: doctor.fees || "N/A",
      "Experience (Years)": doctor.experienceYears || "N/A",
      Specialization: doctor.specialization || "N/A",
      Qualifications: doctor.qualifications?.join(", ") || "N/A",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_DOCTORS");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "All_DOCTORS.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (doctors.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = doctors.map((doctor, index) => [
      index + 1,
      doctor.name || "",
      doctor.email || "",
      doctor.fees || "",
      doctor.specialization,
      doctor.qualifications?.join(", "),
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Doctor Name",
          "Email",
          "Fees",
          "Specialization",
          "Qualifications",
        ],
      ],
      body: tableData,
    });

    pdf.save("All_DOCTORS.pdf");
  };

  const handleAddDoctor = () => {
    // setStaffs((prevStaffs) => [newStaff, ...prevStaffs]);
    fetchDoctor();
    setIsAddModalOpen(false);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
  };

  return (
    <>
      <div className="full-doctor-list" style={{ margin: "20px 70px" }}>
        <div className="upper-wing">
          <h2>All Doctors</h2>
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
                // marginRight: "80px",
                fontWeight: "500",
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} /> PDF
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="add-consumable-btn"
          >
            Add Doctor
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="lower-wing">
            <table className="wing-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Fees</th>
                  <th>Experience (in years)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((doctor, index) => (
                    <tr key={doctor._id}>
                      <td>{index + 1}</td>
                      <td>{doctor.name}</td>
                      <td>{doctor.email}</td>
                      <td>{doctor.phone || "N/A"}</td>
                      <td>{doctor.fees || "N/A"}</td>
                      <td>{doctor.experienceYears || "N/A"}</td>
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(doctor)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteDoctor(doctor._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No Doctors Available to Show
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
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="doctor-modal-overlay">
          <div className="doctor-modal-content">
            <button
              className="doctor-modal-close-btn"
              onClick={handleModalClose}
            >
              X
            </button>
            <AddDoctor
              onClose={handleModalClose}
              onAddDoctor={handleAddDoctor}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="doctor-modal">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="edit-doctor-closeBtn"
          >
            X
          </button>
          <form onSubmit={handleEditSubmit} style={{ height: "75%" }}>
            <h2>Edit Doctor</h2>
            <div
              className="form-row fg-group"
              style={{ marginBottom: "-10px" }}
            >
              <div className="form-group">
                <label>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div
              className="form-row fg-group"
              style={{ marginBottom: "-10px" }}
            >
              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input
                  name="specialization"
                  value={form.specialization}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Qualifications</label>
                <input
                  name="qualifications"
                  value={form.qualifications}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div
              className="form-row fg-group"
              style={{ marginBottom: "-10px" }}
            >
              <div className="form-group">
                <label>Experience Years</label>
                <input
                  name="experienceYears"
                  value={form.experienceYears}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Fees</label>
                <input name="fees" value={form.fees} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row fg-group" style={{ marginBottom: "10px" }}>
              <div className="register-form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="register-form-group">
                <label>Aadhar</label>
                <input
                  type="text"
                  name="adhaarNumber"
                  value={form.adhaarNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="register-form-group">
                <label>PAN</label>
                <input
                  type="text"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="register-form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="accNumber"
                  value={form.accNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="register-form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={form.ifscCode}
                  onChange={handleChange}
                />
              </div>
              <div className="register-form-group">
                <label>Account Holder</label>
                <input
                  type="text"
                  name="accHolderName"
                  value={form.accHolderName}
                  onChange={handleChange}
                />
              </div>
              <div className="register-form-group">
                <label>Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}
    </>
  );
};

export default DoctorsList;
