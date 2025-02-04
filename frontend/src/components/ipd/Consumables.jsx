import React, { useState, useEffect, useContext } from "react";
import "./styles/Consumables.css";
import { environment } from "../../../utlis/environment";
import { AppContext } from "../../context/AppContext";

const Consumables = ({ admissionId, toggleConsumablesPopup, onAssign }) => {
  const { setNotification } = useContext(AppContext);
  const [doctorsList, setDoctorsList] = useState([]);
  const [medications, setMedications] = useState([
    { type: "Tablet", name: "", dosage: "", duration: "" },
  ]);
  const [medicationList, setMedicationList] = useState([]);
  const [formData, setFormData] = useState({
    doctor: "",
    doctorId: "",
    quantity: "",
    status: "Pending",
  });
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          `${environment.url}/api/employee/get-doctors`,
          {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctorsList(data.doctors);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    const fetchMedications = async () => {
      try {
        const response = await fetch(
          `${environment.url}/api/pharmacy/get-medicines`,
          {
            method: "GET",
            headers: {
              "x-tenant-id": environment.tenantId,
              token: localStorage.getItem("token"),
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch medications");
        const data = await response.json();
        // console.log("medicines fetched from pharmacy", data)
        setMedicationList(data.items);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchDoctors();
    fetchMedications();
  }, []);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const updatedMedications = medications.map((medication, idx) =>
      idx === index ? { ...medication, [name]: value } : medication
    );
    setMedications(updatedMedications);

    if (name === "name" && value.length >= 2) {
      const filtered = medicationList.filter((medication) =>
        medication.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines([]);
    }
  };

  const handleMedicationSelect = (medication, index) => {
    const updatedMedications = medications.map((med, idx) =>
      idx === index ? { ...med, name: medication.name } : med
    );
    setMedications(updatedMedications);
    setFilteredMedicines([]);
  };

  const handleAddRow = () => {
    setMedications([
      ...medications,
      { type: "Tablet", name: "", dosage: "", duration: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    if (medications.length > 1) {
      const updatedMedications = medications.filter((_, idx) => idx !== index);
      setMedications(updatedMedications);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSubmit = {
      medications: medications,
      doctor: formData.doctor,
      doctorId: formData.doctorId,
      quantity: formData.quantity,
      status: formData.status,
    };
    try {
      const res = await fetch(
        `${environment.url}/api/ipd/${admissionId}/add-consumables`,
        {
          method: "POST",
          headers: {
            "x-tenant-id": environment.tenantId,
            "Content-Type": "application/json",
            token: localStorage.getItem("token"),
          },
          body: JSON.stringify(formDataToSubmit),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setNotification(data.message);
        toggleConsumablesPopup();
        onAssign();
      } else {
        setNotification(data.message);
      }
    } catch (error) {
      console.log(error);
    }
    setFilteredDoctors([]);
    setFilteredMedicines([]);
  };

  const handleDoctorInputChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, doctor: value });

    if (value.length > 2) {
      const filtered = doctorsList.filter((doctor) =>
        doctor.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setFormData({ ...formData, doctor: doctor.name, doctorId: doctor._id });
    setFilteredDoctors([]);
  };

  if (loading) return <div>Loading doctors...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="consumables-form-container">
      <h2 className="consumables-form-header">Add Consumables</h2>
      <form onSubmit={handleSubmit} className="consumables-form">
        {/* Add a header row for medication fields */}
        <div className="ipd-medication-input-header">
          <div>Medication Type</div>
          <div>Medicine Name</div>
          <div>Dosage</div>
          <div>Duration</div>
        </div>
        {medications.map((medication, index) => (
          <div key={index} className="ipd-medication-input-row">
            <select
              name="type"
              value={medication.type}
              onChange={(e) => handleInputChange(e, index)}
              required
            >
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Ointment">Ointment</option>
            </select>
            <input
              type="text"
              name="name"
              value={medication.name}
              onChange={(e) => handleInputChange(e, index)}
              placeholder="Medicine Name"
              required
            />
            {filteredMedicines.length > 0 && medication.name && (
              <ul className="medicine-suggestions" style={{position:"absolute", top: "34%",left: "31%", width: "250px"}}>
                {filteredMedicines.map((med) => (
                  <li
                    key={med._id}
                    onClick={() => handleMedicationSelect(med, index)}
                  >
                    {med.name}
                  </li>
                ))}
              </ul>
            )}
            <input
              type="text"
              name="dosage"
              value={medication.dosage}
              onChange={(e) => handleInputChange(e, index)}
              placeholder="(eg. 500mg)"
              required
            />
            <input
              type="text"
              name="duration"
              value={medication.duration}
              onChange={(e) => handleInputChange(e, index)}
              placeholder="(eg. 4 weeks)"
              required
            />
            <button
              type="button"
              className="remove-btn"
              onClick={() => handleRemoveRow(index)}
            >
              -
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddRow} className="add-row-button">
          +
        </button>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="doctor">Prescribed By</label>
            <input
              type="text"
              id="doctor"
              name="doctor"
              value={formData.doctor}
              onChange={handleDoctorInputChange}
              required
            />
            {filteredDoctors.length > 0 && (
              <ul className="doctor-suggestions">
                {filteredDoctors.map((doctor) => (
                  <li
                    key={doctor._id}
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    {doctor.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Consumables;
