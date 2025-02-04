import React, { useState, useEffect } from "react";
import "./styles/EditConsumablePopup.css";
import { environment } from "../../../utlis/environment";

const EditConsumablePopup = ({ medicine, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    type: medicine.type || "Tablet",
    name: medicine.name || "",
    dosage: medicine.dosage || "",
    duration: medicine.duration || "",
    doctor: medicine.doctor || "",
    doctorId: medicine.doctorId || "",
  });

  const [medicationList, setMedicationList] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const response = await fetch(
          `${environment.url}/api/pharmacy/get-medicines`,
          {
            headers: { token: localStorage.getItem("token") },
          }
        );
        const data = await response.json();
        if (response.ok) setMedicationList(data.items);
      } catch (error) {
        console.error("Failed to fetch medications:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          `${environment.url}/api/employee/get-doctors`,
          {
            headers: { token: localStorage.getItem("token") },
          }
        );
        const data = await response.json();
        if (response.ok) setDoctorsList(data.doctors);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
      }
    };

    fetchMedications();
    fetchDoctors();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value.length > 2) {
      const filtered = medicationList.filter((med) =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else if (name === "doctor" && value.length > 2) {
      const filtered = doctorsList.filter((doc) =>
        doc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredMedicines([]);
      setFilteredDoctors([]);
    }
  };

  const handleMedicationSelect = (medication) => {
    setFormData((prev) => ({ ...prev, name: medication.name }));
    setFilteredMedicines([]);
  };

  const handleDoctorSelect = (doctor) => {
    setFormData((prev) => ({
      ...prev,
      doctor: doctor.name,
      doctorId: doctor._id,
    }));
    setFilteredDoctors([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ ...medicine, formData });
    onClose();
  };

  return (
    <div className="consumable-edit-popup">
      <div className="consumable-edit-popup-content" style={{height: "62%"}}>
        <button className="consumable-edit-close-popup-btn" onClick={onClose}>
          X
        </button>
        <h2>Edit Medicine</h2>
        <form onSubmit={handleSubmit} className="edit-consumable-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Medication Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="name">Medicine Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Search Medicine"
                required
              />
              {filteredMedicines.length > 0 && (
                <ul className="suggestions">
                  {filteredMedicines.map((med) => (
                    <li
                      key={med._id}
                      onClick={() => handleMedicationSelect(med)}
                    >
                      {med.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dosage">Dosage</label>
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleInputChange}
                placeholder="e.g., 500mg"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 5 days"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="doctor">Assigned By</label>
              <input
                type="text"
                id="doctor"
                name="doctor"
                value={formData.doctor}
                onChange={handleInputChange}
                placeholder="Search Doctor"
                required
              />
              {filteredDoctors.length > 0 && (
                <ul className="suggestions">
                  {filteredDoctors.map((doc) => (
                    <li key={doc._id} onClick={() => handleDoctorSelect(doc)}>
                      {doc.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button type="submit" className="submit-btn" style={{backgroundColor: "var(--secondBase)"}}>
            Update Medicine
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditConsumablePopup;
