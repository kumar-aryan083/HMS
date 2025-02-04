import React, { useState, useEffect } from "react";
import "./styles/EditMedicinePopup.css";
import { environment } from "../../../utlis/environment";

const EditMedicinePopup = ({ medicine, onClose, onUpdate }) => {
  const [name, setName] = useState(medicine.name);
  const [dosage, setDosage] = useState(medicine.dosage);
  const [frequency, setFrequency] = useState(medicine.frequency);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [medicationList, setMedicationList] = useState([]);

  const frequencyOptions = [
    { label: "Once a day (1 0 0)", value: "1 0 0" },
    { label: "Twice a day (1 1 0)", value: "1 1 0" },
    { label: "Three times a day (1 1 1)", value: "1 1 1" },
    { label: "Only morning (1 0 0)", value: "1 0 0" },
    { label: "Only afternoon (0 1 0)", value: "0 1 0" },
    { label: "Only evening (0 0 1)", value: "0 0 1" },
    { label: "Every 8 hours (1 1 1)", value: "1 1 1" },
    { label: "Every 12 hours (1 0 1)", value: "1 0 1" },
    { label: "As needed (0 0 0)", value: "0 0 0" },
  ];

  const fetchMedications = async () => {
    try {
      const response = await fetch(
        `${environment.url}/api/common/get-medications`,
        {
          method: "GET",
          headers: { token: localStorage.getItem("token") },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMedicationList(data.medications);
      }
    } catch (error) {
      console.error("Error fetching medications:", error);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleNameChange = (value) => {
    setName(value);
    if (value.length > 2) {
      const filtered = medicationList.filter((med) =>
        med.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMedicines(filtered);
    } else {
      setFilteredMedicines([]);
    }
  };

  const handleSelectMedicine = (med) => {
    setName(med.name);
    setFilteredMedicines([]); // Close suggestions list when item is selected
  };

  const handleUpdate = () => {
    onUpdate({ ...medicine, name, dosage, frequency });
  };

  return (
    <div className="edit-popup">
      <div className="edit-popup-content">
        <button className="opd-closeBtn" onClick={onClose}>
          X
        </button>
        <h2>Edit Medication</h2>
        <div>
          <label>Medicine Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Medicine Name"
          />
        </div>

        <ul
          className={`edit-medicine-suggestions ${
            filteredMedicines.length > 0 ? "show" : ""
          }`}
        >
          {filteredMedicines.map((med) => (
            <li key={med._id} onClick={() => handleSelectMedicine(med)}>
              {med.name}
            </li>
          ))}
        </ul>
        <div>
          <label>Dosage</label>
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="Dosage"
          />
        </div>
        <div>
          <label>Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            
          >
            <option value="">Select Frequency</option>
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleUpdate} className="update-med-btn">
          Update
        </button>
      </div>
    </div>
  );
};

export default EditMedicinePopup;
