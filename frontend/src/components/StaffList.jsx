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
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import Register from "./Register.jsx";

const StaffList = () => {
  const { setNotification, user } = useContext(AppContext);
  const [staffs, setStaffs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const nav = useNavigate();
  // const editRef = useRef();

  useEffect(() => {
    document.title = "Staff List | HMS";
    if (!user || user.role !== "admin") {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchDoctor();
  }, []);

  const fetchDoctor = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${environment.url}/api/common/get-staff-list`, {
        method: "GET",
        headers: {
          "x-tenant-id": environment.tenantId,
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log("All staffs: ", data);
        setStaffs(data.totalItems);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    // console.log(doctorId);
    // try {
    //   const res = await fetch(
    //     `${environment.url}/api/admin/delete-doctor/${doctorId}`,
    //     {
    //       method: "DELETE",
    //       headers: {
    //         "x-tenant-id": environment.tenantId,
    //         "Content-Type": "application/json",
    //         token: localStorage.getItem("token"),
    //       },
    //     }
    //   );
    //   const data = await res.json();
    //   if (res.ok) {
    //     setNotification(data.message);
    //     setDoctors((prevDoctors) =>
    //       prevDoctors.filter((doctor) => doctor._id !== data.deletedDoctor._id)
    //     );
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
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

  const handleEditing = (staff) => {
    if (staff.role === "doctor") {
      // Navigate to another URL for doctors
      nav(`/doctor-list`);
    } else {
      // Open the popup for non-doctor staff
      setEditData(staff); // Pass staff data to modal
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData(null); // Clear edit data when closing modal
  };

  const handleEditSubmit = async () => {
    // console.log('fetching the data again')
    fetchDoctor();
  };

  const exportToExcel = () => {
    if (staffs.length === 0) {
      setNotification("No data available to export.");
      return;
    }
  
    const worksheetData = staffs.map((staff, index) => ({
      "#": index + 1,
      Role: staff.role ? staff.role.toUpperCase() : "DOCTOR",
      Name: staff.name || "N/A",
      Email: staff.email || "N/A",
      Phone: staff.phone || "N/A",
      Aadhar: staff.aadharNumber || "N/A",
      PAN: staff.panNumber || "N/A",
      DOB: staff.dateOfBirth
        ? formatDateToDDMMYYYY(staff.dateOfBirth)
        : "N/A",
      "Account No.": staff.accNumber || "N/A",
      "Account Holder": staff.accHolderName || "N/A",
      IFSC: staff.ifscCode || "N/A",
      Salary: staff.salary || "N/A",
    }));
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_Staffs");
  
    // Save the file
    XLSX.writeFile(workbook, "All_Staffs.xlsx");
  };

  const exportToCsv = () => {
    if (staffs.length === 0) {
      setNotification("No data available to export.");
      return;
    }
  
    const worksheetData = staffs.map((staff, index) => ({
      "#": index + 1,
      Role: staff.role ? staff.role.toUpperCase() : "DOCTOR",
      Name: staff.name || "N/A",
      Email: staff.email || "N/A",
      Phone: staff.phone || "N/A",
      Aadhar: staff.aadharNumber || "N/A",
      PAN: staff.panNumber || "N/A",
      DOB: staff.dateOfBirth
        ? formatDateToDDMMYYYY(staff.dateOfBirth)
        : "N/A",
      "Account No.": staff.accNumber || "N/A",
      "Account Holder": staff.accHolderName || "N/A",
      IFSC: staff.ifscCode || "N/A",
      Salary: staff.salary || "N/A",
    }));
  
    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All_Staffs");
  
    // Save the file as CSV
    XLSX.writeFile(workbook, "All_Staffs.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (staffs.length === 0) {
      setNotification("No data available to export.");
      return;
    }
  
    const pdf = new jsPDF();
    const tableData = staffs.map((staff, index) => [
      index + 1,
      staff.role ? staff.role.toUpperCase() : "DOCTOR",
      staff.name || "N/A",
      staff.email || "N/A",
      staff.phone || "N/A",
      staff.aadharNumber || "N/A",
      staff.panNumber || "N/A",
      staff.dateOfBirth
        ? formatDateToDDMMYYYY(staff.dateOfBirth)
        : "N/A",
      staff.accNumber || "N/A",
      staff.accHolderName || "N/A",
      staff.ifscCode || "N/A",
      staff.salary || "N/A",
    ]);
  
    pdf.autoTable({
      head: [
        [
          "#",
          "Role",
          "Name",
          "Email",
          "Phone",
          "Aadhar",
          "PAN",
          "DOB",
          "Account No.",
          "Account Holder",
          "IFSC",
          "Salary",
        ],
      ],
      body: tableData,
    });
  
    pdf.save("All_Staffs.pdf");
  };

  const handleAddStaff = () => {
    // setStaffs((prevStaffs) => [newStaff, ...prevStaffs]);
    fetchDoctor();
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...staffs]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(staffs.length / itemsPerPage);

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
  return (
    <>
      <div className="full-doctor-list" style={{ margin: "20px 30px" }}>
        <div className="upper-wing">
          <h2>All Staffs</h2>
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
            onClick={() => setIsModalOpen(true)}
            className="add-consumable-btn"
          >
            Add Staff
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="lower-wing">
            <table className="wing-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Aadhar</th>
                  <th>PAN</th>
                  <th>DOB</th>
                  <th>Account No.</th>
                  <th>Account Holder</th>
                  <th>IFSC</th>
                  <th>Salary</th>
                  <th>Action</th>
                  {/* <th>Experience (in years)</th> */}
                  {/* <th>Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((staff, index) => (
                    <tr key={staff._id}>
                      <td>
                        {staff.role ? staff.role.toUpperCase() : "DOCTOR"}
                      </td>
                      <td>{staff.name}</td>
                      <td>{staff.email || "N/A"}</td>
                      <td>{staff.phone || "N/A"}</td>
                      <td>{staff.adhaarNumber || "N/A"}</td>
                      <td>{staff.panNumber || "N/A"}</td>
                      <td>
                        {staff.dateOfBirth
                          ? new Date(staff.dateOfBirth).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{staff.accNumber || "N/A"}</td>
                      <td>{staff.accHolderName || "N/A"}</td>
                      <td>{staff.ifscCode || "N/A"}</td>
                      <td>{staff.salary || "N/A"}</td>
                      <td style={{ textAlign: "center" }}>
                        <FontAwesomeIcon
                          icon={faEdit}
                          title="Edit"
                          className="icon"
                          onClick={() => handleEditing(staff)}
                        />
                      </td>
                      {/* <td>{doctor.experienceYears || "N/A"}</td> */}
                      {/* <td className="wing-btn">
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
                      </td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No Staffs Available to Show
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

      {isModalOpen && (
        <div className="staff-modal-overlay">
          <div className="staff-modal-content">
            <button
              className="staff-modal-close-btn"
              onClick={handleModalClose}
            >
              X
            </button>
            <Register
              onClose={handleModalClose}
              onAddStaff={handleAddStaff}
              onEditStaff={handleEditSubmit}
              editData={editData}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default StaffList;
