import React, { useState, useEffect, useContext } from "react";
import "./styles/PatientAdmission.css";
import { AppContext } from "../context/AppContext";

const PatientAdmissionForm = () => {
    const {setNotification} = useContext(AppContext);
  const [formData, setFormData] = useState({
    patientId: "",
    patientName: "",
    admissionDate: "",
    dischargeDate: "",
    doctorId: "",
    doctorName: "",
    roomId: "",
    wingId: "",
    reasonForAdmission: "",
  });

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [wings, setWings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [patientsRes, doctorsRes, roomsRes, wingsRes] = await Promise.all([
        fetch("http://localhost:8000/api/patient/patients-list", {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }),
        fetch("http://localhost:8000/api/employee/get-doctors", {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }),
        fetch("http://localhost:8000/api/ipd/get-rooms", {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }),
        fetch("http://localhost:8000/api/ipd/get-wings", {
          method: "GET",
          headers: {
            token: localStorage.getItem("token"),
          },
        }),
      ]);

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const roomsData = await roomsRes.json();
      const wingsData = await wingsRes.json();

      setPatients(patientsData.patientDetails);
      setDoctors(doctorsData.doctors);
      setRooms(roomsData.rooms);
      setWings(wingsData.wings);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log(formData);
    try {
      const response = await fetch(
        "http://localhost:8000/api/ipd/admit-patient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.getItem('token')
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setFormData({
          patientId: "",
          patientName: "",
          admissionDate: "",
          dischargeDate: "",
          doctorId: "",
          doctorName: "",
          roomId: "",
          wingId: "",
          reasonForAdmission: "",
        });
        setNotification(data.message);
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setNotification(data.message);
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
      patientName: `${patient.patientName} (${patient.mobile})`,
    }));
    setFilteredPatients([]);
  };

  const handleDoctorInput = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      doctorName: value,
    }));
    if (value.length > 3) {
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
      <h2 className="form-title">Patient Admission Form</h2>
      <div className="form-row">
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
            required
          />
          {filteredPatients.length > 0 && (
            <ul className="autocomplete-dropdown">
              {filteredPatients.map((patient) => (
                <li
                  key={patient._id}
                  onClick={() => handlePatientSelect(patient)}
                  className="dropdown-item"
                >
                  {patient.patientName} ({patient.mobile})
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
            required
          />
          {filteredDoctors.length > 0 && (
            <ul className="autocomplete-dropdown">
              {filteredDoctors.map((doctor) => (
                <li
                  key={doctor._id}
                  onClick={() => handleDoctorSelect(doctor)}
                  className="dropdown-item"
                >
                  {doctor.name} ({doctor.phone})
                </li>
              ))}
            </ul>
          )}
        </label>
      </div>

      <div className="form-row">
        <label className="form-label">
          Admission Date:
          <input
            className="form-input"
            type="date"
            name="admissionDate"
            value={formData.admissionDate}
            onChange={handleInputChange}
            required
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
      </div>

      <div className="form-row">
        <label className="form-label">
          Room:
          <select
            className="form-select"
            name="roomId"
            value={formData.roomId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Room</option>
            {rooms
              .filter((room) => room.currentOccupancy < room.capacity) // Filter rooms based on currentOccupancy
              .map((room) => (
                <option key={room._id} value={room._id}>
                  {room.roomNumber}
                </option>
              ))}
          </select>
        </label>
        <label className="form-label">
          Wing:
          <select
            className="form-select"
            name="wingId"
            value={formData.wingId}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Wing</option>
            {wings.map((wing) => (
              <option key={wing._id} value={wing._id}>
                {wing.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-label">
        Reason for Admission:
        <textarea
          className="form-textarea"
          name="reasonForAdmission"
          value={formData.reasonForAdmission}
          onChange={handleInputChange}
          required
        />
      </label>

      <button className="form-submit-button" type="submit">
        Submit Admission
      </button>
    </form>
  );
};

export default PatientAdmissionForm;
