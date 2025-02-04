import React, { useState, useEffect, useContext } from "react";
import "./styles/PatientAdmission.css";
import { AppContext } from "../context/AppContext";
import { environment } from "../../utlis/environment.js";
import { getUserDetails } from "../../utlis/userDetails.js";
import { useNavigate } from "react-router-dom";

const PatientAdmissionForm = () => {
  const { user, setNotification } = useContext(AppContext);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    admissionDate: "",
    timeOfAdmission: "",
    dischargeTime: "",
    dischargeDate: "",
    doctorId: "",
    doctorName: "",
    roomId: "",
    wingId: "",
    bedId: "",
    reasonForAdmission: "",
    referenceLetter: "",
    referenceDoctor: "",
    referredBy: "",
    referredById: "",
    diagnosis:""
  });

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [wings, setWings] = useState([]);
  const [beds, setBeds] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    document.title = "IPD Admission | HMS";
    if (!user || (user.role !== "admin" && user.role !== "counter")) {
      setNotification("You are not authorised to access this page");
      nav("/");
    }
  }, [user, nav, setNotification]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [patientsRes, doctorsRes, roomsRes, wingsRes, agentsRes] =
        await Promise.all([
          fetch(`${environment.url}/api/patient/patients-list`, {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }),
          fetch(`${environment.url}/api/employee/get-doctors`, {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }),
          fetch(`${environment.url}/api/ipd/get-rooms`, {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }),
          fetch(`${environment.url}/api/ipd/get-wings`, {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }),
          fetch(`${environment.url}/api/admin/get-agent-staff`, {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }),
        ]);

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const roomsData = await roomsRes.json();
      const wingsData = await wingsRes.json();
      const agentsData = await agentsRes.json();

      setPatients(patientsData.patientDetails);
      setDoctors(doctorsData.doctors);
      setRooms(roomsData.rooms);
      // console.log(roomsData);
      setWings(wingsData.wings);
      setAgents(agentsData.allItems);
      // console.log(agentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "wingId") {
      const filtered = rooms.filter((room) => room.wingId._id === value);
      setFilteredRooms(filtered);
      setFormData((prevData) => ({ ...prevData, roomId: "", bedId: "" }));
      setBeds([]);
    }

    if (name === "roomId") {
      const selectedRoom = rooms.find((room) => room._id === value);
      if (selectedRoom) {
        setBeds(selectedRoom.beds.filter((bed) => !bed.isOccupied));
      } else {
        setBeds([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("ipd data", formData);
    const userDetails = getUserDetails();
    const updatedForm = { ...formData, ...userDetails };
    // console.log("ipd creation data: ", updatedForm);
    try {
      const response = await fetch(`${environment.url}/api/ipd/admit-patient`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("token"),
        },
        body: JSON.stringify(updatedForm),
      });
      const data = await response.json();

      if (response.ok) {
        nav("/ipd/all-ipds");
        setBeds([]);
        setFilteredRooms([]);
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setNotification("An error occurred while admitting the patient.");
    }
  };

  const handlePatientInput = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      patientName: value,
    }));

    if (value.length >= 3) {
      const filtered = patients.filter((patient) =>
        patient.patientName.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredPatients(filtered);
    } else {
      setFilteredPatients([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setFormData((prevData) => ({
      ...prevData,
      patientId: patient._id,
      patientName: `${patient.patientName}`,
    }));
    setFilteredPatients([]);
  };

  const handleAgentInput = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
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
    setFormData((prevData) => ({
      ...prevData,
      referredById: agent._id,
      referredBy: `${agent.name}`,
    }));
    setFilteredAgents([]);
  };

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
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
    setFormData((prevData) => ({
      ...prevData,
      doctorId: doctor._id,
      doctorName: doctor.name,
    }));
    setFilteredDoctors([]);
  };

  return (
    <form className="patient-admission-form" onSubmit={handleSubmit}>
      <h2 className="form-title" style={{ marginBottom: "5px" }}>
        Patient Admission Form
      </h2>
      <div className="form-row fg-group">
        <label className="form-label">
          Patient Name:
          <input
            className="form-input"
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handlePatientInput}
            placeholder="Search Patient by Name"
            autoComplete="off"
          />
          {filteredPatients.length > 0 && (
            <ul className="ipd-autocomplete-dropdown">
              {filteredPatients.map((patient) => (
                <li
                  key={patient._id}
                  onClick={() => handlePatientSelect(patient)}
                  className="ipd-dropdown-item"
                >
                  {patient.patientName} ({patient.uhid})
                </li>
              ))}
            </ul>
          )}
        </label>
        <label className="form-label">
          Doctor Name:
          <input
            className="form-input"
            type="text"
            name="doctorName"
            value={formData.doctorName}
            onChange={handleDoctorInput}
            placeholder="Search Doctor by Name"
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
          Diagnosis:
          <input
            className="form-input"
            type="text"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            placeholder="Diagnosis here"
          />
        </label>
      </div>

      <div className="form-row fg-group">
        <label className="form-label">
          Admission Date:
          <input
            className="form-input"
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleInputChange}
          />
        </label>
        <label className="form-label">
          Admission Time:
          <input
            className="form-input"
            type="time"
            name="timeOfAdmission"
            value={formData.timeOfAdmission}
            onChange={handleInputChange}
            style={{height:"43px"}}
          />
        </label>
        <label className="form-label">
          Discharge Date:
          <input
            className="form-input"
            type="date"
            name="dischargeDate"
            value={formData.dischargeDate}
            onChange={handleInputChange}
          />
        </label>
        <label className="form-label">
          Discharge Time:
          <input
            className="form-input"
            type="time"
            name="dischargeTime"
            value={formData.dischargeTime}
            onChange={handleInputChange}
            style={{height:"43px"}}
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
            value={formData.referredBy}
            onChange={handleAgentInput}
            placeholder="Search Agent by Name"
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
          Reference Letter No. :
          <input
            className="form-input"
            type="text"
            name="referenceLetter"
            value={formData.referenceLetter}
            onChange={handleInputChange}
            placeholder="Reference letter here"
          />
        </label>
        <label className="form-label">
          Reference Doctor:
          <input
            className="form-input"
            type="text"
            name="referenceDoctor"
            value={formData.referenceDoctor}
            onChange={handleInputChange}
            placeholder="Reference doctor here"
          />
        </label>
      </div>

      <div className="form-row fg-group">
        <label className="form-label">
          Wing:
          <select
            className="form-select"
            name="wingId"
            value={formData.wingId}
            onChange={handleInputChange}
          >
            <option value="">Select Wing</option>
            {wings.map((wing) => (
              <option key={wing._id} value={wing._id}>
                {wing.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Room:
          <select
            className="form-select"
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
          >
            <option value="">Select Room</option>
            {filteredRooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomNumber}
              </option>
            ))}
          </select>
        </label>

        <label className="form-label">
          Bed:
          <select
            className="form-select"
            name="bedId"
            value={formData.bedId}
            onChange={handleInputChange}
          >
            <option value="">Select Bed</option>
            {beds.map((bed) => (
              <option key={bed._id} value={bed._id}>
                {bed.bedName}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="form-row fg-group">
        <label className="form-label">
          Reason for Admission:
          <textarea
            className="form-textarea"
            name="reasonForAdmission"
            value={formData.reasonForAdmission}
            onChange={handleInputChange}
            placeholder="Write your reasons here"
          />
        </label>
      </div>

      <button className="form-submit-button" type="submit">
        Submit Admission
      </button>
    </form>
  );
};

export default PatientAdmissionForm;
