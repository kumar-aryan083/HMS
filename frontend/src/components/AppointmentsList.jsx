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
import Loader from "./Loader.jsx";
import * as XLSX from "xlsx"; // Import xlsx library
import jsPDF from "jspdf"; // For PDF
import "jspdf-autotable"; // For PDF tables
import { useNavigate } from "react-router-dom";
import Appointment from "./Appointment.jsx";

const AppointmentsList = () => {
  const { user, setNotification } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [id, setId] = useState(false);
  const [form, setForm] = useState({
    doctor: "",
    department: "",
    appointmentDate: "",
    appointmentTime: {
      from: "",
      to: "",
    },
    reason: "",
  });
  const [doctorList, setDoctorList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  const editRef = useRef();
  const nav = useNavigate();

  useEffect(() => {
    document.title = "Appointments List | HMS";
    if (!user || (user.role !== "admin" && user.role !== "counter")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchAppointments();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [departmentsResponse, doctorsResponse] = await Promise.all([
        fetch(`${environment.url}/api/admin/get-departments`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }),
        fetch(`${environment.url}/api/employee/get-doctors`, {
          method: "GET",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
        }),
      ]);

      if (!departmentsResponse.ok || !doctorsResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const departmentsData = await departmentsResponse.json();
      const doctorsData = await doctorsResponse.json();

      setDepartmentList(departmentsData.departments);
      setDoctorList(doctorsData.doctors);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/appointments-list`,
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
        // console.log("All appointments: ", data);
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    // console.log(appointmentId);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/delete-appointment/${appointmentId}`,
        {
          method: "DELETE",
          headers: {
            "x-tenant-id": environment.tenantId,
            token: localStorage.getItem("token"),
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        fetchAppointments();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClose = () => {
    editRef.current.style.display = "none";
  };

  const handleEditing = (appointment) => {
    // console.log(appointment);
    editRef.current.style.display = "flex";
    setId(appointment._id);
    // setForm({
    //   name: nurse.name,
    //   patientTypes: nurse.patientTypes,
    //   railwayCode: nurse.railwayCode,
    //   nabhPrice: nurse.nabhPrice,
    //   nonNabhPrice: nurse.nonNabhPrice,
    // });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // console.log("edited appointment", form);
    try {
      const res = await fetch(
        `${environment.url}/api/patient/update-appointment/${id}`,
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
        fetchAppointments();
        setNotification(data.message);
        handleClose();
      }
    } catch (error) {
      console.log(error);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = [...appointments]
    .slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(appointments.length / itemsPerPage);

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
    if (appointments.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = appointments.map((appointment, index) => ({
      "#": index + 1,
      "Patient UHID": appointment.patient?.uhid || "-",
      "Patient Name": appointment.patient?.patientName || "-",
      Department: appointment.department?.name || "-",
      "Appointment Date":
        formatDateToDDMMYYYY(appointment.appointmentDate) || "-",
      "Appointment Time":
        `${appointment.appointmentTime?.from} to ${appointment.appointmentTime?.to}` ||
        "-",
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ALL_Appointments");

    // Save file
    XLSX.writeFile(workbook, "ALL_Appointments.xlsx");
  };

  const exportToCsv = () => {
    if (appointments.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const worksheetData = appointments.map((appointment, index) => ({
      "#": index + 1,
      "Patient UHID": appointment.patient?.uhid || "-",
      "Patient Name": appointment.patient?.patientName || "-",
      Department: appointment.department?.name || "-",
      "Appointment Date":
        formatDateToDDMMYYYY(appointment.appointmentDate) || "-",
      "Appointment Time":
        `${appointment.appointmentTime?.from} to ${appointment.appointmentTime?.to}` ||
        "-",
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ALL_Appointments");

    // Write workbook as CSV
    XLSX.writeFile(workbook, "ALL_Appointments.csv", { bookType: "csv" });
  };

  const exportToPdf = () => {
    if (appointments.length === 0) {
      setNotification("No data available to export.");
      return;
    }

    const pdf = new jsPDF();
    const tableData = appointments.map((appointment, index) => [
      index + 1,
      appointment.patient?.uhid || "-",
      appointment.patient?.patientName || "-",
      appointment.department?.name || "-",
      formatDateToDDMMYYYY(appointment.appointmentDate) || "-",
      `${appointment.appointmentTime?.from} to ${appointment.appointmentTime?.to}` ||
        "-",
    ]);

    pdf.autoTable({
      head: [
        [
          "#",
          "Patient UHID",
          "Patient Name",
          "Department",
          "Appointment Date",
          "Appointment Time",
        ],
      ],
      body: tableData,
    });

    pdf.save("ALL_Appointments.pdf");
  };

  const handleAddAppointment = () => {
    // setStaffs((prevStaffs) => [newStaff, ...prevStaffs]);
    fetchAppointments();
    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="all-ipds-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 50px",
          }}
        >
          <h1>All Appointments</h1>
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
            style={{ margin: "auto 0" }}
          >
            Add Appointment
          </button>
        </div>
        <hr className="am-h-line" style={{ margin: "10px 50px" }} />
      </div>
      {loading ? (
        <Loader />
      ) : (
        <div className="lower-wing" style={{ margin: "0 50px" }}>
          <table className="wing-table" style={{ marginTop: "-20px" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient UHID</th>
                <th>Patient Name</th>
                <th>Department</th>
                <th>Appointment Date</th>
                <th>Appointment Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems?.length > 0 ? (
                currentItems.map((appointment, index) => (
                  <tr key={appointment._id}>
                    <td>{index + 1}</td>
                    <td>{appointment.patient?.uhid}</td>
                    <td>{appointment.patient?.patientName}</td>
                    <td>{appointment.department?.name}</td>
                    <td>{formatDateToDDMMYYYY(appointment.appointmentDate)}</td>
                    <td>
                      {appointment.appointmentTime?.from} to{" "}
                      {appointment.appointmentTime?.to}
                    </td>
                    <td className="wing-btn">
                      <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => handleEditing(appointment)}
                        title="Edit"
                        className="icon"
                      />
                      <FontAwesomeIcon
                        icon={faTrashAlt}
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        title="Delete"
                        className="icon"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No Appointments Available to Show
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
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <div className="edit-wing" ref={editRef}>
        <div className="modal-content"style={{paddingTop: "10px",height: "68%"}}>
          <button type="button" onClick={handleClose} className="appointment-closeBtn">
            X
          </button>
          <h3>Edit Appointment</h3>
          <form onSubmit={handleEditSubmit}>
            <div className="form-row fg-group">
              <div className="form-group">
                <label className="a-label">Doctor</label>
                <select
                  name="doctor"
                  value={form.doctor}
                  onChange={handleChange}
                >
                  <option value="">Select Doctor</option>
                  {doctorList.map((doctor) => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="a-label">Department</label>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departmentList.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row fg-group">
              <div className="form-group">
                <label className="a-label">Appointment Date</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={form.appointmentDate}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="a-label">Appointment Time</label>
                <div className="input-pair">
                  <input
                    type="time"
                    name="from"
                    value={form.appointmentTime.from}
                    onChange={(e) =>
                      setForm((prevData) => ({
                        ...prevData,
                        appointmentTime: {
                          ...prevData.appointmentTime,
                          from: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="time"
                    name="to"
                    value={form.appointmentTime.to}
                    onChange={(e) =>
                      setForm((prevData) => ({
                        ...prevData,
                        appointmentTime: {
                          ...prevData.appointmentTime,
                          to: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="form-row fg-group">
              <div className="form-group">
                <label className="a-label">Reason</label>
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="appointment-submit-btn">
              Update Appointment
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="appointment-modal-overlay">
          <div className="appointment-modal-content">
            <button
              className="appointment-modal-close-btn"
              onClick={handleModalClose}
            >
              X
            </button>
            <Appointment
              onClose={handleModalClose}
              onAddAppointment={handleAddAppointment}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsList;
