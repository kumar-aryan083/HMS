import React, { useContext, useEffect, useRef, useState } from "react";
import "./styles/OpdForm.css";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { environment } from "../../../utlis/environment.js";
import { getUserDetails } from "../../../utlis/userDetails.js";
import { useReactToPrint } from "react-to-print";
import OpdLetterHead from "../OpdLetterHead.jsx";

const OpdForm = () => {
  const { setNotification, user } = useContext(AppContext);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    appointment: {
      date: "",
      time: "",
      department: "",
      doctor: "",
      consultationType: "New Consultation",
      reasonForVisit: "",
    },
  });

  const nav = useNavigate();
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    contentRef: printRef
  });
  useEffect(() => {
    document.title = "OPD Form | HMS";
    if (!user || (user.role !== "admin" && user.role !== "counter")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchDepartments();
    fetchDoctors();
    fetchPatients(); // Fetch all patients on component load
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(`${environment.url}/api/admin/get-departments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.log("Error fetching departments:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${environment.url}/api/employee/get-doctors`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.log("Error fetching doctors:", error);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${environment.url}/api/patient/get-all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
      });
      const data = await res.json();
      if (res.ok) {
        // console.log(data);
        setPatients(data.patients || []);
      }
    } catch (error) {
      console.log("Error fetching patients:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const [section, key] = name.split(".");

    if (name === "patientName") {
      // Only filter patients when the input has more than 3 characters
      if (value.length >= 2) {
        const filtered = patients.filter((patient) =>
          patient.patientName.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredPatients(filtered);
      } else {
        setFilteredPatients([]); // Clear suggestions if input length is less than 3
      }
    }
    
    if(name === "appointment.doctor"){
      const doctor = doctors.find((doctor)=> doctor._id === value);
      setDoctorName(doctor.name);
    }

    if (key) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePatientSelect = (patient) => {
    // console.log("selected patient",patient);
    setFormData((prev) => ({
      ...prev,
      patientName: patient.patientName,
      phone: patient.mobile,
    }));
    setSelectedPatient(patient);
    setFilteredPatients([]); // Clear suggestions after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userDetails = getUserDetails();
    const updatedForm = { ...formData, ...userDetails };
    try {
      const res = await fetch(`${environment.url}/api/opd/create-opd`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        setFormData({
          patientName: "",
          phone: "",
          appointment: {
            date: "",
            time: "",
            department: "",
            doctor: "",
            consultationType: "New Consultation",
            reasonForVisit: "",
          },
        });
        // setSelectedPatient({ ...formData });
        setTimeout(() => {
          handlePrint();
        }, 150);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  return (
    <>
      <form className="opd-form-container" onSubmit={handleSubmit}>
        <h2 className="opd-form-heading">OPD Form</h2>

        {/* Patient Information */}
        <h3 className="opd-heading">Patient Information</h3>
        <div className="headline-line h-line-extra"></div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label>Patient Name</label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              autoComplete="off"
            />
            {filteredPatients.length > 0 && (
              <ul className="suggestions-list">
                {filteredPatients.map((patient) => (
                  <li
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                  >
                    {patient.patientName} ({patient.mobile})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label className="o-label">Patient Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly
            />
          </div>
        </div>

        {/* Appointment Details */}
        <div className="form-row fg-group">
          <div className="form-group">
            <label className="o-label">Appointment Date</label>
            <input
              type="date"
              name="appointment.date"
              value={formData.appointment.date}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="appointment.time"
              value={formData.appointment.time}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="o-label">Department</label>
            <select
              name="appointment.department"
              value={formData.appointment.department}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row fg-group">
          <div className="form-group">
            <label className="o-label">Doctor</label>
            <select
              name="appointment.doctor"
              value={formData.appointment.doctor}
              onChange={handleInputChange}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doct) => (
                <option key={doct._id} value={doct._id}>
                  {doct.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="o-label">Consultation Type</label>
            <select
              name="appointment.consultationType"
              value={formData.appointment.consultationType}
              onChange={handleInputChange}
            >
              <option value="New Consultation">New Consultation</option>
              <option value="Follow-up">Follow-up</option>
            </select>
          </div>
          <div className="form-group">
            <label>Reason for Visit</label>
            <input
              type="text"
              name="appointment.reasonForVisit"
              value={formData.appointment.reasonForVisit}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button type="submit" className="opd-submit-btn">
          Submit
        </button>
      </form>
      <div>
        <OpdLetterHead printRef={printRef} patientDetails={selectedPatient} doctorName={doctorName} />
      </div>
    </>
  );
};

export default OpdForm;
