import React, { useContext, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faFileCsv,
  faFileExcel,
  faFilePdf,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { AppContext } from "../context/AppContext";
import { environment } from "../../utlis/environment";
import Loader from "./Loader";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { useNavigate } from "react-router-dom";
import AddDepartment from "./AddDepartment";

const DepartmentList = () => {
  const { setNotification, user } = useContext(AppContext);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    headOfDepartment: "",
    servicesOffered: "",
  });
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const nav = useNavigate();
  const editRef = useRef();

  useEffect(() => {
    document.title = "Departments List | HMS";
    if (editRef.current) {
      editRef.current.style.display = "none";
    }
    fetchDepartments();
  }, []);

  // useEffect(() => {
  //   document.title = "Departments List | HMS";
  //   if (!user || user.role !== "admin") {
  //     setNotification("You are not authorised to access this page");
  //     nav("/");
  //   }
  // }, [user, nav, setNotification]);

  const fetchDepartments = async () => {
    setLoading(true);
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
      // console.log("departments", data);
      setDepartments(data.departments);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (deptId) => {
    // console.log(deptId);
    try {
      const res = await fetch(
        `${environment.url}/api/admin/delete-department/${deptId}`,
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
        setDepartments((prevDept) =>
          prevDept.filter((dept) => dept._id !== data.deletedDepartment._id)
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleEditing = (dept) => {
    // console.log(dept);
    const servicesString = dept.servicesOffered
      ? dept.servicesOffered.join(", ")
      : "";
    editRef.current.style.display = "flex";
    setId(dept._id);
    setForm({
      name: dept.name,
      location: dept.location,
      headOfDepartment: dept.headOfDepartment,
      servicesOffered: servicesString,
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited department", form);
    const { name, location, headOfDepartment, servicesOffered } = form;
    const services = servicesOffered
      .split(",")
      .map((service) => service.trim());

    const requestBody = {
      name,
      location,
      headOfDepartment,
      servicesOffered: services,
    };
    try {
      const res = await fetch(
        `${environment.url}/api/admin/edit-department/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(requestBody),
        }
      );
      const data = await res.json();
      if (res.ok) {
        fetchDepartments();
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddDepartment = () => {
    // setStaffs((prevStaffs) => [newStaff, ...prevStaffs]);
    fetchDepartments();
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...departments]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(departments.length / itemsPerPage);

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

  const exportToExcel = () => {
    if (departments.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = departments.map((department, index) => ({
      "#": index + 1,
      Name: department.name || "-",
      Location: department.location || "-",
      "Head of Department": department.headOfDepartment || "-",
      "Services Offered": department.servicesOffered.join(", ") || "-",
      "Created At": formatDateToDDMMYYYY(department.createdAt) || "-",
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "ALL_Departments");

    // Save file
    XLSX.writeFile(workbook, "ALL_Departments.xlsx");
  };

  const exportToCsv = () => {
    if (departments.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = departments.map((department, index) => ({
      "#": index + 1,
      Name: department.name || "-",
      Location: department.location || "-",
      "Head of Department": department.headOfDepartment || "-",
      "Services Offered": department.servicesOffered.join(", ") || "-",
      "Created At": formatDateToDDMMYYYY(department.createdAt) || "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ALL_Departments");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "ALL_Departments.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (departments.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = departments.map((department, index) => [
      index + 1,
      department.name || "-",
      department.location || "-",
      department.headOfDepartment || "-",
      department.servicesOffered.join(", ") || "-",
      formatDateToDDMMYYYY(department.createdAt) || "-",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Name",
          "Location",
          "Head of Department",
          "Services Offered",
          "Created At",
        ],
      ],
      body: tableData,
    });

    pdf.save("ALL_Departments.pdf");
  };

  return (
    <>
      <div className="full-doctor-list" style={{ margin: "20px 70px" }}>
        <div className="upper-wing">
          <h2>All Departments</h2>
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
            Add Department
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
                  <th>Location</th>
                  <th>Head of Department</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.length > 0 ? (
                  currentItems.map((dept, index) => (
                    <tr key={dept._id}>
                      <td>{index + 1}</td>
                      <td>{dept.name}</td>
                      <td>{dept.location}</td>
                      <td>{dept.headOfDepartment}</td>
                      <td>{new Date(dept.createdAt).toLocaleDateString()}</td>
                      <td className="wing-btn">
                        <FontAwesomeIcon
                          icon={faEdit}
                          onClick={() => handleEditing(dept)}
                          title="Edit"
                          className="icon"
                        />
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          onClick={() => handleDeleteDepartment(dept._id)}
                          title="Delete"
                          className="icon"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No Departments Available to Show
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
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

      <div className="department-modal-container edit-department-modal" ref={editRef}>
        <div className="department-modal-content">
          <button
            type="button"
            onClick={handleClose}
            className="department-modal-close-btn"
          >
            X
          </button>
          <h3 className="department-modal-title">Edit Department</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row " style={{marginBottom: "-20px"}}>
              <div className="form-group">
                <label htmlFor="name">
                  Department Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row" style={{marginBottom: "-20px"}}>
              <div className="form-group">
                <label htmlFor="headOfDepartment">
                  Head of Department
                </label>
                <input
                  type="text"
                  id="headOfDepartment"
                  name="headOfDepartment"
                  className="form-input"
                  value={form.headOfDepartment}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="servicesOffered">
                  Services Offered (comma separated)
                </label>
                <input
                  type="text"
                  id="servicesOffered"
                  name="servicesOffered"
                  className="form-input"
                  value={form.servicesOffered}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="department-modal-submit-btn">
              Update Department
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="staff-modal-overlay">
          <div className="staff-modal-content" style={{height: "68%"}}>
            <button
              className="staff-modal-close-btn"
              onClick={handleModalClose}
            >
              X
            </button>
            <AddDepartment
              onClose={handleModalClose}
              onAddDepartment={handleAddDepartment}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentList;
